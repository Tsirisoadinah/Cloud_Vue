<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h1>Connexion</h1>
        <p>Connectez-vous à votre compte</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="auth-form">
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
          <label for="password">Mot de passe</label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            placeholder="••••••••"
            required
            autocomplete="current-password"
          />
        </div>
        
        <div class="form-options">
          <label class="checkbox-label">
            <input type="checkbox" v-model="rememberMe" />
            <span>Se souvenir de moi</span>
          </label>
          <a href="#" class="forgot-password">Mot de passe oublié ?</a>
        </div>
        
        <button type="submit" class="btn-primary" :disabled="loading">
          <span v-if="!loading">Se connecter</span>
          <span v-else>Connexion en cours...</span>
        </button>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </form>
      
      <div class="auth-footer">
        <p>Pas encore de compte ?</p>
        <RouterLink to="/signup" class="link-secondary">S'inscrire</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const formData = ref({
  email: '',
  password: ''
})

const rememberMe = ref(false)
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  
  try {
    // TODO: Implémenter l'appel API vers le backend
    console.log('Données de connexion:', formData.value)
    
    // Simulation d'une connexion réussie (à remplacer par l'appel API réel)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Stockage du token (à adapter selon votre backend)
    // localStorage.setItem('token', response.token)
    
    // Exemple de redirection (à adapter selon vos besoins)
    router.push('/')
  } catch (err) {
    error.value = 'Email ou mot de passe incorrect'
    console.error('Erreur de connexion:', err)
  } finally {
    loading.value = false
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
  gap: 20px;
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

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #555;
}

.checkbox-label input[type="checkbox"] {
  cursor: pointer;
  width: 16px;
  height: 16px;
}

.forgot-password {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.forgot-password:hover {
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

.error-message {
  background: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  border-left: 4px solid #c33;
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
  
  .form-options {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
}
</style>
