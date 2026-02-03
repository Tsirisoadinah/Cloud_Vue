<template>
  <div class="history-container">
    <h1>Historique des statuts</h1>
    
    <div v-if="loading" class="loading-message">
      Chargement de l'historique...
    </div>

    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-else-if="history.length === 0" class="empty-message">
      Aucun historique trouvé pour ce signalement.
    </div>

    <div v-else class="history-table">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in sortedHistory" :key="item.id">
            <td>{{ formatDate(item.dateHistorique) }}</td>
            <td>{{ item.routeStatusLabel }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="back-button">
      <RouterLink :to="`/road-problems`" class="btn-secondary">
        ← Retour au signalement
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { getHistoriqueStatus } from '@/services/signalementService'

const route = useRoute()
const routeProblemeId = Number(route.params.id)

const history = ref([])
const loading = ref(false)
const error = ref('')

const sortedHistory = computed(() => {
  return [...history.value].sort((a, b) => new Date(b.dateHistorique) - new Date(a.dateHistorique))
})

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
}

const loadHistory = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await getHistoriqueStatus(routeProblemeId)
    //  prendre le tableau qui est dans "data"
    history.value = res.data.data || []
  } catch (err) {
    console.error('Erreur chargement historique :', err)
    error.value = 'Impossible de récupérer l’historique'
  } finally {
    loading.value = false
  }
}


onMounted(() => {
  loadHistory()
})
</script>

<style scoped>
.history-container {
  padding: 20px;
}
.history-table {
  margin-top: 20px;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}
.back-button {
  margin-top: 20px;
}
.loading-message,
.error-message,
.empty-message {
  margin-top: 20px;
  font-style: italic;
  color: #666;
}
.btn-secondary {
  background-color: #f0f0f0;
  padding: 6px 12px;
  text-decoration: none;
  color: #333;
  border-radius: 4px;
}
</style>
