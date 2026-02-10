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
        <div class="tooltip-actions">
          <RouterLink
            class="photos-link"
            :to="`/signalements/${hoveredProblem.id}/photos`"
          >
            Voir les photos
          </RouterLink>
          <div class="tooltip-close" @click="closeTooltip">×</div>
        </div>
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

        <div class="info-row" v-if="hoveredProblem.budget || calculatedBudget">
          <span class="info-label">Budget :</span>
          <span class="info-value">{{ formatBudget(hoveredProblem.budget || calculatedBudget) }}</span>
        </div>

        <hr />

        <!-- Section assignation entreprise -->
        <div v-if="!hoveredProblem.entrepriseId">
          <div v-if="isManager()">
            <h4>Assignation</h4>

            <label>Entreprise :</label>
            <select v-model="selectedEntreprise" :disabled="!isHoveredProblemNouveau">
              <option disabled value="">Choisir une entreprise</option>
              <option v-for="e in entreprises" :key="e.id" :value="e.id">
                {{ e.label }}
              </option>
            </select>

            <label>Niveau (1-10) :</label>
            <select v-model.number="niveau" :disabled="!isHoveredProblemNouveau">
              <option disabled value="">Choisir un niveau</option>
              <option v-for="level in levelOptions" :key="level" :value="level">
                {{ level }}
              </option>
            </select>
            <small v-if="!isHoveredProblemNouveau">
              Assignation entreprise + niveau possible uniquement quand le statut est "nouveau".
            </small>

            <button
              class="btn-primary"
              :disabled="loadingAssignation || !isHoveredProblemNouveau || !selectedEntreprise || !niveau"
              @click="assigner"
            >
              {{ loadingAssignation ? 'Assignation...' : '✓ Assigner' }}
            </button>
            <div v-if="calculatedBudget" class="info-row">
              <span class="info-label">Budget estimé :</span>
              <span class="info-value">{{ formatBudget(calculatedBudget) }}</span>
            </div>
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
            <div class="info-row" v-if="hoveredProblem.budget != null">
              <span class="info-label">Budget :</span>
              <span class="info-value">{{ formatBudget(hoveredProblem.budget) }}</span>
            </div>

          </div>
        </div>

        <!-- Section modification statut (Manager uniquement) -->
        <div v-if="isManager()" class="status-section">
          <hr />
          <h4>Gestion de statut</h4>

          <!-- 🔎 Lien vers l’historique -->
          <div class="history-link">
            <RouterLink
              :to="`/road-problems/${hoveredProblem.id}/historique`"
            >
              Voir l’historique des statuts
            </RouterLink>
          </div>

          <div v-if="!showStatusModal">
            <button class="btn-secondary" @click="toggleStatusModal">
              🔄 Changer le statut
            </button>
          </div>

          <div v-else class="status-form">
            <label>Nouveau statut :</label>
            <select v-model="selectedStatus">
              <option disabled value="">Sélectionner un statut</option>
              <option v-for="status in allowedStatusOptions" :key="status.id" :value="status.id">
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
import { getPrix } from "@/services/prixService";

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
      niveau: null,
      prixForfaitaire: null,
      loadingAssignation: false,
      loadingStatusUpdate: false,
      closeTimeout: null,
      tooltipLocked: false,
      userRole: null,
      showStatusModal: false,
      photos: []
    }
  },

  computed: {
    levelOptions() {
      return Array.from({ length: 10 }, (_, index) => index + 1);
    },
    isHoveredProblemNouveau() {
      if (!this.hoveredProblem || !this.hoveredProblem.status) {
        return false;
      }
      return this.hoveredProblem.status.toLowerCase() === 'nouveau';
    },
    calculatedBudget() {
      if (!this.hoveredProblem || this.niveau == null || this.prixForfaitaire == null) {
        return null;
      }

      const surface = Number(this.hoveredProblem.surface);
      const prix = Number(this.prixForfaitaire);

      if (Number.isNaN(surface) || Number.isNaN(prix)) {
        return null;
      }

      return prix * surface * this.niveau;
    },
    currentStatusValue() {
      if (!this.hoveredProblem?.status || !this.statusList?.length) {
        return null;
      }
      const currentLabel = String(this.hoveredProblem.status).trim().toLowerCase();
      const match = this.statusList.find(status => {
        const label = String(status.label || '').trim().toLowerCase();
        return label === currentLabel;
      });
      return match?.valeur ?? null;
    },
    allowedStatusOptions() {
      const currentValue = this.currentStatusValue;
      if (currentValue == null) {
        return this.statusList;
      }
      return this.statusList.filter(status => (status?.valeur ?? 0) >= currentValue);
    }
  },

  async mounted() {
    this.getUserRole();
    this.initMap();

    // Charger les signalements en priorité (ne pas bloquer sur les autres)
    await this.loadSignalements();


    // Charger entreprises, statuts et prix forfaitaire en arrière-plan (optionnels)
    this.loadEntreprises().catch(() => {
      console.warn('⚠️ Impossible de charger les entreprises (accès restreint)');
    });
    this.loadStatus().catch(() => {
      console.warn('⚠️ Impossible de charger les statuts (accès restreint)');
    });
    this.loadPrixForfaitaire().catch(() => {
      console.warn('⚠️ Impossible de charger le prix forfaitaire');
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

    async loadPhotos(signalementId) {
      try {
        const res = await getPhotosBySignalement(signalementId);
        this.photos = res.data.data || [];
        console.log(`✅ ${this.photos.length} photos chargées pour le signalement #${signalementId}`);
      } catch (e) {
        console.warn(`⚠️ Impossible de charger les photos pour le signalement #${signalementId}`);
        this.photos = [];
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

    async loadPrixForfaitaire() {
      try {
        const res = await getPrix();
        this.prixForfaitaire = Number(res?.data?.data?.montant) ?? null;
      } catch (e) {
        this.prixForfaitaire = null;
        console.warn("⚠️ Impossible de charger le prix forfaitaire", e);
      }
    },


    async assigner() {
      if (!this.isHoveredProblemNouveau) {
        alert('Assignation possible uniquement quand le statut est "nouveau"');
        return;
      }

      if (!this.selectedEntreprise || !this.niveau) {
        alert("Entreprise et niveau requis");
        return;
      }
      if (this.isHoveredProblemNouveau && !this.calculatedBudget) {
        alert("Impossible de calculer le budget");
        return;
      }

      try {
        this.loadingAssignation = true;

        const budgetValue = this.calculatedBudget;
        await assignEntreprise(this.hoveredProblem.id, {
          entrepriseId: this.selectedEntreprise,
          budget: budgetValue
        });

        alert("✓ Signalement assigné avec succès");

        // reset
        this.selectedEntreprise = null;
        this.niveau = null;

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
      this.niveau = null;
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

    formatBudget(value) {
      if (!value) return '0';
      return new Intl.NumberFormat('fr-FR').format(value);
    }
  }
}
</script>
<style src="../assets/page_css/probleme.css"></style>
