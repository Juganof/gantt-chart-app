<template>
  <div class="projects">
    <div class="projects-header">
      <div class="header-main">
        <h1>
          <span v-if="isLoading" class="loading-text">Loading projects...</span>
          <span v-else>Manage Projects</span>
        </h1>
        <p v-if="!isLoading">View, organize, and manage all your projects</p>
      </div>
      <div class="header-actions">
        <button @click="refreshProjectStats()" class="btn btn-outline" :disabled="isLoadingStats">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
          </svg>
          {{ isLoadingStats ? 'Loading...' : 'Refresh Stats' }}
        </button>
        <button @click="$emit('create-project')" class="btn btn-primary">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
          New Project
        </button>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="filters-section">
      <div class="search-box">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search projects..."
          class="search-input"
        />
      </div>

      <div class="filter-controls">
        <select v-model="priorityFilter" class="filter-select">
          <option value="">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select v-model="statusFilter" class="filter-select">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="on-hold">On Hold</option>
        </select>

        <select v-model="sortBy" class="filter-select">
          <option value="name">Sort by Name</option>
          <option value="dueDate">Sort by Due Date</option>
          <option value="created">Sort by Created</option>
          <option value="priority">Sort by Priority</option>
        </select>
      </div>
    </div>

    <!-- Projects Grid -->
    <div class="projects-grid" v-if="filteredProjects.length > 0">
      <div
        v-for="project in filteredProjects"
        :key="project.id"
        class="project-card"
        :class="{ current: project.id === currentProject?.id }"
      >
        <div class="project-header">
          <div class="project-info">
            <h3>{{ project.name }}</h3>
            <p v-if="project.description">{{ project.description }}</p>
          </div>
          <div class="project-color" :style="{ backgroundColor: project.color }"></div>
        </div>

        <div class="project-meta">
          <div class="meta-row">
            <span class="meta-label">Priority:</span>
            <span class="priority-badge" :class="`priority-${project.priority}`">
              {{ project.priority }}
            </span>
          </div>

          <div class="meta-row" v-if="project.startDate">
            <span class="meta-label">Started:</span>
            <span>{{ formatDate(project.startDate) }}</span>
          </div>

          <div class="meta-row" v-if="project.dueDate">
            <span class="meta-label">Due:</span>
            <span>{{ formatDate(project.dueDate) }}</span>
          </div>

          <div class="meta-row" v-if="project.subject">
            <span class="meta-label">Subject:</span>
            <span>{{ project.subject }}</span>
          </div>
        </div>

        <!-- Project Stats -->
        <div class="project-stats" v-if="projectStatsCache[project.id]">
          <div class="stat">
            <span class="stat-value">{{ projectStatsCache[project.id].totalTasks }}</span>
            <span class="stat-label">Tasks</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ projectStatsCache[project.id].completedTasks }}</span>
            <span class="stat-label">Completed</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ projectStatsCache[project.id].progress }}%</span>
            <span class="stat-label">Progress</span>
          </div>
        </div>

        <!-- Loading state for stats -->
        <div v-else-if="isLoadingStats" class="project-stats loading">
          <div class="stat">
            <span class="stat-value">...</span>
            <span class="stat-label">Loading</span>
          </div>
        </div>

        <!-- Project Actions -->
        <div class="project-actions">
          <button
            @click="switchToProject(project.id)"
            class="btn btn-primary btn-sm"
            :disabled="project.id === currentProject?.id || !isValidProject(project.id)"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
            {{ project.id === currentProject?.id ? 'Current' : 'Switch To' }}
          </button>

          <button
            @click="viewProjectChart(project.id)"
            class="btn btn-outline btn-sm"
            :disabled="!isValidProject(project.id)"
          >
            <svg
              width="14"
              height="14"
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
            View Chart
          </button>

          <div class="dropdown">
            <button
              @click="toggleDropdown(project.id)"
              class="btn btn-ghost btn-sm"
              :disabled="!isValidProject(project.id)"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="12" cy="12" r="1" />
                <circle cx="19" cy="12" r="1" />
                <circle cx="5" cy="12" r="1" />
              </svg>
            </button>

            <div v-if="activeDropdown === project.id" class="dropdown-menu">
              <button @click="editProject(project)" class="dropdown-item">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit Project
              </button>

              <button @click="duplicateProject(project)" class="dropdown-item">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Duplicate
              </button>

              <button @click="archiveProject(project)" class="dropdown-item">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polyline points="21,8 21,21 3,21 3,8" />
                  <rect x="1" y="3" width="22" height="5" />
                  <line x1="10" y1="12" x2="14" y2="12" />
                </svg>
                Archive
              </button>

              <hr class="dropdown-divider" />

              <button @click="deleteProject(project)" class="dropdown-item danger">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polyline points="3,6 5,6 21,6" />
                  <path
                    d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                  />
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-icon">
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1"
        >
          <folder />
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      </div>
      <h3>
        {{
          searchQuery || priorityFilter || statusFilter ? 'No projects found' : 'No projects yet'
        }}
      </h3>
      <p>
        {{
          searchQuery || priorityFilter || statusFilter
            ? 'Try adjusting your filters or search terms.'
            : 'Create your first project to get started with SchoolGantt.'
        }}
      </p>
      <button
        v-if="!searchQuery && !priorityFilter && !statusFilter"
        @click="$emit('create-project')"
        class="btn btn-primary"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
        Create Your First Project
      </button>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'

export default {
  name: 'Projects',
  emits: ['create-project'],
  data() {
    return {
      searchQuery: '',
      priorityFilter: '',
      statusFilter: '',
      sortBy: 'name',
      activeDropdown: null,
      projectStatsCache: {}, // Cache for project statistics
      isLoadingStats: false, // Loading state for stats
      isLoading: false // Added loading state for the component
    }
  },
  computed: {
    ...mapState(['projects', 'currentProject', 'isLoading']),

    filteredProjects() {
      let filtered = [...this.projects]

      // Apply search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(
          project =>
            project.name.toLowerCase().includes(query) ||
            (project.description && project.description.toLowerCase().includes(query)) ||
            (project.subject && project.subject.toLowerCase().includes(query))
        )
      }

      // Apply priority filter
      if (this.priorityFilter) {
        filtered = filtered.filter(project => project.priority === this.priorityFilter)
      }

      // Apply status filter (we'll implement this based on project completion)
      if (this.statusFilter) {
        filtered = filtered.filter(project => {
          const stats = this.projectStatsCache[project.id]
          if (this.statusFilter === 'completed') {
            return stats && stats.progress === 100
          } else if (this.statusFilter === 'active') {
            return stats && stats.progress > 0 && stats.progress < 100
          } else if (this.statusFilter === 'on-hold') {
            return !stats || stats.progress === 0
          }
          return true
        })
      }

      // Apply sorting
      return this.sortProjects(filtered)
    },

    // Helper to check if a project is valid and exists
    isValidProject() {
      return projectId => {
        return this.projects.some(p => p.id === projectId)
      }
    }
  },
  async mounted() {
    // Clear stats cache when component mounts
    this.projectStatsCache = {}
    // Load all project statistics
    await this.loadAllProjectStats()
  },
  watch: {
    // Watch for changes in projects list and refresh stats
    projects: {
      handler(newProjects, oldProjects) {
        // Clean up stats cache for deleted projects
        this.cleanupStatsCache(newProjects)

        // If the length changed, refresh stats
        if (!oldProjects || newProjects.length !== oldProjects.length) {
          this.refreshProjectStats()
        }
      },
      deep: true,
      immediate: false
    },

    // Watch for current project changes
    currentProject: {
      handler(newProject, oldProject) {
        if (newProject && oldProject && newProject.id !== oldProject.id) {
          // Current project changed, ensure we have stats for the new one
          this.refreshProjectStats(newProject.id)
        }
      }
    }
  },
  methods: {
    ...mapActions(['deleteProject']),

    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    },

    async getProjectStats(projectId) {
      // Check cache first
      if (this.projectStatsCache[projectId]) {
        return this.projectStatsCache[projectId]
      }

      try {
        // Load project data from localStorage
        const projectData = await this.$store.dispatch('loadProjectData', projectId)

        if (!projectData.project) {
          return {
            totalTasks: 0,
            completedTasks: 0,
            progress: 0
          }
        }

        // Calculate real statistics
        const { calculateProjectStats } = await import('@/models/index.js')
        const stats = calculateProjectStats(projectData.project, projectData.tasks || [])

        // Cache the results
        this.projectStatsCache[projectId] = {
          totalTasks: stats.totalTasks,
          completedTasks: stats.completedTasks,
          progress: stats.completionPercentage
        }

        return this.projectStatsCache[projectId]
      } catch (error) {
        console.error('Error loading project stats:', error)
        return {
          totalTasks: 0,
          completedTasks: 0,
          progress: 0
        }
      }
    },

    async loadAllProjectStats() {
      // Load stats for all projects to avoid repeated async calls
      this.isLoadingStats = true
      try {
        for (const project of this.projects) {
          await this.getProjectStats(project.id)
        }
      } catch (error) {
        console.error('Error loading project statistics:', error)
      } finally {
        this.isLoadingStats = false
      }
    },

    async refreshProjectStats(projectId = null) {
      // Refresh stats for a specific project or all projects
      if (projectId) {
        delete this.projectStatsCache[projectId]
        await this.getProjectStats(projectId)
      } else {
        this.projectStatsCache = {}
        await this.loadAllProjectStats()
      }
    },

    sortProjects(projects) {
      return [...projects].sort((a, b) => {
        switch (this.sortBy) {
          case 'name':
            return a.name.localeCompare(b.name)
          case 'created':
            return new Date(b.created) - new Date(a.created)
          case 'updated':
            return new Date(b.updated || b.created) - new Date(a.updated || a.created)
          case 'priority':
            const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
            return (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4)
          default:
            return 0
        }
      })
    },

    toggleDropdown(projectId) {
      this.activeDropdown = this.activeDropdown === projectId ? null : projectId
    },

    closeDropdowns() {
      this.activeDropdown = null
    },

    async switchToProject(projectId) {
      try {
        // Validate that the project still exists
        const project = this.projects.find(p => p.id === projectId)
        if (!project) {
          throw new Error('Project no longer exists. It may have been deleted.')
        }

        await this.$store.dispatch('switchToProject', projectId)
        // Refresh stats for the new current project
        await this.refreshProjectStats(projectId)
      } catch (error) {
        console.error('Failed to switch project:', error)
        alert(`Failed to switch project: ${error.message}`)

        // If the project doesn't exist, refresh the stats cache
        if (error.message.includes('no longer exists')) {
          await this.refreshProjectStats()
        }
      }
    },

    editProject(project) {
      this.closeDropdowns()
      this.$emit('edit-project', project)
    },

    duplicateProject(project) {
      this.closeDropdowns()
      // Implement project duplication
      console.log('Duplicate project:', project)
    },

    archiveProject(project) {
      this.closeDropdowns()
      // Implement project archiving
      console.log('Archive project:', project)
    },

    async deleteProject(project) {
      this.closeDropdowns()

      if (
        !confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)
      ) {
        return
      }

      try {
        const result = await this.$store.dispatch('deleteProject', project.id)

        // Clear from stats cache
        delete this.projectStatsCache[project.id]

        // Show success message
        console.log(`Project "${project.name}" deleted successfully`)

        // Handle different scenarios based on remaining projects
        if (result.wasLastProject) {
          // All projects deleted - show success message and redirect or show empty state
          alert(
            `Project "${project.name}" deleted successfully!\n\nNo projects remaining. You can create a new project to get started.`
          )

          // Emit event to show create project flow or redirect to home
          this.$emit('create-project')
        } else {
          // Other projects remain - show simple success message
          alert(`Project "${project.name}" deleted successfully!`)

          // Refresh project stats for remaining projects
          await this.refreshProjectStats()
        }
      } catch (error) {
        console.error('Failed to delete project:', error)
        alert(`Failed to delete project: ${error.message}`)
      }
    },

    async viewProjectChart(projectId) {
      try {
        // First, validate that the project still exists
        const project = this.projects.find(p => p.id === projectId)
        if (!project) {
          throw new Error('Project no longer exists. It may have been deleted.')
        }

        // If this is not the current project, switch to it first
        if (projectId !== this.currentProject?.id) {
          await this.$store.dispatch('switchToProject', projectId)
          // Refresh stats for the switched project
          await this.refreshProjectStats(projectId)
        }

        // Navigate to the Gantt chart view
        this.$router.push({ name: 'Gantt' })
      } catch (error) {
        console.error('Failed to view project chart:', error)
        alert(`Failed to open project chart: ${error.message}`)

        // If the project doesn't exist, refresh the stats cache to ensure consistency
        if (error.message.includes('no longer exists')) {
          await this.refreshProjectStats()
        }
      }
    },

    cleanupStatsCache(projects) {
      // Remove stats cache entries for projects that no longer exist
      const projectIds = new Set(projects.map(p => p.id))
      const cacheKeys = Object.keys(this.projectStatsCache)

      for (const cacheKey of cacheKeys) {
        if (!projectIds.has(cacheKey)) {
          delete this.projectStatsCache[cacheKey]
          console.log(`Cleaned up stats cache for deleted project: ${cacheKey}`)
        }
      }

      // Close dropdown if it's open for a deleted project
      if (this.activeDropdown && !projectIds.has(this.activeDropdown)) {
        this.activeDropdown = null
      }
    }
  }
}
</script>

<style scoped>
.projects {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.projects-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.header-main h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
}

.header-main p {
  color: #6c757d;
  margin: 0;
  font-size: 1rem;
}

.filters-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 250px;
}

.search-box svg {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
}

.search-input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 0.875rem;
}

.search-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.filter-controls {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.filter-select {
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
  min-width: 140px;
}

.filter-select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.project-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
  transition: all 0.2s;
}

.project-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.project-card.current {
  border-color: #007bff;
  box-shadow: 0 4px 20px rgba(0, 123, 255, 0.15);
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.project-info h3 {
  margin: 0 0 0.25rem 0;
  color: #495057;
  font-size: 1.25rem;
}

.project-info p {
  margin: 0;
  color: #6c757d;
  font-size: 0.875rem;
  line-height: 1.4;
}

.project-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.project-meta {
  margin-bottom: 1rem;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.meta-row:last-child {
  margin-bottom: 0;
}

.meta-label {
  color: #6c757d;
  font-weight: 500;
}

.priority-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.priority-critical {
  background: #f8d7da;
  color: #721c24;
}

.priority-high {
  background: #f8d7da;
  color: #721c24;
}

.priority-medium {
  background: #fff3cd;
  color: #856404;
}

.priority-low {
  background: #d4edda;
  color: #155724;
}

.project-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.project-stats.loading {
  opacity: 0.6;
}

.stat {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.125rem;
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  color: #6c757d;
}

.project-actions {
  display: flex;
  gap: 0.5rem;
  position: relative;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-sm {
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-primary:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.btn-outline {
  background: transparent;
  color: #007bff;
  border: 1px solid #007bff;
}

.btn-outline:hover:not(:disabled) {
  background: #007bff;
  color: white;
  text-decoration: none;
}

.btn-outline:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-ghost {
  background: transparent;
  color: #6c757d;
  border: 1px solid transparent;
}

.btn-ghost:hover {
  background: #f8f9fa;
  color: #495057;
}

.dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  min-width: 150px;
  padding: 0.5rem 0;
}

.dropdown-item {
  width: 100%;
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  font-size: 0.875rem;
  color: #495057;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dropdown-item:hover {
  background: #f8f9fa;
}

.dropdown-item.danger {
  color: #dc3545;
}

.dropdown-item.danger:hover {
  background: #f8d7da;
  color: #721c24;
}

.dropdown-item:disabled {
  color: #6c757d;
  cursor: not-allowed;
}

.dropdown-divider {
  margin: 0.5rem 0;
  border: none;
  border-top: 1px solid #e9ecef;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #6c757d;
}

.empty-icon {
  margin-bottom: 1.5rem;
  opacity: 0.5;
}

.empty-state h3 {
  margin: 0 0 1rem 0;
  color: #495057;
  font-size: 1.5rem;
}

.empty-state p {
  margin: 0 0 2rem 0;
  font-size: 1rem;
  line-height: 1.5;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.loading-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #6c757d;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e9ecef;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem auto;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .projects-header {
    flex-direction: column;
    gap: 1rem;
  }

  .filters-section {
    flex-direction: column;
  }

  .filter-controls {
    justify-content: stretch;
  }

  .filter-select {
    flex: 1;
  }

  .projects-grid {
    grid-template-columns: 1fr;
  }

  .project-actions {
    flex-wrap: wrap;
  }
}

.loading-text {
  color: #6c757d;
  font-style: italic;
  opacity: 0.8;
}
</style>
