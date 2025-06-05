<template>
  <button class="theme-toggle" @click="toggleTheme" :title="title">
    <svg v-if="isDark" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
    <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  </button>
</template>

<script>
export default {
  name: 'ThemeToggle',
  data() {
    return {
      isDark: false
    }
  },
  computed: {
    title() {
      return this.isDark ? 'Switch to light mode' : 'Switch to dark mode'
    }
  },
  mounted() {
    const saved = localStorage.getItem('theme')
    if (saved) {
      this.applyTheme(saved)
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.applyTheme('dark')
    }
  },
  methods: {
    toggleTheme() {
      this.applyTheme(this.isDark ? 'light' : 'dark')
    },
    applyTheme(theme) {
      this.isDark = theme === 'dark'
      document.documentElement.setAttribute('data-theme', theme)
      localStorage.setItem('theme', theme)
    }
  }
}
</script>

<style scoped>
.theme-toggle {
  background: none;
  border: none;
  color: var(--gray-700);
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}
.theme-toggle:hover {
  background: var(--gray-100);
}
[data-theme='dark'] .theme-toggle:hover {
  background: var(--gray-300);
}
</style>
