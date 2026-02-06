package com.isicod.currencyconverter.config;

import lombok.RequiredArgsConstructor;

import static org.springframework.security.config.Customizer.withDefaults;

import java.time.LocalDateTime;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.isicod.currencyconverter.enums.Role;
import com.isicod.currencyconverter.model.User;
import com.isicod.currencyconverter.repository.UserRepository;

@Configuration // Classe de configuration Spring
@EnableWebSecurity // Activation de Spring Security
@EnableMethodSecurity // Autorise la sécurité au niveau des méthodes
@RequiredArgsConstructor
public class SecurityConfig {
    
    // Filtre JWT pour vérifier le token à chaque requête
    private final JwtAuthenticationFilter jwtAuthFilter;
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(withDefaults())   // Activation de CORS
            .csrf(csrf -> csrf.disable()) // Désactivation de CSRF (API REST)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll() // Accès public (login/register)
                .requestMatchers("/api/admin/**").hasRole("ADMIN") // Accès réservé à l’admin
                .anyRequest().authenticated() // Le reste nécessite une authentification
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS) // Pas de session (JWT)
            )
            // Ajout du filtre JWT avant l’authentification classique
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    
    @Bean
    public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
        org.springframework.web.cors.CorsConfiguration config =
                new org.springframework.web.cors.CorsConfiguration();

        // Autorise les credentials (cookies, headers d’authentification)
        config.setAllowCredentials(true);
        // Autorise Angular en local
        config.addAllowedOrigin("http://localhost:4200");
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");

        org.springframework.web.cors.UrlBasedCorsConfigurationSource source =
                new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    
    // Fournit l’AuthenticationManager utilisé pour l’authentification
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
    
    // Encodage des mots de passe avec BCrypt
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    // Création automatique d’un compte admin au démarrage
    @Bean
    CommandLineRunner initAdmin(
            UserRepository repo,
            PasswordEncoder encoder
    ) {
        return args -> {
            if (!repo.existsByEmail("admin@bank.com")) {
                User admin = new User();
                admin.setEmail("admin@bank.com");
                admin.setFullName("Admin");
                admin.setHashPassword(encoder.encode("admin123"));
                admin.setRole(Role.ADMIN);
                admin.setCreatedAt(LocalDateTime.now());
                admin.setPhoneNumber("0606317283");
                repo.save(admin);
            }
        };
    }
}
