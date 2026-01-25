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
    >
      <p>
        <strong>Statut :</strong>
        <span :class="`status-badge status-${hoveredProblem.status}`">
          {{ hoveredProblem.status }}
        </span>
      </p>

      <p><strong>Description :</strong></p>
      <p>{{ hoveredProblem.description }}</p>

      <p><strong>Surface :</strong> {{ hoveredProblem.surface }} m²</p>
    </div>

  </div>
</template>

<script>
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getSignalements } from "@/services/signalementService";

export default {
  name: 'RoadProblemsView',

  data() {
    return {
      map: null,
      markers: [],
      hoveredProblem: null,
      tooltipPosition: { x: 0, y: 0 },
      roadProblems: []
    }
  },

  async mounted() {
    this.initMap();
    await this.loadSignalements();
    this.addProblemsToMap();
  },

  beforeUnmount() {
    if (this.map) {
      this.map.remove();
    }
  },

  methods: {
    async loadSignalements() {
      try {
        const data = await getSignalements();

        this.roadProblems = data.map(s => ({
          id: s.id,
          lat: s.latitude,
          lng: s.longitude,
          status: s.routeStatusName,
          description: s.problemeDescription,
          surface: s.surface
        }));

      } catch (e) {
        console.error("Erreur chargement signalements", e);
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
      this.roadProblems.forEach(problem => {
        const icon = this.createCustomIcon(problem.status);

        const marker = L.marker([problem.lat, problem.lng], { icon })
          .addTo(this.map);

        marker.on('mouseover', e => this.showTooltip(problem, e));
        marker.on('mouseout', this.hideTooltip);
        marker.on('mousemove', this.updateTooltipPosition);

        this.markers.push(marker);
      });
    },

    createCustomIcon(status) {
      const colors = {
        'nouveau': '#ff4444',
        'en-cours': '#ffaa00',
        'termine': '#44aa44'
      };

      return L.divIcon({
        html: `<div style="background:${colors[status] || '#3388ff'};width:20px;height:20px;border-radius:50%;border:3px solid white;"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });
    },

    showTooltip(problem, event) {
      this.hoveredProblem = problem;
      this.updateTooltipPosition(event);
    },

    hideTooltip() {
      this.hoveredProblem = null;
    },

    updateTooltipPosition(event) {
      if (!this.hoveredProblem) return;

      this.tooltipPosition = {
        x: event.originalEvent.pageX + 10,
        y: event.originalEvent.pageY - 10
      };
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
  max-width: 300px;
  pointer-events: none;
}

.custom-tooltip h3 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 16px;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

.tooltip-content p {
  margin: 5px 0;
  font-size: 14px;
  color: #555;
}

.status-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  text-transform: capitalize;
  color: white;
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

/* Styles pour les marqueurs personnalisés */
:deep(.custom-marker) {
  background: none;
  border: none;
}
</style>
