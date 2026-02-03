<template>
  <div class="home">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="spinner"></div>
      <p>Chargement...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-overlay">
      <p class="error-message">{{ error }}</p>
      <button @click="loadSignalements" class="btn-retry">Réessayer</button>
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-background"></div>
        <div class="hero-content">
          <h1 class="hero-title">
            <i class="fas fa-map"></i>
            CarteMada
          </h1>
          <h2 class="hero-subtitle">Système de Gestion des Problèmes Routiers</h2>
          <p class="hero-description">Visualisez et suivez les problèmes d'infrastructure routière à Madagascar</p>

          <div class="features">
            <div class="feature-card">
              <div class="feature-icon">
                <i class="fas fa-map-marker-alt"></i>
              </div>
              <h3>Localisation Précise</h3>
              <p>Identifiez les problèmes routiers sur une carte interactive</p>
            </div>

            <div class="feature-card">
              <div class="feature-icon">
                <i class="fas fa-chart-line"></i>
              </div>
              <h3>Suivi en Temps Réel</h3>
              <p>Suivez le statut des réparations (nouveau, en cours, terminé)</p>
            </div>

            <div class="feature-card">
              <div class="feature-icon">
                <i class="fas fa-money-bill-wave"></i>
              </div>
              <h3>Gestion Budgétaire</h3>
              <p>Consultez les budgets alloués et les entreprises responsables</p>
            </div>
          </div>

          <div class="cta-buttons">
            <RouterLink to="/road-problems" class="btn btn-primary">
              <i class="fas fa-map-marked-alt btn-icon"></i>
              Voir la Carte
            </RouterLink>
            <RouterLink to="/about" class="btn btn-secondary">
              <i class="fas fa-chart-bar btn-icon"></i>
              Tableau de Bord
            </RouterLink>
          </div>
        </div>
      </section>

      <!-- Stats Section -->
      <section class="stats-section">
        <div class="stats-container">
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-map-pin"></i>
            </div>
            <div class="stat-number">{{ totalProblems }}</div>
            <div class="stat-label">Problèmes Signalés</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-tools"></i>
            </div>
            <div class="stat-number">{{ statusCounts['en-cours'] || 0 }}</div>
            <div class="stat-label">En Cours de Réparation</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="stat-number">{{ statusCounts.termine || 0 }}</div>
            <div class="stat-label">Problèmes Résolus</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <i class="fas fa-exclamation-circle"></i>
            </div>
            <div class="stat-number">{{ statusCounts.nouveau || 0 }}</div>
            <div class="stat-label">Nouveaux Signalements</div>
          </div>
        </div>
      </section>

      <!-- Summary Section -->
      <section class="summary-section">
        <div class="summary-container">
          <h2>Récapitulatif Financier</h2>
          <div class="summary-grid">
            <div class="summary-item budget">
              <div class="summary-label">Budget Total</div>
              <div class="summary-value">{{ formatCurrency(totalBudget) }}</div>
            </div>
            <div class="summary-item surface">
              <div class="summary-label">Surface Totale à Traiter</div>
              <div class="summary-value">{{ totalSurface }} m²</div>
            </div>
            <div class="summary-item progress">
              <div class="summary-label">Taux de Complétion</div>
              <div class="summary-value">{{ completionRate }}%</div>
              <div class="progress-bar-container">
                <div class="progress-bar-fill" :style="{ width: completionRate + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Quick Access Section -->
      <section class="quick-access-section">
        <div class="quick-access-container">
          <h2>Accès Rapide</h2>
          <div class="quick-access-grid">
            <RouterLink to="/road-problems" class="quick-access-card">
              <div class="card-icon">
                <i class="fas fa-map"></i>
              </div>
              <h3>Consulter la Carte</h3>
              <p>Visualiser tous les problèmes routiers</p>
              <div class="card-arrow">
                <i class="fas fa-arrow-right"></i>
              </div>
            </RouterLink>
            <RouterLink to="/about" class="quick-access-card">
              <div class="card-icon">
                <i class="fas fa-chart-line"></i>
              </div>
              <h3>Voir les Statistiques</h3>
              <p>Analyse détaillée des signalements</p>
              <div class="card-arrow">
                <i class="fas fa-arrow-right"></i>
              </div>
            </RouterLink>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { getSignalements } from "@/services/signalementService";

export default {
  name: 'HomeView',

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
    }
  },

  computed: {
    totalProblems() {
      return this.roadProblems.length
    },

    totalBudget() {
      return this.roadProblems.reduce((sum, problem) => sum + problem.budget, 0)
    },

    totalSurface() {
      return this.roadProblems.reduce((sum, problem) => sum + problem.surface, 0).toFixed(1)
    },

    statusCounts() {
      return this.roadProblems.reduce((counts, problem) => {
        counts[problem.status] = (counts[problem.status] || 0) + 1
        return counts
      }, {})
    },

    // completionRate() {
    //   if (this.totalProblems === 0) return 0
    //   const completed = this.statusCounts.termine || 0
    //   return Math.round((completed / this.totalProblems) * 100)
    // }
    completionRate() {
      if (this.totalProblems === 0) return 0

      const completed = this.statusCounts.termine || 0
      const inProgress = (this.statusCounts['en-cours'] || 0) * 0.5

      return Math.round(((completed + inProgress) / this.totalProblems) * 100)
    }

  }
}
</script>
<style src="../assets/page_css/home.css"></style>
