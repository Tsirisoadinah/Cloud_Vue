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
      <h3>{{ hoveredProblem.type }}</h3>
      <div class="tooltip-content">
        <p><strong>Date:</strong> {{ formatDate(hoveredProblem.date) }}</p>
        <p><strong>Status:</strong>
          <span :class="`status-badge status-${hoveredProblem.status}`">
            {{ hoveredProblem.status.replace('-', ' ') }}
          </span>
        </p>
        <p><strong>Surface:</strong> {{ hoveredProblem.surface }} m²</p>
        <p><strong>Budget:</strong> {{ formatCurrency(hoveredProblem.budget) }}</p>
        <p><strong>Entreprise:</strong> {{ hoveredProblem.entreprise }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export default {
  name: 'RoadProblemsView',
  data() {
    return {
      map: null,
      markers: [],
      hoveredProblem: null,
      tooltipPosition: { x: 0, y: 0 },
      // Données fictives des problèmes routiers
      roadProblems: [
        {
          id: 1,
          type: 'Nid de poule',
          lat: -18.8792,
          lng: 47.5079,
          date: '2024-01-15',
          status: 'nouveau',
          surface: 15.5,
          budget: 25000,
          entreprise: 'BTP Madagascar'
        },
        {
          id: 2,
          type: 'Fissure chaussée',
          lat: -18.8850,
          lng: 47.5150,
          date: '2024-01-10',
          status: 'en-cours',
          surface: 45.2,
          budget: 75000,
          entreprise: 'Routes & Travaux'
        },
        {
          id: 3,
          type: 'Affaissement',
          lat: -18.8720,
          lng: 47.5200,
          date: '2024-01-08',
          status: 'termine',
          surface: 28.7,
          budget: 50000,
          entreprise: 'Construction Malagasy'
        },
        {
          id: 4,
          type: 'Usure revêtement',
          lat: -18.8900,
          lng: 47.5100,
          date: '2024-01-20',
          status: 'nouveau',
          surface: 120.0,
          budget: 150000,
          entreprise: 'Infraroutes'
        },
        {
          id: 5,
          type: 'Trou dans chaussée',
          lat: -18.8750,
          lng: 47.5300,
          date: '2024-01-12',
          status: 'en-cours',
          surface: 8.3,
          budget: 18000,
          entreprise: 'BTP Madagascar'
        },
        {
          id: 6,
          type: 'Déformation',
          lat: -18.8650,
          lng: 47.5050,
          date: '2023-12-28',
          status: 'termine',
          surface: 67.9,
          budget: 95000,
          entreprise: 'Routes & Travaux'
        }
      ]
    }
  },
  mounted() {
    this.initMap()
    this.addProblemsToMap()
  },
  beforeUnmount() {
    if (this.map) {
      this.map.remove()
    }
  },
  methods: {
    initMap() {
      this.map = L.map('map').setView(
        [-18.8792, 47.5079], // Antananarivo
        13
      )

      L.tileLayer('http://localhost:8080/tile/{z}/{x}/{y}.png', {
        maxZoom: 18,
        minZoom: 5,
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map)
    },

    addProblemsToMap() {
      this.roadProblems.forEach(problem => {
        const icon = this.createCustomIcon(problem.status)

        const marker = L.marker([problem.lat, problem.lng], { icon })
          .addTo(this.map)

        // Événements pour le tooltip personnalisé
        marker.on('mouseover', (e) => {
          this.showTooltip(problem, e)
        })

        marker.on('mouseout', () => {
          this.hideTooltip()
        })

        marker.on('mousemove', (e) => {
          this.updateTooltipPosition(e)
        })

        this.markers.push(marker)
      })
    },

    createCustomIcon(status) {
      let color = '#3388ff' // Couleur par défaut

      switch(status) {
        case 'nouveau':
          color = '#ff4444'
          break
        case 'en-cours':
          color = '#ffaa00'
          break
        case 'termine':
          color = '#44aa44'
          break
      }

      return L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      })
    },

    showTooltip(problem, event) {
      this.hoveredProblem = problem
      this.updateTooltipPosition(event)
    },

    hideTooltip() {
      this.hoveredProblem = null
    },

    updateTooltipPosition(event) {
      if (this.hoveredProblem) {
        this.tooltipPosition = {
          x: event.originalEvent.pageX + 10,
          y: event.originalEvent.pageY - 10
        }
      }
    },

    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },

    formatCurrency(amount) {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'MGA',
        minimumFractionDigits: 0
      }).format(amount)
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
