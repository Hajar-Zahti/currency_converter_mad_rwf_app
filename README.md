# 💱 Currency Converter MAD ⇄ RWF

Application complète de conversion de devises entre le Dirham Marocain (MAD) et le Franc Rwandais (RWF).

## 📱 Description
Cette application permet :
- La conversion instantanée entre MAD et RWF
- La gestion des utilisateurs
- Le suivi des transactions
- Une interface admin pour la supervision
---
## 🌍 API de taux de change

L’application utilise l’API ExchangeRate.host comme source externe de taux de change.

-API gratuite 

-Taux mis à jour en temps réel

-Utilisée pour le calcul des conversions MAD ⇄ RWF

-Une marge est appliquée selon le sens de conversion côté backend

---

## 🏗️ Architecture du projet

Le projet est composé de trois parties :

## 📱 Application Mobile (Utilisateur)
-Gestion des dépôts, conversions, transactions et statistiques.

## 🔙 Backend (API REST)

- Gestion de l’authentification

- Gestion des règles de conversion

- Gestion des transactions et des utilisateurs

- Synchronisation bancaire interne

## 🌐 Dashboard Web (Admin)

- Supervision des utilisateurs

- Gestion des transactions

- Consultation des logs

- Statistiques globales

## ⚙️ Technologies utilisées

### 🔙 Backend
- Java 17
- Spring Boot
- Spring Security
- JPA / Hibernate
- MySQL

### 📱 Mobile
- React Native
- Expo

### 🌐 Admin
- Angular
- TypeScript
  

---
### 🔐 Authentification
- JWT pour sécuriser les échanges entre le mobile, l’admin et le backend.


## 🧰 Outils de développement

- Spring Tool Suite (STS)
- Visual Studio Code
- Expo Go
- Postman
- Git & GitHub

## ▶️ Lancer le projet

### Backend - Mobile - Admin web
```bash
cd Currency_Converter_Backend
mvn spring-boot:run



cd currency-converter-app
npm install
expo start



cd currency-converter-admin-dashboard
npm install
ng serve
