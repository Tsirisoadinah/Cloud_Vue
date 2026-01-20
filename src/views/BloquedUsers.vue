<template>
  <div class="blocked-users">
    <h2>Utilisateurs bloqués</h2>

    <table v-if="users.length">
      <thead>
        <tr>
          <th>ID</th>
          <th>Email</th>
          <th>Tentatives</th>
          <th>Bloqué le</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.id }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.nbrTentative }}</td>
          <td>{{ formatDate(user.blockedAt) }}</td>
          <td>
            <button @click="unblock(user.id)">
              Débloquer
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-else>Aucun utilisateur bloqué</p>
  </div>
</template>

<script>
import { getBlockedUsers, unblockUser } from "@/services/userAdminService";

export default {
  name: "BlockedUsers",

  data() {
    return {
      users: []
    };
  },

  methods: {
    async loadUsers() {
      const res = await getBlockedUsers();
      this.users = res.data.data;
    },

    async unblock(id) {
      if (!confirm("Débloquer cet utilisateur ?")) return;

      await unblockUser(id);
      this.loadUsers(); // refresh
    },

    formatDate(date) {
      if (!date) return "-";
      return new Date(date).toLocaleString();
    }
  },

  mounted() {
    this.loadUsers();
  }
};
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 8px;
  border: 1px solid #ccc;
}

button {
  background: #28a745;
  color: white;
  border: none;
  padding: 6px 10px;
  cursor: pointer;
}
</style>
