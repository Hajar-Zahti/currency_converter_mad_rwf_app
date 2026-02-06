package com.isicod.currencyconverter.dto;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
 @NotBlank(message = "L'email est requis")
 @Email(message = "Email invalide")
 private String email;
 
 @NotBlank(message = "Le mot de passe est requis")
 @Size(min = 6, message = "Le mot de passe doit avoir au moins 6 caractères")
 private String password;
 
 @NotBlank(message = "Le nom complet est requis")
 private String fullName;
 
 private String phoneNumber;
}