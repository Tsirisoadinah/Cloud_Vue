<template>
  <div class="signalement-details-container">
    <div class="header">
      <router-link to="/road-problems" class="back-link">
        ← Retour à la carte
      </router-link>
      <h1>Signalement #{{ signalementId }}</h1>
    </div>

    <div class="content-grid">
      <!-- Panneau de gauche : Indicateurs -->
      <div class="left-panel">
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

      <!-- Panneau de droite : Tableau et boutons -->
      <div class="right-panel">
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
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="signalement in filteredSignalements"
                :key="signalement.id"
                :class="{ highlighted: signalement.id == signalementId }"
              >
                <td>#{{ signalement.id }}</td>
                <td>{{ signalement.description }}</td>
                <td>{{ signalement.surface }}</td>
                <td>{{ signalement.date }}</td>
              </tr>
            </tbody>
          </table>

          <div v-if="filteredSignalements.length === 0" class="no-data">
            Aucun signalement trouvé pour ce statut
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SignalementDetailsView',

  data() {
    return {
      signalementId: null,
      selectedStatus: 'signales',

      // Données statiques pour l'instant
      totalTraitementHeures: 156,
      moyenneTraitementHeures: 24,

      statusButtons: [
        { key: 'signales', label: 'Signalés' },
        { key: 'nouveau', label: 'Nouveau' },
        { key: 'en-cours', label: 'En cours' },
        { key: 'termine', label: 'Terminé' }
      ],

      // Données statiques des signalements
      mockSignalements: [
        {
          id: 1,
          description: 'Nids de poule sur la route principale',
          surface: 15.5,
          date: '2026-01-15',
          status: 'nouveau'
        },
        {
          id: 2,
          description: 'Fissures importantes sur la chaussée',
          surface: 32.0,
          date: '2026-01-20',
          status: 'en-cours'
        },
        {
          id: 3,
          description: 'Affaissement de la route',
          surface: 8.2,
          date: '2026-01-25',
          status: 'termine'
        },
        {
          id: 4,
          description: 'Détérioration du revêtement',
          surface: 45.8,
          date: '2026-02-01',
          status: 'signales'
        },
        {
          id: 5,
          description: 'Trous profonds après les pluies',
          surface: 12.3,
          date: '2026-02-02',
          status: 'nouveau'
        },
        {
          id: 6,
          description: 'Problème de drainage',
          surface: 28.7,
          date: '2026-02-03',
          status: 'en-cours'
        }
      ]
    }
  },

  computed: {
    filteredSignalements() {
      return this.mockSignalements.filter(s => s.status === this.selectedStatus);
    }
  },

  mounted() {
    this.signalementId = this.$route.params.id;
    console.log('Détails du signalement #' + this.signalementId);
  },

  methods: {
    selectStatus(statusKey) {
      this.selectedStatus = statusKey;
    }
  }
}
</script>

<style scoped>
.signalement-details-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  gap: 20px;
}

.back-link {
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
  padding: 8px 16px;
  border: 1px solid #007bff;
  border-radius: 4px;
  transition: all 0.2s;
}

.back-link:hover {
  background-color: #007bff;
  color: white;
}

.header h1 {
  margin: 0;
  color: #333;
}

.content-grid {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 30px;
}

.left-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stats-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
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

.right-panel {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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
}

.signalements-table tr:hover {
  background-color: #f8f9fa;
}

.signalements-table tr.highlighted {
  background-color: #e3f2fd;
  font-weight: 500;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #666;
  font-style: italic;
}

@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .status-buttons {
    justify-content: center;
  }
}
</style>
