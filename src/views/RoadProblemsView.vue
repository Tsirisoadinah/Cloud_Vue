<template>
  <div class="road-problems-container">
    <div class="header">
      <h1>Carte des Problèmes Routiers</h1>
      <div class="legend">
        <div class="legend-item">
          <span class="dot status-nouveau"></span>
          <span>Nouveau</span>
        </div>
        <div class="legend-item">
          <span class="dot status-en-cours"></span>
          <span>En cours</span>
        </div>
        <div class="legend-item">
          <span class="dot status-termine"></span>
          <span>Terminé</span>
        </div>
      </div>
    </div>
    <div id="map" ref="mapContainer"></div>

    <!-- Tooltip personnalisé -->
    <div
      v-if="hoveredProblem"
      :style="{ left: tooltipPosition.x + 'px', top: tooltipPosition.y + 'px' }"
      class="custom-tooltip"
      @mouseenter="keepTooltipOpen"
      @mouseleave="scheduleTooltipClose"
    >
      <div class="tooltip-close" @click="closeTooltip">×</div>
      
      <p>
        <strong>Statut :</strong>
        <span :class="`status-badge status-${hoveredProblem.status}`">
          {{ hoveredProblem.status }}
        </span>
      </p>

      <p><strong>Description :</strong></p>
      <p>{{ hoveredProblem.description }}</p>

      <p><strong>Surface :</strong> {{ hoveredProblem.surface }} m²</p>

      <hr />

      <div v-if="!hoveredProblem.entrepriseId">
        <!-- Formulaire d'assignation (uniquement pour les managers) -->
        <div v-if="isManager()">
          <label>Entreprise :</label>
          <select v-model="selectedEntreprise">
            <option disabled value="">Choisir</option>
            <option v-for="e in entreprises" :key="e.id" :value="e.id">
              {{ e.label }}
            </option>
          </select>

          <!-- Budget -->
          <label>Budget :</label>
          <input
            type="number"
            v-model="budget"
            placeholder="Budget en MGA"
          />

          <button
            :disabled="loadingAssignation"
            @click="assigner"
          >
            {{ loadingAssignation ? 'Assignation...' : 'Assigner' }}
          </button>
        </div>

        <!-- Message pour les non-managers -->
        <div v-else class="no-permission">
          <p>⚠️ Seuls les managers peuvent assigner des entreprises.</p>
        </div>
      </div>

      <div v-else class="already-assigned">
        <p><strong>✓ Entreprise assignée</strong></p>
        <div class="assigned-info">
          <p><strong>Entreprise :</strong></p>
          <p class="info-value">{{ hoveredProblem.entrepriseName || 'Non spécifié' }}</p>
          
          <p><strong>Budget :</strong></p>
          <p class="info-value">{{ formatBudget(hoveredProblem.budget) }} MGA</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getSignalements, assignEntreprise } from "@/services/signalementService";
import { getEntreprises } from "@/services/entrepriseService";

export default {
  name: 'RoadProblemsView',

  data() {
    return {
      map: null,
      markers: [],
      hoveredProblem: null,
      tooltipPosition: { x: 0, y: 0 },
      roadProblems: [],
      entreprises: [],
      selectedEntreprise: null,
      budget: null,
      loadingAssignation: false,
      closeTimeout: null,
      tooltipLocked: false,
      userRole: null
    }
  },

  async mounted() {
    this.getUserRole();
    this.initMap();
    await Promise.all([
      this.loadSignalements(),
      this.loadEntreprises()
    ]);
    this.addProblemsToMap();
  },

  beforeUnmount() {
    if (this.map) {
      this.map.remove();
    }
    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
    }
  },

  methods: {
    getUserRole() {
      try {
        const role = localStorage.getItem('role');
        this.userRole = role;
        console.log('👤 Rôle utilisateur:', role);
      } catch (e) {
        console.error("Erreur lecture du rôle", e);
        this.userRole = null;
      }
    },

    isManager() {
      return this.userRole === 'manager';
    },

    async loadSignalements() {
      try {
        const data = await getSignalements();

        // Filtrer uniquement les signalements avec coordonnées valides
        this.roadProblems = data
          .filter(s => s.latitude !== null && s.longitude !== null)
          .map(s => ({
            id: s.id,
            lat: s.latitude,
            lng: s.longitude,
            status: s.routeStatusName,
            description: s.problemeDescription,
            surface: s.surface,
            entrepriseId: s.routeEntrepriseId,
            entrepriseName: s.routeEntrepriseName,
            budget: s.budget
          }));

        console.log(`✅ ${this.roadProblems.length} signalements chargés avec coordonnées valides`);

      } catch (e) {
        console.error("Erreur chargement signalements", e);
      }
    },

    async loadEntreprises() {
      const res = await getEntreprises();
      this.entreprises = res.data;
    },

    async assigner() {
      if (!this.selectedEntreprise || !this.budget) {
        alert("Entreprise et budget requis");
        return;
      }

      try {
        this.loadingAssignation = true;

        await assignEntreprise(this.hoveredProblem.id, {
          entrepriseId: this.selectedEntreprise,
          budget: this.budget
        });

        alert("Signalement assigné avec succès");

        // reset
        this.selectedEntreprise = null;
        this.budget = null;
        
        // Recharger les données
        await this.loadSignalements();
        
        // Fermer le tooltip
        this.closeTooltip();

      } catch (e) {
        console.error(e);
        alert("Erreur lors de l'assignation");
      } finally {
        this.loadingAssignation = false;
      }
    },

    initMap() {
      this.map = L.map('map').setView(
        [-18.8792, 47.5079],
        13
      );

      L.tileLayer('http://localhost:8080/tile/{z}/{x}/{y}.png', {
        maxZoom: 18,
        minZoom: 5
      }).addTo(this.map);
    },

    addProblemsToMap() {
      console.log(`📍 Ajout de ${this.roadProblems.length} marqueurs sur la carte`);
      
      this.roadProblems.forEach((problem, index) => {
        // Vérification supplémentaire de sécurité
        if (!problem.lat || !problem.lng || isNaN(problem.lat) || isNaN(problem.lng)) {
          console.warn(`⚠️ Coordonnées invalides ignorées pour le signalement #${problem.id}`);
          return;
        }

        const icon = this.createCustomIcon(problem.status);

        const marker = L.marker([problem.lat, problem.lng], { icon })
          .addTo(this.map);

        marker.on('mouseover', e => this.showTooltip(problem, e));
        marker.on('mouseout', () => this.scheduleTooltipClose());
        marker.on('mousemove', this.updateTooltipPosition);

        this.markers.push(marker);
      });
      
      console.log(`✅ ${this.markers.length} marqueurs ajoutés avec succès`);
    },

    createCustomIcon(status) {
      const colors = {
        'nouveau': '#ff4444',
        'en cours': '#ffaa00',
        'termine': '#44aa44'
      };

      return L.divIcon({
        html: `<div style="background:${colors[status] || '#3388ff'};width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });
    },

    showTooltip(problem, event) {
      if (this.closeTimeout) {
        clearTimeout(this.closeTimeout);
        this.closeTimeout = null;
      }
      
      this.hoveredProblem = problem;
      this.updateTooltipPosition(event);
    },

    keepTooltipOpen() {
      if (this.closeTimeout) {
        clearTimeout(this.closeTimeout);
        this.closeTimeout = null;
      }
      this.tooltipLocked = true;
    },

    scheduleTooltipClose() {
      this.closeTimeout = setTimeout(() => {
        if (!this.tooltipLocked) {
          this.closeTooltip();
        }
        this.tooltipLocked = false;
      }, 200);
    },

    closeTooltip() {
      this.hoveredProblem = null;
      this.selectedEntreprise = null;
      this.budget = null;
      this.tooltipLocked = false;
      if (this.closeTimeout) {
        clearTimeout(this.closeTimeout);
        this.closeTimeout = null;
      }
    },

    updateTooltipPosition(event) {
      if (!this.hoveredProblem) return;

      const offsetX = 10;
      const offsetY = 10;
      const mouseX = event.originalEvent.pageX;
      const mouseY = event.originalEvent.pageY;
      
      // Dimensions estimées du tooltip
      const tooltipWidth = 320;
      const tooltipHeight = 400; // hauteur estimée maximale
      
      // Dimensions de la fenêtre
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      // Position X : à droite de la souris, ou à gauche si pas assez d'espace
      let x = mouseX + offsetX;
      if (x + tooltipWidth > windowWidth) {
        x = mouseX - tooltipWidth - offsetX;
      }
      
      // Position Y : en dessous de la souris, ou au-dessus si pas assez d'espace
      let y = mouseY + offsetY;
      if (y + tooltipHeight > windowHeight) {
        y = mouseY - tooltipHeight - offsetY;
        // Si toujours pas assez d'espace en haut, aligner en haut de l'écran
        if (y < 0) {
          y = 10;
        }
      }

      this.tooltipPosition = { x, y };
    },

    formatBudget(budget) {
      if (!budget) return '0';
      return new Intl.NumberFormat('fr-FR').format(budget);
    }
  }
}
</script>

<style scoped>
.road-problems-container {
  position: relative;
  height: 100vh;
  width: 100%;
}

.header {
  position: absolute;
  top: 20px;
  left: 20px;
  background: white;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  z-index: 1000;
  min-width: 250px;
}

.header h1 {
  margin: 0 0 15px 0;
  font-size: 18px;
  color: #333;
}

.legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #555;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}

.status-nouveau {
  background-color: #ff4444;
}

.status-en-cours {
  background-color: #ffaa00;
}

.status-termine {
  background-color: #44aa44;
}

#map {
  height: 100vh;
  width: 100%;
  z-index: 1;
}

.custom-tooltip {
  position: fixed;
  background: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 2000;
  max-width: 320px;
  min-width: 280px;
  max-height: 90vh; /* Limite la hauteur maximale */
  overflow-y: auto; /* Scroll si contenu trop long */
  pointer-events: auto; /* IMPORTANT : permet l'interaction */
}

.tooltip-close {
  position: absolute;
  top: 8px;
  right: 12px;
  font-size: 24px;
  font-weight: bold;
  color: #999;
  cursor: pointer;
  line-height: 1;
  user-select: none;
}

.tooltip-close:hover {
  color: #333;
}

.custom-tooltip p {
  margin: 8px 0;
  font-size: 14px;
  color: #555;
}

.custom-tooltip strong {
  color: #333;
}

.custom-tooltip hr {
  border: none;
  border-top: 1px solid #eee;
  margin: 12px 0;
}

.custom-tooltip label {
  display: block;
  margin-top: 10px;
  margin-bottom: 5px;
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.custom-tooltip select,
.custom-tooltip input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.custom-tooltip select:focus,
.custom-tooltip input:focus {
  outline: none;
  border-color: #4CAF50;
}

.custom-tooltip button {
  width: 100%;
  background: #4CAF50;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 12px;
  font-size: 14px;
  font-weight: 600;
  transition: background 0.2s;
}

.custom-tooltip button:hover:not(:disabled) {
  background: #45a049;
}

.custom-tooltip button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.status-badge {
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  text-transform: capitalize;
  color: white;
  display: inline-block;
}

.status-badge.status-nouveau {
  background-color: #ff4444;
}

.status-badge.status-en-cours {
  background-color: #ffaa00;
}

.status-badge.status-termine {
  background-color: #44aa44;
}

.already-assigned {
  padding: 15px;
  background: #f0f9f0;
  border-radius: 5px;
  border-left: 4px solid #4CAF50;
}

.already-assigned > p:first-child {
  color: #2e7d32;
  text-align: center;
  margin-bottom: 12px;
  font-size: 15px;
}

.assigned-info {
  background: white;
  padding: 10px;
  border-radius: 4px;
  margin-top: 8px;
}

.assigned-info p {
  margin: 5px 0;
}

.assigned-info p strong {
  color: #666;
  font-size: 13px;
}

.info-value {
  color: #333;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 10px !important;
  padding-left: 5px;
}

.no-permission {
  padding: 15px;
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 5px;
  text-align: center;
}

.no-permission p {
  margin: 0;
  color: #856404;
  font-size: 13px;
  font-weight: 500;
}

/* Styles pour les marqueurs personnalisés */
:deep(.custom-marker) {
  background: none;
  border: none;
}
</style>