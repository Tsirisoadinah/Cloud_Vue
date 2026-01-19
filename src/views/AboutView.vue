<template>
  <div class="about">
    <div class="container">
      <div class="page-header">
        <h1>📊 Tableau de Bord</h1>
        <p>Récapitulatif des problèmes routiers et de leur avancement</p>
      </div>

      <!-- Tableau de récapitulation principal -->
      <div class="summary-card">
        <h2>📋 Récapitulatif Général</h2>
        <div class="summary-table">
          <div class="summary-row header">
            <div class="summary-cell">Métrique</div>
            <div class="summary-cell">Valeur</div>
            <div class="summary-cell">Détails</div>
          </div>

          <div class="summary-row">
            <div class="summary-cell">
              <span class="metric-icon">📍</span>
              Nombre de Points
            </div>
            <div class="summary-cell value">{{ totalProblems }}</div>
            <div class="summary-cell details">Problèmes signalés</div>
          </div>

          <div class="summary-row">
            <div class="summary-cell">
              <span class="metric-icon">📐</span>
              Surface Totale
            </div>
            <div class="summary-cell value">{{ totalSurface }} m²</div>
            <div class="summary-cell details">Surface à traiter</div>
          </div>

          <div class="summary-row">
            <div class="summary-cell">
              <span class="metric-icon">📈</span>
              Avancement
            </div>
            <div class="summary-cell value">
              <span class="progress-badge" :class="getProgressClass(progressPercentage)">
                {{ progressPercentage }}%
              </span>
            </div>
            <div class="summary-cell details">Travaux complétés</div>
          </div>

          <div class="summary-row">
            <div class="summary-cell">
              <span class="metric-icon">💰</span>
              Budget Total
            </div>
            <div class="summary-cell value">{{ formatCurrency(totalBudget) }}</div>
            <div class="summary-cell details">Investissement total</div>
          </div>
        </div>
      </div>

      <!-- Répartition par statut -->
      <div class="status-breakdown">
        <h2>🎯 Répartition par Statut</h2>
        <div class="status-grid">
          <div class="status-card nouveau">
            <div class="status-header">
              <span class="status-dot nouveau"></span>
              <h3>Nouveaux</h3>
            </div>
            <div class="status-stats">
              <div class="big-number">{{ statusCounts.nouveau }}</div>
              <div class="stat-detail">
                <p>{{ formatCurrency(statusBudgets.nouveau) }}</p>
                <p>{{ statusSurfaces.nouveau }} m²</p>
              </div>
            </div>
          </div>

          <div class="status-card en-cours">
            <div class="status-header">
              <span class="status-dot en-cours"></span>
              <h3>En Cours</h3>
            </div>
            <div class="status-stats">
              <div class="big-number">{{ statusCounts['en-cours'] }}</div>
              <div class="stat-detail">
                <p>{{ formatCurrency(statusBudgets['en-cours']) }}</p>
                <p>{{ statusSurfaces['en-cours'] }} m²</p>
              </div>
            </div>
          </div>

          <div class="status-card termine">
            <div class="status-header">
              <span class="status-dot termine"></span>
              <h3>Terminés</h3>
            </div>
            <div class="status-stats">
              <div class="big-number">{{ statusCounts.termine }}</div>
              <div class="stat-detail">
                <p>{{ formatCurrency(statusBudgets.termine) }}</p>
                <p>{{ statusSurfaces.termine }} m²</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Barre de progression visuelle -->
      <div class="progress-section">
        <h2>📊 Progression des Travaux</h2>
        <div class="progress-container">
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: progressPercentage + '%' }"
            ></div>
          </div>
          <div class="progress-labels">
            <span>0%</span>
            <span>{{ progressPercentage }}% complété</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      <!-- Informations supplémentaires -->
      <div class="additional-info">
        <h2>ℹ️ Informations Complémentaires</h2>
        <div class="info-grid">
          <div class="info-item">
            <h3>🏢 Entreprises Impliquées</h3>
            <ul>
              <li v-for="entreprise in uniqueEntreprises" :key="entreprise">
                {{ entreprise }}
              </li>
            </ul>
          </div>

          <div class="info-item">
            <h3>📅 Période d'Analyse</h3>
            <p>Dernière mise à jour: {{ lastUpdated }}</p>
            <p>Données en temps réel</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AboutView',
  data() {
    return {
      // Données fictives - à remplacer par des appels API backend
      roadProblems: [
        {
          id: 1,
          type: 'Nid de poule',
          lat: -18.8792,
          lng: 47.5079,
          date: '2024-01-15',
          status: 'nouveau',
          surface: 15.5,
          budget: 25000,
          entreprise: 'BTP Madagascar'
        },
        {
          id: 2,
          type: 'Fissure chaussée',
          lat: -18.8850,
          lng: 47.5150,
          date: '2024-01-10',
          status: 'en-cours',
          surface: 45.2,
          budget: 75000,
          entreprise: 'Routes & Travaux'
        },
        {
          id: 3,
          type: 'Affaissement',
          lat: -18.8720,
          lng: 47.5200,
          date: '2024-01-08',
          status: 'termine',
          surface: 28.7,
          budget: 50000,
          entreprise: 'Construction Malagasy'
        },
        {
          id: 4,
          type: 'Usure revêtement',
          lat: -18.8900,
          lng: 47.5100,
          date: '2024-01-20',
          status: 'nouveau',
          surface: 120.0,
          budget: 150000,
          entreprise: 'Infraroutes'
        },
        {
          id: 5,
          type: 'Trou dans chaussée',
          lat: -18.8750,
          lng: 47.5300,
          date: '2024-01-12',
          status: 'en-cours',
          surface: 8.3,
          budget: 18000,
          entreprise: 'BTP Madagascar'
        },
        {
          id: 6,
          type: 'Déformation',
          lat: -18.8650,
          lng: 47.5050,
          date: '2023-12-28',
          status: 'termine',
          surface: 67.9,
          budget: 95000,
          entreprise: 'Routes & Travaux'
        }
      ]
    }
  },
  computed: {
    totalProblems() {
      return this.roadProblems.length
    },

    totalSurface() {
      return this.roadProblems.reduce((sum, problem) => sum + problem.surface, 0).toFixed(1)
    },

    totalBudget() {
      return this.roadProblems.reduce((sum, problem) => sum + problem.budget, 0)
    },

    statusCounts() {
      return this.roadProblems.reduce((counts, problem) => {
        counts[problem.status] = (counts[problem.status] || 0) + 1
        return counts
      }, {})
    },

    statusSurfaces() {
      return this.roadProblems.reduce((surfaces, problem) => {
        surfaces[problem.status] = (surfaces[problem.status] || 0) + problem.surface
        return surfaces
      }, {})
    },

    statusBudgets() {
      return this.roadProblems.reduce((budgets, problem) => {
        budgets[problem.status] = (budgets[problem.status] || 0) + problem.budget
        return budgets
      }, {})
    },

    progressPercentage() {
      const completed = this.statusCounts.termine || 0
      const inProgress = (this.statusCounts['en-cours'] || 0) * 0.5 // 50% de crédit pour en cours
      return Math.round(((completed + inProgress) / this.totalProblems) * 100)
    },

    uniqueEntreprises() {
      return [...new Set(this.roadProblems.map(p => p.entreprise))]
    },

    lastUpdated() {
      return new Date().toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  },
  methods: {
    formatCurrency(amount) {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'MGA',
        minimumFractionDigits: 0
      }).format(amount)
    },

    getProgressClass(percentage) {
      if (percentage >= 80) return 'high'
      if (percentage >= 50) return 'medium'
      return 'low'
    }
  }
}
</script>

<style scoped>
.about {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
  color: #2c3e50;
}

.page-header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.page-header p {
  font-size: 1.2rem;
  opacity: 0.8;
}

.summary-card {
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  margin-bottom: 30px;
}

.summary-card h2 {
  color: #2c3e50;
  margin-bottom: 25px;
  font-size: 1.8rem;
}

.summary-table {
  display: grid;
  gap: 1px;
  background: #e9ecef;
  border-radius: 8px;
  overflow: hidden;
}

.summary-row {
  display: grid;
  grid-template-columns: 2fr 1fr 2fr;
  background: white;
}

.summary-row.header {
  background: #343a40;
  color: white;
  font-weight: bold;
}

.summary-cell {
  padding: 15px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.summary-cell.value {
  font-size: 1.2rem;
  font-weight: bold;
  color: #2c3e50;
  justify-content: center;
}

.summary-cell.details {
  color: #6c757d;
  font-size: 0.9rem;
}

.metric-icon {
  font-size: 1.2rem;
}

.status-breakdown {
  margin-bottom: 30px;
}

.status-breakdown h2 {
  color: #2c3e50;
  margin-bottom: 25px;
  font-size: 1.8rem;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.status-card {
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  border-left: 5px solid;
}

.status-card.nouveau {
  border-left-color: #ff4444;
}

.status-card.en-cours {
  border-left-color: #ffaa00;
}

.status-card.termine {
  border-left-color: #44aa44;
}

.status-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.status-dot.nouveau {
  background-color: #ff4444;
}

.status-dot.en-cours {
  background-color: #ffaa00;
}

.status-dot.termine {
  background-color: #44aa44;
}

.status-header h3 {
  margin: 0;
  color: #2c3e50;
}

.status-stats {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.big-number {
  font-size: 2.5rem;
  font-weight: bold;
  color: #2c3e50;
}

.stat-detail {
  text-align: right;
  font-size: 0.9rem;
  color: #6c757d;
}

.progress-section {
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  margin-bottom: 30px;
}

.progress-section h2 {
  color: #2c3e50;
  margin-bottom: 25px;
  font-size: 1.8rem;
}

.progress-container {
  margin-bottom: 20px;
}

.progress-bar {
  width: 100%;
  height: 20px;
  background: #e9ecef;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #44aa44 0%, #66bb44 100%);
  border-radius: 10px;
  transition: width 0.8s ease;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #6c757d;
}

.progress-badge {
  padding: 4px 12px;
  border-radius: 15px;
  font-weight: bold;
  color: white;
}

.progress-badge.high {
  background: #44aa44;
}

.progress-badge.medium {
  background: #ffaa00;
}

.progress-badge.low {
  background: #ff4444;
}

.additional-info {
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.additional-info h2 {
  color: #2c3e50;
  margin-bottom: 25px;
  font-size: 1.8rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.info-item h3 {
  color: #495057;
  margin-bottom: 15px;
}

.info-item ul {
  list-style: none;
  padding: 0;
}

.info-item li {
  background: #f8f9fa;
  padding: 8px 15px;
  margin-bottom: 5px;
  border-radius: 5px;
  border-left: 3px solid #3498db;
}

.info-item p {
  color: #6c757d;
  margin-bottom: 5px;
}

@media (max-width: 768px) {
  .summary-row {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .status-grid {
    grid-template-columns: 1fr;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .page-header h1 {
    font-size: 2rem;
  }
}
</style>
