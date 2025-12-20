package com.jobportal.gateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    @Value("${jwt.secret}")
    private String jwtSecret;

    private final List<String> openEndpoints = List.of(
            "/api/auth/register",
            "/api/auth/login",
            "/api/jobs/search",
            "/api/jobs/public"
    );

    // Patterns that should be accessible without authentication (with dynamic IDs)
    private final List<String> openPatterns = List.of(
            "/api/jobs/\\d+"  // Allow access to individual jobs by ID
    );

    public AuthenticationFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            String path = request.getURI().getPath();
            String method = request.getMethod().name();

            // Check if the endpoint is public (only GET requests for job details)
            if (isOpenEndpoint(path, method)) {
                // Even for public endpoints, if token is present, extract user info
                if (request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                    String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
                    if (authHeader != null && authHeader.startsWith("Bearer ")) {
                        String token = authHeader.substring(7);
                        try {
                            Claims claims = validateToken(token);
                            ServerHttpRequest modifiedRequest = request.mutate()
                                    .header("X-User-Id", claims.getSubject())
                                    .header("X-User-Email", claims.get("email", String.class))
                                    .header("X-User-Role", claims.get("role", String.class))
                                    .build();
                            return chain.filter(exchange.mutate().request(modifiedRequest).build());
                        } catch (Exception e) {
                            // Token invalid, continue without user info
                        }
                    }
                }
                return chain.filter(exchange);
            }

            // Check for Authorization header
            if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                return onError(exchange, "Missing authorization header", HttpStatus.UNAUTHORIZED);
            }

            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return onError(exchange, "Invalid authorization header", HttpStatus.UNAUTHORIZED);
            }

            String token = authHeader.substring(7);

            try {
                Claims claims = validateToken(token);
                
                // Add user info to headers for downstream services
                ServerHttpRequest modifiedRequest = request.mutate()
                        .header("X-User-Id", claims.getSubject())
                        .header("X-User-Email", claims.get("email", String.class))
                        .header("X-User-Role", claims.get("role", String.class))
                        .build();

                return chain.filter(exchange.mutate().request(modifiedRequest).build());
            } catch (Exception e) {
                return onError(exchange, "Invalid or expired token", HttpStatus.UNAUTHORIZED);
            }
        };
    }

    private boolean isOpenEndpoint(String path, String method) {
        // Check exact prefix matches (always open)
        if (openEndpoints.stream().anyMatch(path::startsWith)) {
            return true;
        }
        // Check regex patterns - only for GET requests (viewing job details)
        if ("GET".equalsIgnoreCase(method)) {
            return openPatterns.stream().anyMatch(pattern -> path.matches(pattern));
        }
        return false;
    }

    private Claims validateToken(String token) {
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private Mono<Void> onError(ServerWebExchange exchange, String message, HttpStatus status) {
        exchange.getResponse().setStatusCode(status);
        return exchange.getResponse().setComplete();
    }

    public static class Config {
        // Configuration properties if needed
    }
}
