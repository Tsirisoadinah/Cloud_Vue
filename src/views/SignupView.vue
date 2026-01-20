<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h1>Créer un compte</h1>
      </div>

      <form @submit.prevent="handleSignup" class="auth-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            placeholder="votre@email.com"
            required
            autocomplete="email"
          />
        </div>

        <div class="form-group">
          <label for="pseudo">Pseudo</label>
          <input
            id="pseudo"
            v-model="formData.pseudo"
            type="text"
            placeholder="Votre pseudo"
            required
            autocomplete="username"
            minlength="3"
          />
        </div>

        <div class="form-group">
          <label for="password">Mot de passe</label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            placeholder="••••••••"
            required
            autocomplete="new-password"
            minlength="6"
          />
          <span class="input-hint">Minimum 6 caractères</span>
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirmer le mot de passe</label>
          <input
            id="confirmPassword"
            v-model="formData.confirmPassword"
            type="password"
            placeholder="••••••••"
            required
            autocomplete="new-password"
          />
        </div>

        <div class="checkbox-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="acceptTerms" required />
            <span>J'accepte les <a href="#" class="link-inline">conditions d'utilisation</a></span>
          </label>
        </div>

        <button type="submit" class="btn-primary" :disabled="loading || !isFormValid">
          <span v-if="!loading">S'inscrire</span>
          <span v-else>Inscription en cours...</span>
        </button>

        <button type="button" class="btn-sync" @click="handleSyncUser" :disabled="syncLoading">
          <span v-if="!syncLoading">Synchroniser user</span>
          <span v-else>Synchronisation...</span>
        </button>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div v-if="success" class="success-message">
          {{ success }}
        </div>
      </form>

      <div class="auth-footer">
        <p>Vous avez déjà un compte ?</p>
        <RouterLink to="/login" class="link-secondary">Se connecter</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { signup } from '@/services/authService'

const router = useRouter()

const formData = ref({
  email: '',
  pseudo: '',
  password: '',
  confirmPassword: ''
})

const acceptTerms = ref(false)
const loading = ref(false)
const syncLoading = ref(false)
const error = ref('')
const success = ref('')

const isFormValid = computed(() => {
  return (
    formData.value.email &&
    formData.value.pseudo &&
    formData.value.password &&
    formData.value.confirmPassword &&
    formData.value.password === formData.value.confirmPassword &&
    acceptTerms.value
  )
})

const handleSignup = async () => {
  error.value = ''
  success.value = ''

  if (formData.value.password !== formData.value.confirmPassword) {
    error.value = 'Les mots de passe ne correspondent pas'
    return
  }

  if (formData.value.password.length < 6) {
    error.value = 'Le mot de passe doit contenir au moins 6 caractères'
    return
  }

  loading.value = true

  try {
    await signup({
      email: formData.value.email,
      pseudo: formData.value.pseudo,
      password: formData.value.password
    })

    success.value = 'Inscription réussie ! Redirection vers la connexion...'

    setTimeout(() => {
      router.push('/login')
    }, 1500)

  } catch (err) {
    error.value =
      err.response?.data?.message ||
      'Erreur lors de l’inscription'
  } finally {
    loading.value = false
  }
}

const handleSyncUser = async () => {
  error.value = ''
  success.value = ''
  syncLoading.value = true

  try {
    // TODO: Implémenter l'appel au webservice de synchronisation
    console.log('Synchronisation user en cours...')
    
    // Simulation d'un appel webservice (à remplacer par l'appel API réel)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    success.value = 'Synchronisation utilisateur réussie !'
    
    // Effacer le message de succès après 3 secondes
    setTimeout(() => {
      success.value = ''
    }, 3000)
  } catch (err) {
    error.value = 'Erreur lors de la synchronisation utilisateur'
    console.error('Erreur de synchronisation:', err)
  } finally {
    syncLoading.value = false
  }
}
</script>


<style scoped>
.auth-container {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.auth-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 40px;
  width: 100%;
  max-width: 450px;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.auth-header {
  text-align: center;
  margin-bottom: 30px;
}

.auth-header h1 {
  color: #2c3e50;
  font-size: 28px;
  margin-bottom: 8px;
}

.auth-header p {
  color: #7f8c8d;
  font-size: 14px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  color: #2c3e50;
  font-weight: 600;
  font-size: 14px;
}

.form-group input {
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.3s;
  background: #f8f9fa;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
}

.input-hint {
  font-size: 12px;
  color: #7f8c8d;
  margin-top: -4px;
}

.checkbox-group {
  margin: 5px 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #555;
  font-size: 14px;
}

.checkbox-label input[type="checkbox"] {
  cursor: pointer;
  width: 16px;
  height: 16px;
}

.link-inline {
  color: #667eea;
  text-decoration: none;
}

.link-inline:hover {
  text-decoration: underline;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 14px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  margin-top: 10px;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-sync {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  margin-top: 10px;
}

.btn-sync:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 16px rgba(40, 167, 69, 0.4);
}

.btn-sync:active:not(:disabled) {
  transform: translateY(0);
}

.btn-sync:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  border-left: 4px solid #c33;
}

.success-message {
  background: #efe;
  color: #2a7;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  border-left: 4px solid #2a7;
}

.auth-footer {
  margin-top: 30px;
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.auth-footer p {
  color: #7f8c8d;
  font-size: 14px;
  margin-bottom: 8px;
}

.link-secondary {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  font-size: 15px;
}

.link-secondary:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .auth-card {
    padding: 30px 20px;
  }
}
</style>
