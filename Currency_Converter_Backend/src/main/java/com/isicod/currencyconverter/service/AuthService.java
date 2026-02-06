package com.isicod.currencyconverter.service;


import com.isicod.currencyconverter.dto.*;

import com.isicod.currencyconverter.enums.Role;
import com.isicod.currencyconverter.model.User;
import com.isicod.currencyconverter.repository.UserRepository;

import io.jsonwebtoken.Claims;

import com.isicod.currencyconverter.config.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final CustomUserDetailsService userDetailsService;
    private final AuditLogService auditLogService;
    private final BankAccountService bankAccountService;
    
    public AuthResponse register(RegisterRequest request) {
        log.info("Registering new user: {}", request.getEmail());
        
        // Vérifier si l'utilisateur existe déjà
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email déjà utilisé");
        }
        
        // Créer l'utilisateur
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setRole(Role.USER);
        user.setIsActive(true);
        user.setCreatedAt(LocalDateTime.now());
        
        User savedUser = userRepository.save(user);
        bankAccountService.createDefaultAccounts(savedUser);

        
        // Générer le token JWT
        UserDetails userDetails = userDetailsService.loadUserByUsername(savedUser.getEmail());
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("userId", savedUser.getId());
        extraClaims.put("role", savedUser.getRole().name());
        extraClaims.put("fullName", savedUser.getFullName());
        
        String accessToken = jwtTokenProvider.generateToken(extraClaims, userDetails);
        String refreshToken = jwtTokenProvider.generateRefreshToken(userDetails);
        
        // Log d'audit
        auditLogService.logUserAction(savedUser, "REGISTER", 
            "Nouvel utilisateur enregistré");
        
        log.info("User registered successfully: {}", savedUser.getId());
        
        return AuthResponse.builder()
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .tokenType("Bearer")
            .expiresIn(jwtTokenProvider.getJwtExpiration() / 1000) // en secondes
            .user(mapToUserResponse(savedUser))
            .build();
    }
    
    public AuthResponse login(LoginRequest request) {
        log.info("Login attempt for user: {}", request.getEmail());
        
        // Authentifier l'utilisateur
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getEmail(),
                request.getPassword()
            )
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        
        // Récupérer l'utilisateur de la base de données
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        // Mettre à jour la dernière connexion
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);
        
        // Générer les tokens
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("userId", user.getId());
        extraClaims.put("role", user.getRole().name());
        extraClaims.put("fullName", user.getFullName());
        
        String accessToken = jwtTokenProvider.generateToken(extraClaims, userDetails);
        String refreshToken = jwtTokenProvider.generateRefreshToken(userDetails);
        
        // Log d'audit
        auditLogService.logUserAction(user, "LOGIN", 
            "Connexion réussie");
        
        log.info("Login successful for user: {}", user.getEmail());
        
        return AuthResponse.builder()
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .tokenType("Bearer")
            .expiresIn(jwtTokenProvider.getJwtExpiration() / 1000)
            .user(mapToUserResponse(user))
            .build();
    }
    
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();
        
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new RuntimeException("Refresh token invalide");
        }
        
        String email = jwtTokenProvider.extractUsername(refreshToken);
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        
        // Récupérer l'utilisateur
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        // Générer un nouveau access token
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("userId", user.getId());
        extraClaims.put("role", user.getRole().name());
        extraClaims.put("fullName", user.getFullName());
        
        String newAccessToken = jwtTokenProvider.generateToken(extraClaims, userDetails);
        
        // Log d'audit
        auditLogService.logUserAction(user, "REFRESH_TOKEN", 
            "Token rafraîchi");
        
        return AuthResponse.builder()
            .accessToken(newAccessToken)
            .refreshToken(refreshToken) // Même refresh token
            .tokenType("Bearer")
            .expiresIn(jwtTokenProvider.getJwtExpiration() / 1000)
            .user(mapToUserResponse(user))
            .build();
    }
    
    public void logout(String token) {
        // Extraire l'email du token
        String email = jwtTokenProvider.extractUsername(token);
        
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        // Log d'audit
        auditLogService.logUserAction(user, "LOGOUT", 
            "Déconnexion de l'utilisateur");
        
        log.info("User logged out: {}", user.getEmail());
    }
    
    public UserResponseDTO getProfile(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        return mapToUserResponse(user);
    }
    
    public UserResponseDTO updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        // Mettre à jour les informations
        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }
        
        // Si un nouveau mot de passe est fourni
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }
        
        User updatedUser = userRepository.save(user);
        
        auditLogService.logUserAction(user, "UPDATE_PROFILE", 
            "Profil mis à jour");
        
        return mapToUserResponse(updatedUser);
    }
    
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        // Vérifier l'ancien mot de passe
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Ancien mot de passe incorrect");
        }
        
        // Mettre à jour le mot de passe
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        
        auditLogService.logUserAction(user, "CHANGE_PASSWORD", 
            "Mot de passe changé");
        
        log.info("Password changed for user: {}", user.getEmail());
    }
    
    public void requestPasswordReset(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        // Générer un token de réinitialisation
        String resetToken = jwtTokenProvider.generateToken(
            Map.of("reset", true, "userId", user.getId()), 
            userDetailsService.loadUserByUsername(email)
        );
        
        // Envoyer l'email de réinitialisation
        log.info("Password reset requested for user: {}. Token: {}", email, resetToken);
        
        auditLogService.logUserAction(user, "REQUEST_PASSWORD_RESET", 
            "Demande de réinitialisation de mot de passe");
    }
    
    public void resetPassword(ResetPasswordRequest request) {
        if (!jwtTokenProvider.validateToken(request.getToken())) {
            throw new RuntimeException("Token de réinitialisation invalide");
        }
        
        Claims claims = jwtTokenProvider.extractAllClaims(request.getToken());
        if (!claims.get("reset", Boolean.class)) {
            throw new RuntimeException("Token invalide pour la réinitialisation");
        }
        
        Long userId = claims.get("userId", Long.class);
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        // Mettre à jour le mot de passe
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        
        auditLogService.logUserAction(user, "RESET_PASSWORD", 
            "Mot de passe réinitialisé");
        
        log.info("Password reset for user: {}", user.getEmail());
    }
    
    private UserResponseDTO mapToUserResponse(User user) {
        return UserResponseDTO.builder()
            .id(user.getId())
            .email(user.getEmail())
            .fullName(user.getFullName())
            .phoneNumber(user.getPhoneNumber())
            .role(user.getRole().name())
            .isActive(user.getIsActive())
            .createdAt(user.getCreatedAt())
            .lastLogin(user.getLastLogin())
            .build();
    }
}