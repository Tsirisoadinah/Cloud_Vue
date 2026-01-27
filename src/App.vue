<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-brand">
          <RouterLink to="/" class="brand-link">
            <i class="fas fa-map brand-icon"></i>
            <span class="brand-text">CarteMada</span>
          </RouterLink>
        </div>
        <div class="nav-links">
          <RouterLink to="/" class="nav-link">
            <i class="fas fa-home link-icon"></i>
            Accueil
          </RouterLink>
          <RouterLink to="/road-problems" class="nav-link">
            <i class="fas fa-map-marker-alt link-icon"></i>
            Carte
          </RouterLink>
          <RouterLink to="/about" class="nav-link">
            <i class="fas fa-chart-bar link-icon"></i>
            Tableau de Bord
          </RouterLink>
          <div class="nav-divider"></div>
          <RouterLink to="/login" class="nav-link auth-link">
            <i class="fas fa-sign-in-alt link-icon"></i>
            Connexion
          </RouterLink>
          <a @click.prevent="showLogoutConfirmation" class="nav-link auth-link logout-link">
            <i class="fas fa-sign-out-alt link-icon"></i>
            Déconnexion
          </a>
          <RouterLink to="/blocked-users" class="nav-link auth-link">
            <i class="fas fa-ban link-icon"></i>
            Bloqués
          </RouterLink>
          <button @click="handleSync" class="nav-link sync-button" :disabled="isSyncing">
            <i class="fas fa-sync link-icon" :class="{ 'fa-spin': isSyncing }"></i>
            {{ isSyncing ? 'Synchronisation...' : 'Synchroniser' }}
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
          <h3>
            <i class="fas fa-sign-out-alt modal-title-icon"></i>
            Confirmation de déconnexion
          </h3>
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
            <i class="fas fa-sign-out-alt"></i>
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from './services/api.js'

export default {
  name: 'App',

  data() {
    return {
      showLogoutModal: false,
      isSyncing: false
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
      if (this.isSyncing) return;

      this.isSyncing = true;

      // Appel de l'API de synchronisation Firebase
      api.get('/admin/sync/firebase')
        .then(response => {
          console.log('Synchronisation réussie:', response.data);
          alert('Synchronisation Firebase réussie !');
        })
        .catch(error => {
          console.error('Erreur lors de la synchronisation:', error);
          alert('Erreur lors de la synchronisation Firebase');
        })
        .finally(() => {
          this.isSyncing = false;
        });
    }
  }
}
</script>

<style>
/* Styles supplémentaires pour les icônes */
.brand-icon {
  margin-right: 8px;
  font-size: 1.2em;
}

.link-icon {
  margin-right: 8px;
  width: 16px;
  text-align: center;
}

.modal-title-icon {
  margin-right: 10px;
}

/* Assurez-vous que la classe fa-spin fonctionne */
.fa-spin {
  animation: fa-spin 1s infinite linear;
}
</style>

<style src="./assets/page_css/bar.css"></style>