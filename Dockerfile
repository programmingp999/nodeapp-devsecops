# Utilise une version légère de Node.js [cite: 211]
FROM node:20-alpine

# Définit le dossier de travail dans le conteneur [cite: 211]
WORKDIR /app

# Copie les fichiers de dépendances et les installe [cite: 211]
COPY package*.json ./
RUN npm ci --only=production [cite: 211]

# Copie le reste du code (app.js) [cite: 211]
COPY app.js .

# Sécurité : on crée un utilisateur non-root pour l'exécution [cite: 211]
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# L'app écoute sur le port 3000 [cite: 211]
EXPOSE 3000

# Vérification de l'état de santé de l'app [cite: 211]
HEALTHCHECK --interval=30s --timeout=5s \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "app.js"] [cite: 211]