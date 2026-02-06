package com.isicod.currencyconverter.controller;


import com.isicod.currencyconverter.dto.*;
import com.isicod.currencyconverter.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;
    
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(
            ApiResponse.success("Inscription réussie", response)
        );
    }
    
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(
            ApiResponse.success("Connexion réussie", response)
        );
    }
    
    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(
            @Valid @RequestBody RefreshTokenRequest request) {
        
        AuthResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(
            ApiResponse.success("Token rafraîchi", response)
        );
    }
    
    @PostMapping("/logout")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> logout(
            @RequestHeader("Authorization") String token) {
        
        String actualToken = token.replace("Bearer ", "");
        authService.logout(actualToken);
        
        return ResponseEntity.ok(
            ApiResponse.success("Déconnexion réussie", null)
        );
    }
    
    @GetMapping("/profile")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponseDTO>> getProfile(
            @RequestParam Long userId) {
        
        UserResponseDTO profile = authService.getProfile(userId);
        return ResponseEntity.ok(
            ApiResponse.success("Profil récupéré", profile)
        );
    }
    
    @PutMapping("/profile")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponseDTO>> updateProfile(
            @RequestParam Long userId,
            @Valid @RequestBody UpdateProfileRequest request) {
        
        UserResponseDTO updatedProfile = authService.updateProfile(userId, request);
        return ResponseEntity.ok(
            ApiResponse.success("Profil mis à jour", updatedProfile)
        );
    }
    
    @PostMapping("/change-password")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> changePassword(
            @RequestParam Long userId,
            @Valid @RequestBody ChangePasswordRequest request) {
        
        authService.changePassword(userId, request);
        return ResponseEntity.ok(
            ApiResponse.success("Mot de passe changé avec succès", null)
        );
    }
    
    @PostMapping("/request-password-reset")
    public ResponseEntity<ApiResponse<String>> requestPasswordReset(
            @RequestParam String email) {
        
        authService.requestPasswordReset(email);
        return ResponseEntity.ok(
            ApiResponse.success("Demande de réinitialisation envoyée", null)
        );
    }
    
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        
        authService.resetPassword(request);
        return ResponseEntity.ok(
            ApiResponse.success("Mot de passe réinitialisé avec succès", null)
        );
    }
    
    @GetMapping("/verify-token")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TokenVerification>> verifyToken(
            @RequestHeader("Authorization") String token) {
        
        String actualToken = token.replace("Bearer ", "");
        
        TokenVerification verification = TokenVerification.builder()
            .valid(true)
            .message("Token valide")
            .build();
        
        return ResponseEntity.ok(
            ApiResponse.success("Token vérifié", verification)
        );
    }
    
    @lombok.Data
    @lombok.Builder
    public static class TokenVerification {
        private boolean valid;
        private String message;
        private Long expiresIn;
    }
}