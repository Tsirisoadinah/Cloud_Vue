# Étape 1 : Utiliser Node 22 pour le dev
FROM node:22-alpine

# Définir le dossier de travail
WORKDIR /app

# Copier uniquement les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste du code source
COPY . .

# Exposer le port de développement Vite (5173 par défaut)
EXPOSE 5173

# Démarrer le serveur de développement
CMD ["npm", "run", "dev"]
