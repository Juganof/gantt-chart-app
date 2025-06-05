import GanttView from '@/views/GanttView.vue'
import Home from '@/views/Home.vue'
import Projects from '@/views/Projects.vue'
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: 'SchoolGantt - Personal Project Timeline Manager'
    }
  },
  {
    path: '/gantt',
    name: 'Gantt',
    component: GanttView,
    meta: {
      title: 'Gantt Chart - SchoolGantt',
      requiresProject: true
    }
  },
  {
    path: '/projects',
    name: 'Projects',
    component: Projects,
    meta: {
      title: 'Manage Projects - SchoolGantt'
    }
  },
  {
    path: '/project/:id',
    name: 'ProjectDetail',
    component: GanttView,
    meta: {
      title: 'Project Details - SchoolGantt',
      requiresProject: true
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard for routes that require a project
router.beforeEach(async (to, from, next) => {
  // Set page title
  document.title = to.meta.title || 'SchoolGantt'

  // Check if route requires a project
  if (to.meta.requiresProject) {
    // Get the store from the global app instance
    const store = router.app?.config?.globalProperties?.$store

    if (!store) {
      // Store not available yet, allow navigation and let the component handle loading
      next()
      return
    }

    // If store is still loading, wait for it to complete
    if (store.state.isLoading) {
      // Allow navigation - the components will handle the loading state
      next()
      return
    }

    // If multi-project mode is not initialized yet, initialize it
    if (!store.state.multiProjectSettings.isMultiProjectMode) {
      try {
        await store.dispatch('initializeMultiProject')
      } catch (error) {
        console.error('Failed to initialize multi-project mode:', error)
        // Still allow navigation - let the app handle the error
        next()
        return
      }
    }

    // Check if there are any projects available
    if (!store.state.projects || store.state.projects.length === 0) {
      // No projects available, redirect to home
      next({ name: 'Home', query: { redirect: to.fullPath } })
      return
    }

    // If no current project but projects exist, try to load the first/default project
    if (!store.state.currentProject) {
      try {
        // Try to load the most recent project or first project
        const projects = store.state.projects
        if (projects.length > 0) {
          // Check for saved current project ID
          const { getCurrentProjectKey } = await import('@/models/index.js')
          const currentProjectId = localStorage.getItem(getCurrentProjectKey()) || projects[0].id

          if (currentProjectId && projects.find(p => p.id === currentProjectId)) {
            await store.dispatch('switchToProject', currentProjectId)
          } else {
            // Fallback to first project
            await store.dispatch('switchToProject', projects[0].id)
          }
        }
      } catch (error) {
        console.error('Failed to load project:', error)
        // If we can't load a project, redirect to home
        next({ name: 'Home', query: { redirect: to.fullPath } })
        return
      }
    }
  }

  next()
})

export default router
