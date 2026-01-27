<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-brand">
          <RouterLink to="/" class="brand-link">
            <span class="brand-icon">🗺️</span>
            <span class="brand-text">CarteMada</span>
          </RouterLink>
        </div>
        <div class="nav-links">
          <RouterLink to="/" class="nav-link">
            <span class="link-icon">🏠</span>
            Accueil
          </RouterLink>
          <RouterLink to="/road-problems" class="nav-link">
            <span class="link-icon">📍</span>
            Carte
          </RouterLink>
          <RouterLink to="/about" class="nav-link">
            <span class="link-icon">📊</span>
            Tableau de Bord
          </RouterLink>
          <div class="nav-divider"></div>
          <RouterLink to="/login" class="nav-link auth-link">
            <span class="link-icon">🔐</span>
            Connexion
          </RouterLink>
          <a @click.prevent="showLogoutConfirmation" class="nav-link auth-link logout-link">
            <span class="link-icon">🚪</span>
            Déconnexion
          </a>
          <RouterLink to="/blocked-users" class="nav-link auth-link">
            <span class="link-icon">🚫</span>
            Bloqués
          </RouterLink>
          <button @click="handleSync" class="nav-link sync-button">
            <span class="link-icon">🔄</span>
            Synchroniser
          </button>
        </div>
      </div>
    </nav>
    <main class="main-content">
      <RouterView />
    </main>

    <!-- Modal de confirmation de déconnexion -->
    <div v-if="showLogoutModal" class="modal-overlay" @click="closeLogoutModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>🚪 Confirmation de déconnexion</h3>
          <button class="modal-close" @click="closeLogoutModal">×</button>
        </div>
        <div class="modal-body">
          <p>Êtes-vous sûr de vouloir vous déconnecter ?</p>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeLogoutModal">
            Annuler
          </button>
          <button class="btn-confirm" @click="confirmLogout">
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',

  data() {
    return {
      showLogoutModal: false
    }
  },

  methods: {
    showLogoutConfirmation() {
      this.showLogoutModal = true;
    },

    closeLogoutModal() {
      this.showLogoutModal = false;
    },

    confirmLogout() {
      // Effacer les données de session
      localStorage.clear();
      sessionStorage.clear();

      // Fermer la modal
      this.showLogoutModal = false;

      // Rediriger vers la page de connexion
      this.$router.push('/login');
    },

    handleSync() {
      // TODO: Appeler l'API de synchronisation ici
      console.log('Synchronisation déclenchée - API à déterminer');
      // Exemple: api.post('/sync').then(response => { ... })
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  width: 100%;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
}

/* Navbar Styles */
.navbar {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: white;
  padding: 0;
  display: flex;
  align-items: center;
  height: 70px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  flex-shrink: 0;
  position: sticky;
  top: 0;
}

.nav-container {
  width: 100%;
  max-width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
}

.nav-brand {
  flex-shrink: 0;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: white;
  transition: all 0.3s ease;
  padding: 8px 16px;
  border-radius: 8px;
}

.brand-link:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(1.05);
}

.brand-icon {
  font-size: 28px;
}

.brand-text {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: 0.5px;
}

.nav-links {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.nav-divider {
  width: 1px;
  height: 30px;
  background: rgba(255, 255, 255, 0.2);
  margin: 0 12px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  color: white;
  text-decoration: none;
  padding: 8px 14px;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-weight: 500;
  font-size: 0.95rem;
}

.logout-link {
  cursor: pointer;
}

.link-icon {
  font-size: 1.1rem;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.nav-link.router-link-active {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.auth-link {
  opacity: 0.85;
}

.auth-link:hover {
  opacity: 1;
}

.sync-button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.sync-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.sync-button .link-icon {
  display: inline-block;
  transition: transform 0.3s ease;
}

.sync-button:hover .link-icon {
  transform: rotate(180deg);
}

/* Main Content */
.main-content {
  flex: 1;
  width: 100%;
  height: calc(100vh - 70px);
  overflow-y: auto;
  overflow-x: hidden;
  scroll-behavior: smooth;
}

.main-content::-webkit-scrollbar {
  width: 10px;
}

.main-content::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.main-content::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 5px;
}

.main-content::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 450px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  border-bottom: 1px solid #e0e0e0;
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
  border-radius: 16px 16px 0 0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
}

.modal-close {
  background: none;
  border: none;
  color: white;
  font-size: 32px;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
  opacity: 0.8;
}

.modal-close:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
}

.modal-body {
  padding: 32px 28px;
  text-align: center;
}

.modal-body p {
  font-size: 1.1rem;
  color: #555;
  line-height: 1.6;
  margin: 0;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 20px 28px 28px;
}

.btn-cancel,
.btn-confirm {
  flex: 1;
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-cancel {
  background: #ecf0f1;
  color: #555;
  border: 2px solid #bdc3c7;
}

.btn-cancel:hover {
  background: #bdc3c7;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-confirm {
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
}

.btn-confirm:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.4);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .nav-container {
    padding: 0 20px;
  }

  .brand-text {
    font-size: 1.3rem;
  }

  .nav-link {
    padding: 6px 12px;
    font-size: 0.9rem;
  }

  .nav-divider {
    display: none;
  }

  .auth-link {
    display: none;
  }

  .logout-link {
    display: flex !important;
  }
}

@media (max-width: 768px) {
  .navbar {
    height: 60px;
  }

  .main-content {
    height: calc(100vh - 60px);
  }

  .nav-container {
    padding: 0 15px;
  }

  .brand-icon {
    font-size: 24px;
  }

  .brand-text {
    font-size: 1.1rem;
  }

  .nav-links {
    gap: 0;
  }

  .nav-link {
    padding: 6px 10px;
    font-size: 0.85rem;
  }

  .link-icon {
    font-size: 1rem;
  }

  .modal-content {
    width: 95%;
    max-width: 380px;
  }

  .modal-header h3 {
    font-size: 1.1rem;
  }

  .modal-body p {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .navbar {
    height: 55px;
  }

  .main-content {
    height: calc(100vh - 55px);
  }

  .nav-container {
    padding: 0 10px;
  }

  .brand-icon {
    font-size: 20px;
  }

  .brand-text {
    font-size: 1rem;
  }

  .nav-links {
    gap: 0;
  }

  .nav-link {
    padding: 5px 8px;
    font-size: 0.8rem;
  }

  .link-icon {
    display: none;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 20px;
  }

  .btn-cancel,
  .btn-confirm {
    padding: 10px 16px;
    font-size: 0.9rem;
  }
}
</style>
