const express    = require('express');
const promClient = require('prom-client');

const app = express();
const register = promClient.register;

// Active la collecte des métriques par défaut (CPU, RAM, Event Loop) [cite: 192]
promClient.collectDefaultMetrics({ register });

// Création d'un compteur pour le total des requêtes HTTP [cite: 194, 196]
const httpTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total requêtes HTTP',
  labelNames: ['method', 'route', 'status'],
});

// Création d'un histogramme pour mesurer la durée (latence) des requêtes [cite: 200, 202]
const httpDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Durée des requêtes HTTP',
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1], // Tranches de temps en secondes [cite: 204]
});

// Middleware pour enregistrer les données de chaque requête
app.use((req, res, next) => {
  const end = httpDuration.startTimer();
  res.on('finish', () => {
    httpTotal.inc({ method: req.method, route: req.path, status: res.statusCode });
    end();
  });
  next();
});

// Routes de l'application
app.get('/', (req, res) => res.json({ message: 'Hello DevSecOps!' }));
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// L'endpoint CRITIQUE que Prometheus viendra lire [cite: 205, 206]
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.listen(3000, () => console.log('App démarrée sur http://localhost:3000'));