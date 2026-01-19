<template>
  <div class="home">
    <div class="hero-section">
      <div class="hero-content">
        <h1>🗺️ CarteMada</h1>
        <h2>Système de Gestion des Problèmes Routiers</h2>
        <p>Visualisez et suivez les problèmes d'infrastructure routière à Madagascar</p>

        <div class="features">
          <div class="feature-card">
            <div class="feature-icon">📍</div>
            <h3>Localisation Précise</h3>
            <p>Identifiez les problèmes routiers sur une carte interactive</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <h3>Suivi en Temps Réel</h3>
            <p>Suivez le statut des réparations (nouveau, en cours, terminé)</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">💰</div>
            <h3>Gestion Budgétaire</h3>
            <p>Consultez les budgets alloués et les entreprises responsables</p>
          </div>
        </div>

        <div class="cta-buttons">
          <RouterLink to="/road-problems" class="btn btn-primary">
            Voir la Carte des Problèmes
          </RouterLink>
          <RouterLink to="/about" class="btn btn-secondary">
            En Savoir Plus
          </RouterLink>
        </div>
      </div>
    </div>

    <div class="stats-section">
      <div class="stats-container">
        <div class="stat-item">
          <div class="stat-number">6</div>
          <div class="stat-label">Problèmes Signalés</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">2</div>
          <div class="stat-label">En Cours de Réparation</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">2</div>
          <div class="stat-label">Problèmes Résolus</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">413k</div>
          <div class="stat-label">Budget Total (MGA)</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomeView'
}
</script>

<style scoped>
.home {
  min-height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.hero-section {
  padding: 80px 20px;
  text-align: center;
  color: white;
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
}

.hero-content h1 {
  font-size: 3.5rem;
  margin-bottom: 10px;
  font-weight: 700;
}

.hero-content h2 {
  font-size: 2rem;
  margin-bottom: 20px;
  font-weight: 300;
  opacity: 0.9;
}

.hero-content p {
  font-size: 1.2rem;
  margin-bottom: 60px;
  opacity: 0.8;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-bottom: 60px;
}

.feature-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 30px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.feature-card h3 {
  font-size: 1.5rem;
  margin-bottom: 15px;
  font-weight: 600;
}

.feature-card p {
  opacity: 0.8;
  line-height: 1.6;
}

.cta-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  padding: 15px 30px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(52, 152, 219, 0.4);
}

.btn-secondary {
  background: transparent;
  color: white;
  border: 2px solid white;
}

.btn-secondary:hover {
  background: white;
  color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 255, 255, 0.3);
}

.stats-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 40px 20px;
}

.stats-container {
  max-width: 1000px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 30px;
  text-align: center;
  color: white;
}

.stat-item {
  padding: 20px;
}

.stat-number {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 10px;
}

.stat-label {
  font-size: 1.1rem;
  opacity: 0.8;
}

@media (max-width: 768px) {
  .hero-content h1 {
    font-size: 2.5rem;
  }

  .hero-content h2 {
    font-size: 1.5rem;
  }

  .features {
    grid-template-columns: 1fr;
  }

  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }

  .btn {
    width: 250px;
  }
}
</style>
