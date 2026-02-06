package com.isicod.currencyconverter.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component // Filtre Spring géré par le conteneur
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    // Fournisseur de gestion des tokens JWT
    private final JwtTokenProvider jwtTokenProvider;
    
    // Service pour charger les utilisateurs depuis la base de données
    private final UserDetailsService userDetailsService;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                   HttpServletResponse response,
                                   FilterChain filterChain) 
            throws ServletException, IOException {
        
        try {
            // Extraction du token JWT depuis l’en-tête Authorization
            String jwt = parseJwt(request);
            
            if (jwt != null && jwtTokenProvider.validateToken(jwt)) {
                // Récupération du username depuis le token
                String username = jwtTokenProvider.extractUsername(jwt);
                
                // Vérifier si l’utilisateur n’est pas déjà authentifié
                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    // Chargement des informations de l’utilisateur
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                    
                    // Validation finale du token
                    if (jwtTokenProvider.isTokenValid(jwt, userDetails)) {
                        // Création de l’objet d’authentification
                        UsernamePasswordAuthenticationToken authToken = 
                            new UsernamePasswordAuthenticationToken(
                                userDetails, 
                                null, 
                                userDetails.getAuthorities()
                            );
                        
                        // Ajout des détails de la requête
                        authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                        );
                        
                        // Stocker l’authentification dans le contexte de sécurité
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Cannot set user authentication: {}", e.getMessage());
        }
        
        // Continuer la chaîne des filtres
        filterChain.doFilter(request, response);
    }
    
    // Extraction du token JWT depuis le header Authorization
    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        
        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }
        
        return null;
    }
}
