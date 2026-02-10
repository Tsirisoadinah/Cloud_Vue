<template>
  <div class="config-container">
    <div class="page-header">
      <h1>
        <i class="fas fa-cog"></i>
        Configuration
      </h1>
    </div>

    <div v-if="!hasToken" class="restriction-alert">
      <p>Accès refusé - Vous devez être connecté.</p>
      <RouterLink to="/login" class="btn-login">Se connecter</RouterLink>
    </div>

    <div v-else-if="!isUserAdmin" class="restriction-alert">
      <p>Accès refusé - Réservé aux administrateurs/managers.</p>
    </div>

    <div v-else class="card">
      <div class="current-box">
        <div class="current-label">Prix forfaitaire actuel</div>
        <div v-if="isLoadingCurrent" class="current-value muted">Chargement...</div>
        <div v-else class="current-value">
          <span v-if="currentMontant !== null">{{ formatCurrency(currentMontant) }}</span>
          <span v-else class="muted">Non défini</span>
        </div>
        <button class="btn-secondary" type="button" @click="loadCurrent" :disabled="isLoadingCurrent">
          Rafraîchir
        </button>
      </div>

      <form @submit.prevent="onSubmit" class="form">
        <div class="form-group">
          <label class="form-label">Forfait par m2</label>
          <input
            v-model="montant"
            type="number"
            min="0"
            step="0.01"
            class="form-input"
            placeholder="Ex: 100000"
            required
          />
        </div>

        <div class="actions">
          <button class="btn-save" type="submit" :disabled="isSaving">
            {{ isSaving ? 'Enregistrement...' : '✓ Mettre à jour' }}
          </button>
        </div>

        <div v-if="successMessage" class="alert success">{{ successMessage }}</div>
        <div v-if="errorMessage" class="alert error">{{ errorMessage }}</div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { isAdmin, isAuthenticated } from '@/services/authService'
import { getPrixForfaitaire, updatePrixForfaitaire } from '@/services/prixForfaitaireService'

const montant = ref('')
const isSaving = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const currentMontant = ref(null)
const isLoadingCurrent = ref(false)

const hasToken = computed(() => isAuthenticated())
const isUserAdmin = computed(() => isAdmin())

function normalizeApiResponse(resData) {
  // Backend sometimes returns a JSON string (Spring String response)
  if (typeof resData === 'string') {
    try {
      return JSON.parse(resData)
    } catch {
      return { status: 'unknown', message: resData }
    }
  }
  return resData
}

function formatCurrency(value) {
  const numberValue = Number(value)
  if (Number.isNaN(numberValue)) return String(value)
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'MGA',
    maximumFractionDigits: 2,
  }).format(numberValue)
}

const loadCurrent = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!hasToken.value || !isUserAdmin.value) {
    currentMontant.value = null
    return
  }

  try {
    isLoadingCurrent.value = true
    const res = await getPrixForfaitaire()
    const payload = normalizeApiResponse(res.data)
    const montantValue = payload?.data?.montant
    currentMontant.value = montantValue ?? null
  } catch (err) {
    currentMontant.value = null
    const msg = err?.response?.data?.message || err?.message || 'Erreur lors du chargement du prix forfaitaire'
    errorMessage.value = msg
  } finally {
    isLoadingCurrent.value = false
  }
}

const onSubmit = async () => {
  successMessage.value = ''
  errorMessage.value = ''

  const value = Number(montant.value)
  if (Number.isNaN(value) || value < 0) {
    errorMessage.value = 'Montant invalide'
    return
  }

  try {
    isSaving.value = true
    const res = await updatePrixForfaitaire(value)
    const payload = normalizeApiResponse(res.data)

    successMessage.value = payload?.message || 'Prix forfaitaire mis à jour avec succès'
    await loadCurrent()
  } catch (err) {
    const msg = err?.response?.data?.message || err?.message || 'Erreur lors de la mise à jour'
    errorMessage.value = msg
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  loadCurrent()
})
</script>

<style scoped>
.config-container {
  padding: 30px;
  max-width: 900px;
  margin: 0 auto;
  min-height: 100vh;
  background: #f8f9fa;
}

.page-header {
  background: white;
  padding: 20px 30px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  font-size: 28px;
  color: #2c3e50;
  font-weight: 700;
}

.page-header p {
  margin: 8px 0 0;
  color: #6c757d;
}

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 24px;
}

.current-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 14px;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  margin-bottom: 16px;
  background: #fbfcfe;
}

.current-label {
  font-weight: 700;
  color: #2c3e50;
}

.current-value {
  flex: 1;
  text-align: center;
  font-weight: 800;
  color: #2c3e50;
}

.muted {
  font-weight: 600;
  color: #6c757d;
}

.btn-secondary {
  padding: 10px 12px;
  background: white;
  border: 1px solid #dee2e6;
  color: #2c3e50;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
}

.btn-secondary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.form-label {
  font-weight: 600;
  color: #2c3e50;
}

.form-input {
  padding: 12px 14px;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  outline: none;
  font-size: 14px;
}

.form-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
}

.actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.btn-save {
  padding: 10px 18px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.restriction-alert {
  background: #fff3cd;
  border: 1px solid #ffeeba;
  color: #856404;
  padding: 14px 16px;
  border-radius: 10px;
}

.btn-login {
  display: inline-block;
  margin-top: 10px;
  padding: 10px 14px;
  background: #667eea;
  color: white;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 700;
}

.alert {
  margin-top: 14px;
  padding: 12px 14px;
  border-radius: 10px;
}

.alert.success {
  background: #e6ffed;
  border: 1px solid #b7f5c8;
  color: #1e7e34;
}

.alert.error {
  background: #fdecea;
  border: 1px solid #f5c6cb;
  color: #721c24;
}
</style>
