package dev.lms.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtCore jwtTokenUtil;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        final String jwtToken;


        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        jwtToken = authHeader.substring(7);
        Authentication auth = null;

        if (jwtToken != null && jwtTokenUtil.validateToken(jwtToken)) {
            String userType = jwtTokenUtil.getUserTypeFromToken(jwtToken);

            if ("WORKER".equals(userType)) {
                String role = jwtTokenUtil.getRoleFromToken(jwtToken);
                auth = new UsernamePasswordAuthenticationToken(
                        jwtTokenUtil.getEmailFromToken(jwtToken),
                        null,
                        Collections.singleton(new SimpleGrantedAuthority("ROLE_" + role))
                );
            } else {
                auth = new UsernamePasswordAuthenticationToken(
                        jwtTokenUtil.getEmailFromToken(jwtToken),
                        null,
                        Collections.emptyList()
                );
            }
            SecurityContextHolder.getContext().setAuthentication(auth);
            filterChain.doFilter(request, response);
        }
    }
}