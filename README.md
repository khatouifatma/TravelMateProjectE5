# 🌍 TravelMate

## 👥 Membres du groupe

* **Fatma Khatoui** — ESTIAM Lyon
* **Ghaya Zaabi** — ESTIAM Paris

---

## 📱 Présentation du projet

**TravelMate** est une application mobile développée avec **React Native (Expo)** permettant aux utilisateurs de gérer, organiser et revivre leurs voyages à travers une expérience riche et intuitive.

L'application combine la gestion de voyages, un journal personnel, des fonctionnalités sociales (favoris) et une visualisation cartographique interactive.

---

## ⚙️ Installation et lancement du projet

### 🔹 Prérequis

* Node.js
* npm
* Expo CLI
* Un émulateur Android / iOS ou l’application **Expo Go** sur mobile

---

### 🔹 Installation du frontend (application mobile)

```bash
npm install
```

Puis lancer l’application avec :

```bash
npx expo start
```

➡️ Vous pouvez ensuite :

* lancer l’application sur un **émulateur Android / iOS**
* ou scanner le QR code avec **Expo Go**

---

### 🔹 Installation du backend (obligatoire)

Le backend est fourni dans un projet séparé :

📦 **TravelMateProjectBackend**

1. Cloner ou récupérer le projet backend
2. Installer les dépendances :

```bash
npm install
```

3. Lancer le serveur :

```bash
npm start
```

⚠️ Le backend doit impérativement être lancé pour que l’application fonctionne correctement.

---

## ✨ Fonctionnalités principales

### 🧳 Gestion des voyages

* Création et affichage des voyages
* Accès à un **écran de détail complet** pour chaque voyage
* Visualisation des informations clés

---

### 📄 Écran détail voyage

* Affichage détaillé d’un voyage sélectionné
* Galerie de photos associées au voyage
* Liste des activités planifiées
* Notes et journal liés au voyage

---

### 🛠️ CRUD des activités

* Création d’activités pour un voyage
* Modification des activités existantes
* Suppression d’activités

---

### 📓 Journal de voyage

* Système de **notes personnelles** par voyage
* Chaque note contient :

  * une date
  * un contenu textuel riche
* Permet de conserver souvenirs, impressions et informations importantes

---

### ⭐ Favoris

* Possibilité de **marquer un voyage comme favori**
* Accès à une **liste dédiée des voyages favoris**
* Facilite la navigation et la mise en avant des voyages importants

---

### 🔍 Recherche, filtres et tri

* Recherche de voyages par **destination**
* Filtres disponibles :

  * voyages à venir
  * voyages passés
  * voyages favoris
* Tri des voyages par date :

  * du plus récent au plus ancien
  * du plus ancien au plus récent

---

### 👤 Profil utilisateur

* Consultation et modification du profil utilisateur
* Upload d’un **avatar**
* Statistiques personnelles :

  * nombre total de voyages
  * nombre de photos
  * nombre de pays visités

---

### 🗺️ Carte interactive

* Affichage des voyages sur une **carte interactive**
* Visualisation géographique des destinations
* Améliore la compréhension globale des voyages effectués

---

### 🌗 Mode sombre

* Support natif du **mode sombre**
* Le thème s’adapte automatiquement au **mode de l’appareil** (clair / sombre)
* Possibilité de basculer manuellement entre les modes depuis l’application

---

## 🚀 Technologies utilisées

* **React Native** (Expo)
* **Expo Router**
* **Context API**
* **Node.js / Express** (backend)
* **JWT** pour l’authentification



