<template>
  <div class="about">
    <!-- Message de chargement -->
    <div v-if="isLoading" class="loading-container">
      <div class="spinner"></div>
      <p>Chargement des données...</p>
    </div>

    <!-- Message d'erreur -->
    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
      <button @click="loadSignalements" class="btn-retry">Réessayer</button>
    </div>

    <!-- Contenu principal -->
    <div v-else class="container">
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
import { getSignalements } from "@/services/signalementService";

export default {
  name: 'AboutView',
  data() {
    return {
      roadProblems: [],
      isLoading: true,
      error: null
    }
  },

  async mounted() {
    await this.loadSignalements()
  },

  methods: {
    async loadSignalements() {
      try {
        this.isLoading = true
        this.error = null
        const data = await getSignalements()

        this.roadProblems = data.map(s => ({
          id: s.id,
          type: s.problemeDescription || 'Non spécifié',
          lat: s.latitude,
          lng: s.longitude,
          date: s.dateSignalement || new Date().toISOString().split('T')[0],
          status: s.routeStatusName?.toLowerCase().replace(/\s+/g, '-') || 'nouveau',
          surface: s.surface || 0,
          budget: s.budget || 0,
          entreprise: s.routeEntrepriseName || 'Non assignée'
        }))

        console.log(`✅ ${this.roadProblems.length} signalements chargés`)
      } catch (err) {
        console.error('❌ Erreur lors du chargement des signalements:', err)
        this.error = 'Impossible de charger les données. Veuillez réessayer.'
        this.roadProblems = []
      } finally {
        this.isLoading = false
      }
    },

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
  }
}
</script>

<style scoped>
.about {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%);
  padding: 40px 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

/* Page Header */
.page-header {
  text-align: center;
  margin-bottom: 50px;
  padding: 40px 20px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.page-header h1 {
  font-size: clamp(2rem, 6vw, 3rem);
  color: #2c3e50;
  margin-bottom: 15px;
  font-weight: 800;
}

.page-header p {
  font-size: 1.1rem;
  color: #7f8c8d;
  opacity: 0.9;
}

/* Summary Card */
.summary-card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  margin-bottom: 40px;
  border-top: 4px solid #3498db;
}

.summary-card h2 {
  color: #2c3e50;
  margin-bottom: 30px;
  font-size: 1.8rem;
  font-weight: 700;
}

.summary-table {
  display: grid;
  gap: 1px;
  background: #e9ecef;
  border-radius: 12px;
  overflow: hidden;
}

.summary-row {
  display: grid;
  grid-template-columns: 2fr 1fr 2fr;
  background: white;
  transition: all 0.3s ease;
}

.summary-row:hover {
  background: #f8f9fa;
}

.summary-row.header {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: white;
  font-weight: 700;
}

.summary-cell {
  padding: 18px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.summary-cell.value {
  font-size: 1.3rem;
  font-weight: 800;
  color: #2c3e50;
  justify-content: center;
}

.summary-cell.details {
  color: #7f8c8d;
  font-size: 0.9rem;
  font-weight: 500;
}

.metric-icon {
  font-size: 1.3rem;
}

/* Status Breakdown */
.status-breakdown {
  margin-bottom: 40px;
}

.status-breakdown h2 {
  color: #2c3e50;
  margin-bottom: 30px;
  font-size: 1.8rem;
  font-weight: 700;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 25px;
}

.status-card {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
  border-left: 5px solid;
  transition: all 0.3s ease;
}

.status-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12);
}

.status-card.nouveau {
  border-left-color: #e74c3c;
}

.status-card.en-cours {
  border-left-color: #f39c12;
}

.status-card.termine {
  border-left-color: #2ecc71;
}

.status-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.status-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-dot.nouveau {
  background-color: #e74c3c;
}

.status-dot.en-cours {
  background-color: #f39c12;
}

.status-dot.termine {
  background-color: #2ecc71;
}

.status-header h3 {
  margin: 0;
  color: #2c3e50;
  font-weight: 700;
  font-size: 1.2rem;
}

.status-stats {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 15px;
}

.big-number {
  font-size: 2.8rem;
  font-weight: 800;
  color: #2c3e50;
  line-height: 1;
}

.stat-detail {
  text-align: right;
  font-size: 0.95rem;
  color: #7f8c8d;
}

.stat-detail p {
  margin: 5px 0;
  font-weight: 500;
}

/* Progress Section */
.progress-section {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  margin-bottom: 40px;
  border-top: 4px solid #f39c12;
}

.progress-section h2 {
  color: #2c3e50;
  margin-bottom: 30px;
  font-size: 1.8rem;
  font-weight: 700;
}

.progress-container {
  margin-bottom: 25px;
}

.progress-bar {
  width: 100%;
  height: 24px;
  background: #ecf0f1;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 15px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #2ecc71 0%, #27ae60 100%);
  border-radius: 12px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(46, 204, 113, 0.3);
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.95rem;
  color: #7f8c8d;
  font-weight: 500;
}

.progress-badge {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 700;
  color: white;
  font-size: 1.1rem;
}

.progress-badge.high {
  background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
}

.progress-badge.medium {
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
}

.progress-badge.low {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
}

/* Additional Info */
.additional-info {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  border-top: 4px solid #2ecc71;
}

.additional-info h2 {
  color: #2c3e50;
  margin-bottom: 30px;
  font-size: 1.8rem;
  font-weight: 700;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 35px;
}

.info-item h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-weight: 700;
  font-size: 1.2rem;
}

.info-item ul {
  list-style: none;
  padding: 0;
}

.info-item li {
  background: linear-gradient(135deg, #f8f9fa 0%, #ecf0f1 100%);
  padding: 12px 18px;
  margin-bottom: 8px;
  border-radius: 8px;
  border-left: 4px solid #3498db;
  transition: all 0.3s ease;
  font-weight: 500;
  color: #2c3e50;
}

.info-item li:hover {
  background: linear-gradient(135deg, #ecf0f1 0%, #bdc3c7 100%);
  transform: translateX(5px);
}

.info-item p {
  color: #7f8c8d;
  margin-bottom: 8px;
  font-weight: 500;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 25px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-container p {
  font-size: 1.2rem;
  color: white;
  font-weight: 600;
}

/* Error State */
.error-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%);
  padding: 20px;
}

.error-container p {
  font-size: 1.2rem;
  color: #e74c3c;
  margin-bottom: 25px;
  text-align: center;
  max-width: 500px;
  font-weight: 600;
}

.btn-retry {
  padding: 14px 35px;
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
}

.btn-retry:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(52, 152, 219, 0.4);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .about {
    padding: 30px 15px;
  }

  .container {
    padding: 0 10px;
  }

  .summary-card,
  .progress-section,
  .additional-info {
    padding: 30px 20px;
  }

  .page-header {
    padding: 30px 15px;
  }
}

@media (max-width: 768px) {
  .about {
    padding: 20px 10px;
  }

  .page-header {
    margin-bottom: 35px;
    padding: 25px 15px;
  }

  .page-header h1 {
    font-size: 1.8rem;
    margin-bottom: 10px;
  }

  .page-header p {
    font-size: 1rem;
  }

  .summary-card,
  .progress-section,
  .additional-info {
    padding: 25px 15px;
    margin-bottom: 25px;
    border-radius: 15px;
  }

  .summary-card h2,
  .progress-section h2,
  .additional-info h2 {
    font-size: 1.5rem;
    margin-bottom: 20px;
  }

  .summary-row {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .summary-cell {
    padding: 12px 15px;
  }

  .summary-cell.value {
    font-size: 1.2rem;
    justify-content: center;
  }

  .status-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .status-card {
    padding: 20px;
  }

  .big-number {
    font-size: 2rem;
  }

  .stat-detail {
    text-align: right;
  }

  .info-grid {
    grid-template-columns: 1fr;
    gap: 25px;
  }

  .info-item h3 {
    font-size: 1.1rem;
  }

  .info-item li {
    padding: 10px 12px;
    font-size: 0.95rem;
  }
}

@media (max-width: 480px) {
  .about {
    padding: 15px 8px;
  }

  .page-header {
    padding: 20px 10px;
    margin-bottom: 25px;
  }

  .page-header h1 {
    font-size: 1.5rem;
  }

  .page-header p {
    font-size: 0.95rem;
  }

  .summary-card,
  .progress-section,
  .additional-info {
    padding: 20px 12px;
    margin-bottom: 20px;
  }

  .summary-card h2,
  .progress-section h2,
  .additional-info h2 {
    font-size: 1.2rem;
    margin-bottom: 15px;
  }

  .summary-cell {
    padding: 10px 12px;
    font-size: 0.9rem;
  }

  .summary-cell.value {
    font-size: 1rem;
  }

  .metric-icon {
    font-size: 1rem;
  }

  .big-number {
    font-size: 1.5rem;
  }

  .status-card {
    padding: 15px 12px;
  }

  .status-header h3 {
    font-size: 1rem;
  }

  .progress-badge {
    padding: 6px 12px;
    font-size: 0.9rem;
  }

  .info-item h3 {
    font-size: 1rem;
    margin-bottom: 12px;
  }

  .info-item li {
    padding: 8px 10px;
    font-size: 0.9rem;
    margin-bottom: 6px;
  }

  .info-item p {
    font-size: 0.9rem;
  }
}
</style>
