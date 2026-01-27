<template>
  <div class="users-container">
    <div class="page-header">
      <h1>👥 Gestion des utilisateurs</h1>
      <button @click="loadUsers" class="btn-refresh">🔄 Actualiser</button>
    </div>

    <div v-if="!hasToken" class="restriction-alert">
      <p>❌ Accès refusé - Vous devez être connecté pour accéder à la liste des utilisateurs.</p>
      <RouterLink to="/login" class="btn-login">Se connecter</RouterLink>
    </div>

    <div v-else class="users-table-container">
      <table class="users-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Pseudo</th>
            <th>Rôle</th>
            <th>Tentatives</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.email }}</td>
            <td>{{ user.pseudo || '-' }}</td>
            <td>
              <span class="role-badge" :class="`role-${user.userRoleId}`">
                {{ getRoleName(user.userRoleId) }}
              </span>
            </td>
            <td>
              <span class="tentatives-badge" :class="{ 'warning': user.nbrTentative > 2 }">
                {{ user.nbrTentative }}
              </span>
            </td>
            <td>
              <button 
                @click="openEditModal(user)" 
                class="btn-edit"
              >
                ✏️ Modifier
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="users.length === 0" class="empty-state">
        <p>📭 Aucun utilisateur trouvé</p>
      </div>
    </div>

    <!-- Modal de modification -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>✏️ Modifier l'utilisateur</h3>
          <button class="modal-close" @click="closeEditModal">×</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label>Email</label>
            <input 
              type="email" 
              v-model="editForm.email" 
              placeholder="email@exemple.com"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label>Pseudo</label>
            <input 
              type="text" 
              v-model="editForm.pseudo" 
              placeholder="Nom d'utilisateur"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label>Rôle</label>
            <select v-model="editForm.userRoleId" class="form-select">
              <option :value="1">Visiteur</option>
              <option :value="2">Manager</option>
              <option :value="3">Admin</option>
            </select>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" @click="closeEditModal">
            Annuler
          </button>
          <button 
            class="btn-save" 
            @click="saveUser"
            :disabled="isSaving"
          >
            {{ isSaving ? 'Enregistrement...' : '✓ Enregistrer' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { getUsers, updateUser as updateUserAPI } from '@/services/userAdminService'

const users = ref([])
const hasToken = ref(false)
const showEditModal = ref(false)
const isSaving = ref(false)
const editForm = ref({
  id: null,
  email: '',
  pseudo: '',
  userRoleId: 1
})

const loadUsers = async () => {
  try {
    const response = await getUsers()
    users.value = response.data.data || []
    console.log('✅ Utilisateurs chargés:', users.value.length)
  } catch (err) {
    console.error('❌ Erreur chargement utilisateurs:', err)
    alert('Erreur lors du chargement des utilisateurs')
  }
}

const getRoleName = (roleId) => {
  const roles = {
    1: 'Visiteur',
    2: 'Manager',
    3: 'Admin'
  }
  return roles[roleId] || 'Inconnu'
}

const openEditModal = (user) => {
  editForm.value = {
    id: user.id,
    email: user.email,
    pseudo: user.pseudo || '',
    userRoleId: user.userRoleId
  }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editForm.value = {
    id: null,
    email: '',
    pseudo: '',
    userRoleId: 1
  }
}

const saveUser = async () => {
  if (!editForm.value.email) {
    alert('⚠️ L\'email est obligatoire')
    return
  }

  try {
    isSaving.value = true
    
    await updateUserAPI(editForm.value.id, {
      email: editForm.value.email,
      pseudo: editForm.value.pseudo,
      userRoleId: editForm.value.userRoleId
    })
    
    alert('✓ Utilisateur mis à jour avec succès')
    closeEditModal()
    await loadUsers()
    
  } catch (err) {
    console.error('❌ Erreur mise à jour:', err)
    alert('Erreur lors de la mise à jour: ' + (err.response?.data?.message || err.message))
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  hasToken.value = !!localStorage.getItem('token')
  if (hasToken.value) {
    loadUsers()
  }
})
</script>

<style scoped>
.users-container {
  padding: 30px;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
  background: #f8f9fa;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  background: white;
  padding: 20px 30px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.page-header h1 {
  margin: 0;
  font-size: 28px;
  color: #2c3e50;
  font-weight: 700;
}

.btn-refresh {
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-refresh:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.restriction-alert {
  background: linear-gradient(135deg, #fff3cd 0%, #ffe8a1 100%);
  border: 2px solid #ffc107;
  padding: 30px;
  border-radius: 12px;
  text-align: center;
}

.restriction-alert p {
  margin: 0 0 20px;
  color: #856404;
  font-size: 16px;
  font-weight: 600;
}

.btn-login {
  display: inline-block;
  padding: 12px 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-login:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.users-table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table thead {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.users-table th {
  padding: 16px 20px;
  text-align: left;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.users-table tbody tr {
  border-bottom: 1px solid #e0e0e0;
  transition: background 0.2s;
}

.users-table tbody tr:hover {
  background: #f8f9fa;
}

.users-table tbody tr:last-child {
  border-bottom: none;
}

.users-table td {
  padding: 16px 20px;
  font-size: 14px;
  color: #555;
}

.users-table td:first-child {
  font-weight: 600;
  color: #667eea;
}

.role-badge {
  display: inline-block;
  padding: 5px 14px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.role-badge.role-1 {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  color: #1565c0;
}

.role-badge.role-2 {
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  color: #e65100;
}

.role-badge.role-3 {
  background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
  color: #6a1b9a;
}

.tentatives-badge {
  display: inline-block;
  padding: 4px 12px;
  background: #e8f5e9;
  color: #2e7d32;
  border-radius: 12px;
  font-weight: 600;
  font-size: 13px;
}

.tentatives-badge.warning {
  background: #ffebee;
  color: #c62828;
}

.btn-edit {
  padding: 8px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-edit:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
}

.empty-state p {
  margin: 0;
  color: #999;
  font-size: 18px;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  border-bottom: 1px solid #e0e0e0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px 16px 0 0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
}

.modal-close {
  background: none;
  border: none;
  color: white;
  font-size: 32px;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
  opacity: 0.8;
}

.modal-close:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
}

.modal-body {
  padding: 28px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-input,
.form-select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 14px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #667eea;
}

.form-input:hover,
.form-select:hover {
  border-color: #c0c0c0;
}

.form-select {
  cursor: pointer;
  background: white;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 20px 28px 28px;
}

.btn-cancel,
.btn-save {
  flex: 1;
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-cancel {
  background: #ecf0f1;
  color: #555;
  border: 2px solid #bdc3c7;
}

.btn-cancel:hover {
  background: #bdc3c7;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-save {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
}

.btn-save:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

/* Responsive */
@media (max-width: 1024px) {
  .users-container {
    padding: 20px;
  }

  .users-table-container {
    overflow-x: auto;
  }

  .users-table {
    min-width: 800px;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .page-header h1 {
    font-size: 24px;
    text-align: center;
  }

  .btn-refresh {
    width: 100%;
  }

  .users-table th,
  .users-table td {
    padding: 12px 15px;
    font-size: 13px;
  }

  .modal-content {
    width: 95%;
    max-width: 400px;
  }

  .modal-header h3 {
    font-size: 1.1rem;
  }

  .modal-body {
    padding: 20px;
  }

  .modal-footer {
    padding: 15px 20px 20px;
  }

  .btn-cancel,
  .btn-save {
    padding: 10px 16px;
    font-size: 0.9rem;
  }
}
</style>