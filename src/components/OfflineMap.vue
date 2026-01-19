<template>
  <div id="map"></div>
</template>

<script>
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Configuration simple pour les icônes de marqueurs
L.Icon.Default.prototype.options.iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png'
L.Icon.Default.prototype.options.iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png'
L.Icon.Default.prototype.options.shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'

export default {
  name: 'OfflineMap',
  mounted() {
    console.log('OfflineMap component mounted')

    const map = L.map('map').setView(
      [-18.8792, 47.5079], // Antananarivo
      13
    )

    console.log('Map created')

    L.tileLayer('http://localhost:8080/tile/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 5
    }).addTo(map)

    console.log('Tile layer added')

    // Exemple de marqueur
    L.marker([-18.8792, 47.5079])
      .addTo(map)
      .bindPopup('Antananarivo')

    console.log('Marker added')
  }
}
</script>

<style>
#map {
  position: absolute;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  z-index: 1;
}
</style>
