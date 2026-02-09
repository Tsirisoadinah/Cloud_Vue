<template>
  <div class="signalement-photos">
    <div class="photos-header">
      <h1>Photos du signalement #{{ signalementId }}</h1>
      <RouterLink class="back-link" to="/road-problems">Retour a la carte</RouterLink>
    </div>

    <div v-if="loading" class="state">Chargement...</div>
    <div v-else-if="error" class="state error">{{ error }}</div>
    <div v-else-if="photosWithSrc.length === 0" class="state">Aucune photo disponible.</div>

    <div v-else class="photos-grid">
      <div v-for="p in photosWithSrc" :key="p._key" class="photo-card">
        <img
          v-if="p._src"
          :src="p._src"
          :alt="p._alt"
          loading="lazy"
          class="photo-thumb"
          @click="openPhoto(p)"
        />
        <div v-else class="photo-missing">Photo indisponible</div>
      </div>
    </div>

    <div v-if="selectedPhoto" class="photo-overlay" @click.self="closePhoto">
      <button class="overlay-close" @click="closePhoto">×</button>
      <img
        v-if="selectedPhoto._src"
        :src="selectedPhoto._src"
        :alt="selectedPhoto._alt"
        class="photo-large"
      />
    </div>
  </div>
</template>

<script>
import { getPhotosBySignalement } from "@/services/signalementService";

export default {
  name: "SignalementPhotoView",
  data() {
    return {
      signalementId: null,
      photos: [],
      loading: false,
      error: null,
      selectedPhoto: null
    };
  },
  computed: {
    photosWithSrc() {
      return this.photos.map((photo, index) => {
        const src = this.buildPhotoSrc(photo);
        const alt = this.buildPhotoAlt(photo, index);
        return {
          ...photo,
          _src: src,
          _alt: alt,
          _key: photo?.id ?? `photo-${index}`
        };
      });
    }
  },
  async mounted() {
    this.signalementId = this.$route.params.id;

    if (!this.signalementId) {
      this.error = "Signalement introuvable.";
      return;
    }

    await this.loadPhotos();
  },
  methods: {
    async loadPhotos() {
      this.loading = true;
      this.error = null;

      try {
        const res = await getPhotosBySignalement(this.signalementId);
        const data = res?.data?.data ?? res?.data ?? [];
        this.photos = Array.isArray(data) ? data : [];
      } catch (e) {
        console.error("Erreur chargement photos", e);
        this.error = "Impossible de charger les photos.";
      } finally {
        this.loading = false;
      }
    },
    buildPhotoSrc(photo) {
      const bytes = photo?.bytes || photo?.base64 || photo?.content;
      if (!bytes) return "";
      const mime = photo?.mimeType || photo?.type || "image/jpeg";
      return `data:${mime};base64,${bytes}`;
    },
    buildPhotoAlt(photo, index) {
      const id = photo?.id ?? index + 1;
      return `Photo ${id}`;
    },
    openPhoto(photo) {
      this.selectedPhoto = photo;
    },
    closePhoto() {
      this.selectedPhoto = null;
    }
  }
};
</script>

<style scoped>
.signalement-photos {
  padding: 20px;
  max-width: 1100px;
  margin: 0 auto;
}

.photos-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.photos-header h1 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.back-link {
  text-decoration: none;
  color: #1e88e5;
  background: #e3f2fd;
  border: 1px solid #bbdefb;
  padding: 6px 10px;
  border-radius: 6px;
  font-weight: 600;
}

.back-link:hover {
  background: #bbdefb;
  border-color: #1e88e5;
}

.state {
  padding: 12px;
  color: #555;
  background: #f5f5f5;
  border-radius: 8px;
}

.state.error {
  color: #b00020;
  background: #fdecea;
  border: 1px solid #f5c2c7;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}

.photo-card {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 140px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.photo-thumb {
  width: 100%;
  height: 140px;
  object-fit: cover;
  border-radius: 8px;
  cursor: zoom-in;
  transition: transform 0.15s ease;
}

.photo-thumb:hover {
  transform: scale(1.02);
}

.photo-missing {
  font-size: 12px;
  color: #777;
  text-align: center;
}

.photo-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  padding: 24px;
}

.photo-large {
  max-width: 90vw;
  max-height: 85vh;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.overlay-close {
  position: absolute;
  top: 16px;
  right: 20px;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  font-size: 28px;
  width: 40px;
  height: 40px;
  border-radius: 20px;
  cursor: pointer;
}

.overlay-close:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>