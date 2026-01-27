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
        <h1>
          <i class="fas fa-chart-bar"></i>
          Tableau de Bord
        </h1>
        <p>Récapitulatif des problèmes routiers et de leur avancement</p>
      </div>

      <!-- Tableau de récapitulation principal -->
      <div class="summary-card">
        <h2>
          <i class="fas fa-clipboard-list"></i>
          Récapitulatif Général
        </h2>
        <div class="summary-table">
          <div class="summary-row header">
            <div class="summary-cell">Métrique</div>
            <div class="summary-cell">Valeur</div>
            <div class="summary-cell">Détails</div>
          </div>

          <div class="summary-row">
            <div class="summary-cell">
              <span class="metric-icon">
                <i class="fas fa-map-pin"></i>
              </span>
              Nombre de Points
            </div>
            <div class="summary-cell value">{{ totalProblems }}</div>
            <div class="summary-cell details">Problèmes signalés</div>
          </div>

          <div class="summary-row">
            <div class="summary-cell">
              <span class="metric-icon">
                <i class="fas fa-ruler-combined"></i>
              </span>
              Surface Totale
            </div>
            <div class="summary-cell value">{{ totalSurface }} m²</div>
            <div class="summary-cell details">Surface à traiter</div>
          </div>

          <div class="summary-row">
            <div class="summary-cell">
              <span class="metric-icon">
                <i class="fas fa-chart-line"></i>
              </span>
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
              <span class="metric-icon">
                <i class="fas fa-money-bill-wave"></i>
              </span>
              Budget Total
            </div>
            <div class="summary-cell value">{{ formatCurrency(totalBudget) }}</div>
            <div class="summary-cell details">Investissement total</div>
          </div>
        </div>
      </div>

      <!-- Répartition par statut -->
      <div class="status-breakdown">
        <h2>
          <i class="fas fa-bullseye"></i>
          Répartition par Statut
        </h2>
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
        <h2>
          <i class="fas fa-chart-line"></i>
          Progression des Travaux
        </h2>
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
        <h2>
          <i class="fas fa-info-circle"></i>
          Informations Complémentaires
        </h2>
        <div class="info-grid">
          <div class="info-item">
            <h3>
              <i class="fas fa-building"></i>
              Entreprises Impliquées
            </h3>
            <ul>
              <li v-for="entreprise in uniqueEntreprises" :key="entreprise">
                {{ entreprise }}
              </li>
            </ul>
          </div>

          <div class="info-item">
            <h3>
              <i class="fas fa-calendar-alt"></i>
              Période d'Analyse
            </h3>
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

        console.log(`${this.roadProblems.length} signalements chargés`)
      } catch (err) {
        console.error('Erreur lors du chargement des signalements:', err)
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
<style src="../assets/page_css/dash.css"></style>