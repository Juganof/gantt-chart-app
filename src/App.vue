<template>
  <div id="app">
    <header class="app-header">
      <div class="header-content">
        <div class="app-branding">
          <router-link to="/" class="brand-link">
            <h1>SchoolGantt</h1>
            <p>Personal Project Timeline Manager</p>
          </router-link>
        </div>

        <!-- Navigation -->
        <MainNavigation />

        <!-- Project Selector -->
        <div class="header-controls">
          <ProjectSelector
            :isLoading="isLoading"
            @switch-project="handleSwitchProject"
            @create-project="handleCreateProject"
            @manage-projects="handleManageProjects"
            @project-settings="handleProjectSettings"
          />
        </div>
      </div>
    </header>

    <main class="app-main">
      <router-view @create-project="handleCreateProject" @edit-project="handleEditProject" />
    </main>

    <!-- Modals -->
    <ProjectCreateModal
      ref="projectCreateModal"
      :isVisible="showProjectCreate"
      @create="handleCreateProjectSubmit"
      @cancel="showProjectCreate = false"
    />

    <ProjectSettingsModal
      :isVisible="showProjectSettings"
      :project="currentProject"
      @save="handleSaveProjectSettings"
      @cancel="showProjectSettings = false"
    />

    <!-- Success/Error Toast -->
    <div v-if="toast.show" class="toast" :class="toast.type">
      {{ toast.message }}
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import ProjectCreateModal from './components/modals/ProjectCreateModal.vue'
import ProjectSettingsModal from './components/modals/ProjectSettingsModal.vue'
import MainNavigation from './components/navigation/MainNavigation.vue'
import ProjectSelector from './components/navigation/ProjectSelector.vue'

export default {
  name: 'App',
  components: {
    ProjectSelector,
    ProjectSettingsModal,
    ProjectCreateModal,
    MainNavigation
  },
  data() {
    return {
      showProjectSettings: false,
      showProjectCreate: false,
      toast: {
        show: false,
        message: '',
        type: 'success' // 'success' or 'error'
      }
    }
  },
  computed: {
    ...mapState(['currentProject', 'projects', 'multiProjectSettings', 'isLoading'])
  },
  async mounted() {
    // Initialize multi-project mode if not already enabled
    if (!this.multiProjectSettings.isMultiProjectMode) {
      try {
        await this.initializeMultiProject()
      } catch (error) {
        console.error('Failed to initialize multi-project mode:', error)
        this.showToast('Failed to initialize project system', 'error')
      }
    }
  },
  methods: {
    ...mapActions([
      'switchToProject',
      'initializeMultiProject',
      'updateProjectSafe',
      'createProject'
    ]),

    async handleSwitchProject(projectId) {
      try {
        await this.switchToProject(projectId)
        const project = this.projects.find(p => p.id === projectId)
        this.showToast(`Switched to "${project?.name || 'Unknown Project'}"`)
      } catch (error) {
        console.error('Failed to switch project:', error)
        this.showToast('Failed to switch project', 'error')
      }
    },

    handleCreateProject() {
      this.showProjectCreate = true
    },

    handleManageProjects() {
      this.$router.push({ name: 'Projects' })
    },

    handleProjectSettings() {
      if (this.currentProject) {
        this.showProjectSettings = true
      } else {
        this.showToast('No project selected', 'error')
      }
    },

    async handleSaveProjectSettings(updatedProject) {
      try {
        await this.updateProjectSafe(updatedProject)
        this.showProjectSettings = false
        this.showToast('Project settings saved successfully')
      } catch (error) {
        console.error('Failed to save project settings:', error)
        this.showToast('Failed to save project settings', 'error')
      }
    },

    async handleCreateProjectSubmit(projectData) {
      try {
        // Extract options from project data
        const { switchToProject, createDefaultTasks, template, ...cleanProjectData } = projectData

        // Create the project
        const newProject = await this.createProject({
          projectData: cleanProjectData,
          template: template || 'blank',
          switchToProject: switchToProject !== false
        })

        this.showProjectCreate = false
        this.showToast(`Project "${newProject.name}" created successfully!`)

        console.log('Created new project:', newProject)
      } catch (error) {
        console.error('Failed to create project:', error)
        this.showToast('Failed to create project: ' + error.message, 'error')

        // Reset the modal's creating state
        if (this.$refs.projectCreateModal) {
          this.$refs.projectCreateModal.resetCreatingState()
        }
      }
    },

    handleEditProject(project) {
      // Set the project to edit and show the settings modal
      this.showProjectSettings = true
    },

    showToast(message, type = 'success') {
      this.toast = {
        show: true,
        message,
        type
      }

      // Auto-hide after 3 seconds
      setTimeout(() => {
        this.toast.show = false
      }, 3000)
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background-color: #f8f9fa;
  color: #333;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: white;
  padding: 1rem 2rem;
  border-bottom: 1px solid #e9ecef;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  gap: 2rem;
}

.app-branding {
  flex: 1;
  min-width: 0;
}

.brand-link {
  text-decoration: none;
  color: inherit;
}

.brand-link:hover {
  text-decoration: none;
  color: inherit;
}

.app-header h1 {
  color: #495057;
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
}

.app-header p {
  color: #6c757d;
  font-size: 0.875rem;
  margin: 0;
}

.header-controls {
  flex-shrink: 0;
}

.app-main {
  flex: 1;
  padding: 2rem;
}

/* Toast Notifications */
.toast {
  position: fixed;
  top: 2rem;
  right: 2rem;
  padding: 1rem 1.5rem;
  border-radius: 6px;
  color: white;
  font-weight: 500;
  font-size: 0.875rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 2000;
  animation: slideInRight 0.3s ease-out;
  max-width: 400px;
  word-wrap: break-word;
}

.toast.success {
  background: #28a745;
}

.toast.error {
  background: #dc3545;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .app-header {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .app-branding {
    text-align: center;
    order: 1;
  }

  .main-navigation {
    order: 2;
  }

  .header-controls {
    order: 3;
    align-self: center;
  }

  .app-main {
    padding: 1rem;
  }

  .toast {
    top: 1rem;
    right: 1rem;
    left: 1rem;
    max-width: none;
  }
}
</style>
