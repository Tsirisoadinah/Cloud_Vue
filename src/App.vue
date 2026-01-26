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
          <RouterLink to="/logout" class="nav-link auth-link">
            <span class="link-icon">🚪</span>
            Déconnexion
          </RouterLink>
          <RouterLink to="/blocked-users" class="nav-link auth-link">
            <span class="link-icon">🚫</span>
            Bloqués
          </RouterLink>
        </div>
      </div>
    </nav>
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<script>
export default {
  name: 'App'
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
}
</style>
