// LogoutView.vue
<script setup>
import { logout } from '@/services/authService'
import { useRouter } from 'vue-router'

const router = useRouter()

logout()
router.push('/login')
</script>

<template>
  <p>Déconnexion...</p>
</template>
