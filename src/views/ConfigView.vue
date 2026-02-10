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
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { isAdmin, isAuthenticated } from '@/services/authService'
import { updatePrixForfaitaire } from '@/services/prixForfaitaireService'

const montant = ref('')
const isSaving = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

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
  } catch (err) {
    const msg = err?.response?.data?.message || err?.message || 'Erreur lors de la mise à jour'
    errorMessage.value = msg
  } finally {
    isSaving.value = false
  }
}
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
