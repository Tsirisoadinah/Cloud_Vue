<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-brand">
        <h2>🗺️ CarteMada</h2>
      </div>
      <div class="nav-links">
        <RouterLink to="/" class="nav-link">Accueil</RouterLink>
        <RouterLink to="/road-problems" class="nav-link">Problèmes Routiers</RouterLink>
        <RouterLink to="/about" class="nav-link">À propos</RouterLink>
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

body, html {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

#app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  background: #2c3e50;
  color: white;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  z-index: 1000;
}

.nav-brand h2 {
  margin: 0;
  font-size: 24px;
}

.nav-links {
  display: flex;
  gap: 20px;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav-link:hover {
  background-color: rgba(255,255,255,0.1);
}

.nav-link.router-link-active {
  background-color: #3498db;
}

.main-content {
  flex: 1;
  overflow: hidden;
}
</style>
