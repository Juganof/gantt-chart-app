<template>
  <nav class="main-navigation">
    <router-link to="/" class="nav-link" exact-active-class="active">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9,22 9,12 15,12 15,22" />
      </svg>
      Home
    </router-link>

    <router-link to="/gantt" class="nav-link" v-if="currentProject">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="9" y1="9" x2="15" y2="9" />
        <line x1="9" y1="15" x2="15" y2="15" />
        <line x1="9" y1="12" x2="12" y2="12" />
      </svg>
      Gantt Chart
    </router-link>

    <router-link to="/projects" class="nav-link">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <folder />
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
      Projects
    </router-link>
  </nav>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'MainNavigation',
  computed: {
    ...mapState(['currentProject'])
  }
}
</script>

<style scoped>
.main-navigation {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  text-decoration: none;
  color: #6c757d;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
}

.nav-link:hover {
  background: #f8f9fa;
  color: #495057;
  text-decoration: none;
}

.nav-link.active {
  background: #007bff;
  color: white;
}

.nav-link.active:hover {
  background: #0056b3;
  color: white;
}

@media (max-width: 768px) {
  .main-navigation {
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
}
</style>
