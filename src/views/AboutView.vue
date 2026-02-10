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
      <button @click="loadData" class="btn-retry">Réessayer</button>
    </div>

    <!-- Contenu principal -->
    <div v-else class="container">
      <div class="page-header">
        <h1>
          <i class="fas fa-chart-bar"></i>
          Tableau de Bord & Statistiques
        </h1>
        <p>Récapitulatif complet des problèmes routiers et de leur avancement</p>
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

      <!-- Statistiques de traitement -->
      <div class="treatment-stats">
        <h2>
          <i class="fas fa-clock"></i>
          Statistiques de Traitement
        </h2>
        <div class="stats-grid">
          <div class="stats-card">
            <h3>Traitement des travaux</h3>
            <div class="stat-value">{{ totalTraitementHeures }}h</div>
            <div class="stat-label">Total des traitements</div>
          </div>
          <div class="stats-card">
            <h3>Traitement moyenne vers l'étape suivante</h3>
            <div class="stat-value">{{ moyenneTraitementHeures }}h</div>
            <div class="stat-label">Temps moyen de transition</div>
          </div>
        </div>
      </div>


            <!-- Section détaillée des signalements -->
      <div class="signalements-detail">
        <h2>
          <i class="fas fa-list-alt"></i>
          Détails des Signalements
        </h2>

        <!-- Boutons de filtrage par statut -->
        <div class="status-buttons">
          <button
            v-for="status in statusButtons"
            :key="status.key"
            :class="['status-btn', { active: selectedStatus === status.key }]"
            @click="selectStatus(status.key)"
          >
            {{ status.label }}
          </button>
        </div>

        <!-- Tableau des signalements -->
        <div class="table-container">
          <table class="signalements-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Description</th>
                <th>Surface (m²)</th>
                <th>Budget</th>
                <th>Statut</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="signalement in filteredSignalements"
                :key="signalement.id"
              >
                <td>#{{ signalement.id }}</td>
                <td>{{ signalement.description }}</td>
                <td>{{ signalement.surface }}</td>
                <td>{{ formatCurrency(signalement.budget) }}</td>
                <td>
                  <span class="status-badge" :class="signalement.statusKey">
                    {{ signalement.statusLabel }}
                  </span>
                </td>
                <td>{{ signalement.date }}</td>
              </tr>
            </tbody>
          </table>

          <div v-if="filteredSignalements.length === 0" class="no-data">
            Aucun signalement trouvé pour ce statut
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
import { getSignalements, getRouteProblemeDashboard } from "@/services/signalementService";

export default {
  name: 'AboutView',
  data() {
    return {
      roadProblems: [],
      dashboard: null,
      isLoading: true,
      error: null,
      selectedStatus: 'tous',
      statusButtons: []
    }
  },

  async mounted() {
    await this.loadData()
  },

  methods: {
    async loadData() {
      try {
        this.isLoading = true
        this.error = null

        // Charger les signalements et le dashboard en parallèle
        const [signalements, dashboardData] = await Promise.all([
          getSignalements(),
          getRouteProblemeDashboard()
        ])

        this.roadProblems = signalements.map(s => ({
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

        this.dashboard = dashboardData
        this.statusButtons = this.buildStatusButtons(dashboardData?.statistiques || [])

        console.log(`${this.roadProblems.length} signalements chargés`)
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err)
        this.error = 'Impossible de charger les données. Veuillez réessayer.'
        this.roadProblems = []
        this.dashboard = null
        this.statusButtons = []
      } finally {
        this.isLoading = false
      }
    },

    buildStatusButtons(statistiques) {
      const buttons = [
        { key: 'tous', label: 'Tous' }
      ]

      // Ajouter les statuts depuis le dashboard
      statistiques.forEach(stat => {
        const label = stat.status?.label || 'Inconnu'
        const key = this.normalizeStatus(label)
        if (!buttons.some(b => b.key === key)) {
          buttons.push({ key, label })
        }
      })

      // Ajouter aussi les statuts depuis les signalements
      const uniqueStatuses = [...new Set(this.roadProblems.map(p => p.status))]
      uniqueStatuses.forEach(status => {
        if (!buttons.some(b => b.key === status)) {
          buttons.push({ key: status, label: status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ') })
        }
      })

      return buttons
    },

    normalizeStatus(label) {
      if (!label) return 'inconnu'
      return label
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
    },

    formatHours(minutes) {
      if (!minutes || Number.isNaN(Number(minutes))) return '0'
      const hours = Number(minutes) / 60
      return hours.toFixed(1)
    },

    selectStatus(statusKey) {
      this.selectedStatus = statusKey
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
    totalTraitementHeures() {
      return this.formatHours(this.dashboard?.delaisMoyenGlobal)
    },

    moyenneTraitementHeures() {
      const stats = this.dashboard?.statistiques || []
      const values = stats.map(s => s.delaisMoyen).filter(v => v !== null && v !== undefined)
      if (values.length === 0) return '0'
      const avg = values.reduce((sum, v) => sum + v, 0) / values.length
      return this.formatHours(avg)
    },

    allSignalementsDetailed() {
      if (!this.dashboard?.statistiques) return []
      return this.dashboard.statistiques.flatMap(stat => {
        const statusLabel = stat.status?.label || 'Inconnu'
        const statusKey = this.normalizeStatus(statusLabel)
        return (stat.problemeList || []).map(item => ({
          id: item.routeProbleme?.id ?? item.id,
          description: item.routeProbleme?.problemeDescription || 'Non spécifié',
          surface: item.routeProbleme?.surface ?? 0,
          budget: item.routeProbleme?.budget ?? 0,
          date: item.dateHistorique
            ? new Date(item.dateHistorique).toLocaleDateString('fr-FR')
            : '—',
          statusKey,
          statusLabel
        }))
      })
    },

    filteredSignalements() {
      // Utilise les données détaillées du dashboard s'il y en a, sinon utilise roadProblems
      const dataToUse = this.allSignalementsDetailed.length > 0
        ? this.allSignalementsDetailed
        : this.roadProblems.map(p => ({
            id: p.id,
            description: p.type,
            surface: p.surface,
            budget: p.budget,
            date: new Date(p.date).toLocaleDateString('fr-FR'),
            statusKey: p.status,
            statusLabel: p.status.charAt(0).toUpperCase() + p.status.slice(1).replace('-', ' ')
          }))

      if (this.selectedStatus === 'tous') return dataToUse
      return dataToUse.filter(s => s.statusKey === this.selectedStatus)
    },

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
<style scoped>
/* Statistiques de traitement */
.treatment-stats {
  margin: 30px 0;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.treatment-stats h2 {
  margin: 0 0 20px 0;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.stats-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  border: 1px solid #e0e0e0;
}

.stats-card h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 16px;
}

.stat-value {
  font-size: 36px;
  font-weight: bold;
  color: #007bff;
  margin-bottom: 5px;
}

.stat-label {
  color: #666;
  font-size: 14px;
}

/* Section détaillée des signalements */
.signalements-detail {
  margin: 30px 0;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.signalements-detail h2 {
  margin: 0 0 20px 0;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.status-btn {
  padding: 10px 20px;
  border: 2px solid #ddd;
  background: white;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.status-btn:hover {
  border-color: #007bff;
  color: #007bff;
}

.status-btn.active {
  background-color: #007bff;
  border-color: #007bff;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
}

.table-container {
  overflow-x: auto;
}

.signalements-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

.signalements-table th,
.signalements-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.signalements-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #333;
  position: sticky;
  top: 0;
}

.signalements-table tr:hover {
  background-color: #f8f9fa;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.status-badge.nouveau {
  background-color: #e3f2fd;
  color: #1976d2;
}

.status-badge.en-cours {
  background-color: #fff3e0;
  color: #f57c00;
}

.status-badge.termine {
  background-color: #e8f5e8;
  color: #2e7d32;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #666;
  font-style: italic;
}

/* Responsive design */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .status-buttons {
    justify-content: center;
  }

  .signalements-table {
    font-size: 14px;
  }

  .signalements-table th,
  .signalements-table td {
    padding: 8px;
  }
}
</style>
