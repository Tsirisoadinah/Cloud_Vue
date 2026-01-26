<template>
  <div class="road-problems-container">
    <div id="map"></div>
  </div>
</template>

<script>
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default {
  name: 'RoadProblemsTestMap',
  data() {
    return {
      map: null,
      markers: [],
      roadProblems: [
        { id: 1, lat: -18.915, lng: 47.511, status: 'nouveau', description: 'Trou profond sur la route', surface: 10 },
        { id: 2, lat: -18.920, lng: 47.515, status: 'en cours', description: 'Fissure', surface: 5 },
        { id: 3, lat: -18.918, lng: 47.508, status: 'termine', description: 'Réparé', surface: 8 }
      ]
    };
  },
  mounted() {
    this.initMap();
    this.addProblemsToMap();
  },
  methods: {
    initMap() {
      this.map = L.map('map').setView([-18.91535, 47.51108], 14);

      // Tuiles Tileserver GL depuis le MBTiles
      L.tileLayer('http://localhost:8080/data/madagascar/{z}/{x}/{y}.png', {
        maxZoom: 18,
        minZoom: 5,
        attribution: '&copy; OpenStreetMap'
      }).addTo(this.map);
    },

    addProblemsToMap() {
      this.roadProblems.forEach(problem => {
        const icon = this.createCustomIcon(problem.status);

        const marker = L.marker([problem.lat, problem.lng], { icon }).addTo(this.map);

        marker.bindPopup(`
          <b>Signalement #${problem.id}</b><br/>
          Statut: ${problem.status}<br/>
          Description: ${problem.description}<br/>
          Surface: ${problem.surface} m²
        `);

        this.markers.push(marker);
      });
    },

    createCustomIcon(status) {
      const colors = {
        'nouveau': '#ff4444',
        'en cours': '#ffaa00',
        'termine': '#44aa44'
      };

      return L.divIcon({
        html: `<div style="background:${colors[status] || '#3388ff'};
                         width:20px;height:20px;border-radius:50%;
                         border:3px solid white;
                         box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });
    }
  }
};
</script>

<style scoped>
#map {
  width: 100vw;
  height: 100vh;
}
</style>
