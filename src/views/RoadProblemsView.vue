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
      <div class="tooltip-header">
        <h3>Signalement #{{ hoveredProblem.id }}</h3>
        <div class="tooltip-close" @click="closeTooltip">×</div>
      </div>

      <div class="tooltip-body">
        <div class="info-row">
          <span class="info-label">Statut : </span>
          <span :class="`status-badge status-${hoveredProblem.status.replace(' ', '-')}`">
            {{ hoveredProblem.status }}
          </span>
        </div>

        <div class="info-row">
          <span class="info-label">Description : </span>
          <span class="info-text">{{ hoveredProblem.description || 'Aucune description' }}</span>
        </div>

        <div class="info-row">
          <span class="info-label">Surface :</span>
          <span class="info-value">{{ hoveredProblem.surface }} m²</span>
        </div>

        <div class="details-link-section">
          <router-link
            :to="`/signalement/${hoveredProblem.id}/details`"
            class="btn-details"
            @click="closeTooltip"
          >
            Voir les détails
          </router-link>
        </div>

        <hr />

        <!-- Section assignation entreprise -->
        <div v-if="!hoveredProblem.entrepriseId">
          <div v-if="isManager()">
            <h4>Assignation</h4>

            <label>Entreprise :</label>
            <select v-model="selectedEntreprise">
              <option disabled value="">Choisir une entreprise</option>
              <option v-for="e in entreprises" :key="e.id" :value="e.id">
                {{ e.label }}
              </option>
            </select>

            <label>Budget (MGA) :</label>
            <input
              type="number"
              v-model="budget"
              placeholder="Entrez le budget"
            />

            <button
              class="btn-primary"
              :disabled="loadingAssignation || !selectedEntreprise || !budget"
              @click="assigner"
            >
              {{ loadingAssignation ? 'Assignation...' : '✓ Assigner' }}
            </button>
          </div>

          <!-- <div v-else class="no-permission">
            <p>⚠️ Seuls les managers peuvent assigner des entreprises</p>
          </div> -->
        </div>

        <!-- Entreprise déjà assignée -->
        <div v-else class="already-assigned">
          <h4>✓ Assignation</h4>
          <div class="assigned-content">
            <div class="info-row">
              <span class="info-label">Entreprise :</span>
              <span class="info-value">{{ hoveredProblem.entrepriseName || 'Non spécifié' }}</span>
            </div>

            <div class="info-row">
              <span class="info-label">Budget :</span>
              <span class="info-value">{{ formatBudget(hoveredProblem.budget) }} MGA</span>
            </div>
          </div>
        </div>

        <!-- Section modification statut (Manager uniquement) -->
        <div v-if="isManager()" class="status-section">
          <hr />
          <h4>Modifier le statut</h4>

          <div v-if="!showStatusModal">
            <button class="btn-secondary" @click="toggleStatusModal">
              🔄 Changer le statut
            </button>
          </div>

          <div v-else class="status-form">
            <label>Nouveau statut :</label>
            <select v-model="selectedStatus">
              <option disabled value="">Sélectionner un statut</option>
              <option v-for="status in statusList" :key="status.id" :value="status.id">
                {{ status.label }}
              </option>
            </select>

            <div class="button-group">
              <button
                class="btn-success"
                :disabled="loadingStatusUpdate || !selectedStatus"
                @click="updateStatus"
              >
                {{ loadingStatusUpdate ? 'Mise à jour...' : '✓ Valider' }}
              </button>
              <button class="btn-cancel" @click="toggleStatusModal">
                Annuler
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getSignalements, assignEntreprise, updateSignalementStatus } from "@/services/signalementService";
import { getEntreprises } from "@/services/entrepriseService";
import { getStatus } from "@/services/statusService";

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
      statusList: [],
      selectedEntreprise: null,
      selectedStatus: null,
      budget: null,
      loadingAssignation: false,
      loadingStatusUpdate: false,
      closeTimeout: null,
      tooltipLocked: false,
      userRole: null,
      showStatusModal: false
    }
  },

  async mounted() {
    this.getUserRole();
    this.initMap();

    // Charger les signalements en priorité (ne pas bloquer sur les autres)
    await this.loadSignalements();

    // Charger entreprises et statuts en arrière-plan (optionnels)
    this.loadEntreprises().catch(() => {
      console.warn('⚠️ Impossible de charger les entreprises (accès restreint)');
    });
    this.loadStatus().catch(() => {
      console.warn('⚠️ Impossible de charger les statuts (accès restreint)');
    });

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
      try {
        const res = await getEntreprises();
        this.entreprises = res.data || [];
        console.log(`✅ ${this.entreprises.length} entreprises chargées`);
      } catch (e) {
        console.warn("⚠️ Impossible de charger les entreprises (accès restreint ou non authentifié)");
        this.entreprises = [];
      }
    },

    async loadStatus() {
      try {
        this.statusList = await getStatus();
        console.log('✅ Statuts chargés:', this.statusList.length);
      } catch (e) {
        console.warn("⚠️ Impossible de charger les statuts (accès restreint ou non authentifié)");
        this.statusList = [];
      }
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

        alert("✓ Signalement assigné avec succès");

        // reset
        this.selectedEntreprise = null;
        this.budget = null;

        // Recharger les données
        await this.loadSignalements();
        this.clearMarkers();
        this.addProblemsToMap();

        // Fermer le tooltip
        this.closeTooltip();

      } catch (e) {
        console.error(e);
        alert("❌ Erreur lors de l'assignation");
      } finally {
        this.loadingAssignation = false;
      }
    },

    async updateStatus() {
      if (!this.selectedStatus) {
        alert("Veuillez sélectionner un statut");
        return;
      }

      try {
        this.loadingStatusUpdate = true;

        // L'API attend probablement juste l'ID du statut directement
        // await updateSignalementStatus(this.hoveredProblem.id, this.selectedStatus);
        await updateSignalementStatus(this.hoveredProblem.id, {
          routeStatusId: this.selectedStatus
        });

        alert("✓ Statut mis à jour avec succès");

        // reset
        this.selectedStatus = null;
        this.showStatusModal = false;

        // Recharger les données
        await this.loadSignalements();
        this.clearMarkers();
        this.addProblemsToMap();

        // Fermer le tooltip
        this.closeTooltip();

      } catch (e) {
        console.error("Erreur complète:", e);
        console.error("Données envoyées:", {
          signalementId: this.hoveredProblem.id,
          statusId: this.selectedStatus
        });
        alert("❌ Erreur lors de la mise à jour du statut: " + (e.response?.data?.message || e.message));
      } finally {
        this.loadingStatusUpdate = false;
      }
    },

    toggleStatusModal() {
      this.showStatusModal = !this.showStatusModal;
      if (this.showStatusModal) {
        this.selectedStatus = null;
      }
    },

    clearMarkers() {
      this.markers.forEach(marker => {
        this.map.removeLayer(marker);
      });
      this.markers = [];
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
<style src="../assets/page_css/probleme.css"></style>
