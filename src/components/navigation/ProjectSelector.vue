<template>
  <div class="project-selector" ref="projectSelector">
    <!-- Current Project Display -->
    <button @click="toggleDropdown" class="current-project-btn" :class="{ active: isDropdownOpen }">
      <div class="project-preview">
        <div
          class="project-color-indicator"
          :style="{ backgroundColor: currentProject?.color || '#007bff' }"
        ></div>
        <div class="project-details">
          <span class="project-name">
            <span v-if="isLoading" class="loading-text">Loading...</span>
            <span v-else>{{ currentProject?.name || 'Select Project' }}</span>
          </span>
          <span v-if="!isLoading && taskCount > 0" class="task-count">{{ taskCount }} tasks</span>
        </div>
      </div>

      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        class="dropdown-arrow"
        :class="{ rotated: isDropdownOpen }"
      >
        <polyline points="6,9 12,15 18,9"></polyline>
      </svg>
    </button>

    <!-- Dropdown Menu -->
    <div v-if="isDropdownOpen" class="dropdown-menu">
      <!-- Search Box (if many projects) -->
      <div v-if="projects.length > 5" class="search-section">
        <div class="search-input-wrapper">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="M21 21l-4.35-4.35"></path>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search projects..."
            class="search-input"
            @keydown.stop
          />
        </div>
      </div>

      <!-- Recent Projects Section -->
      <div v-if="recentProjects.length > 0" class="dropdown-section">
        <div class="section-header">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12,6 12,12 16,14"></polyline>
          </svg>
          Recent Projects
        </div>
        <div class="project-list">
          <button
            v-for="project in filteredRecentProjects"
            :key="project.id"
            @click="switchToProject(project.id)"
            class="project-item"
            :class="{ current: project.id === currentProjectId }"
          >
            <div class="project-item-content">
              <div
                class="project-color-dot"
                :style="{ backgroundColor: project.color || '#007bff' }"
              ></div>
              <div class="project-info">
                <span class="project-title">{{ project.name }}</span>
                <span class="project-meta">
                  {{ formatProjectMeta(project) }}
                </span>
              </div>
            </div>
            <div v-if="project.id === currentProjectId" class="current-indicator">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          </button>
        </div>
      </div>

      <!-- All Projects Section -->
      <div v-if="otherProjects.length > 0" class="dropdown-section">
        <div class="section-header">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
          All Projects
        </div>
        <div class="project-list">
          <button
            v-for="project in filteredOtherProjects"
            :key="project.id"
            @click="switchToProject(project.id)"
            class="project-item"
            :class="{ current: project.id === currentProjectId }"
          >
            <div class="project-item-content">
              <div
                class="project-color-dot"
                :style="{ backgroundColor: project.color || '#007bff' }"
              ></div>
              <div class="project-info">
                <span class="project-title">{{ project.name }}</span>
                <span class="project-meta">
                  {{ formatProjectMeta(project) }}
                </span>
              </div>
            </div>
            <div v-if="project.id === currentProjectId" class="current-indicator">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          </button>
        </div>
      </div>

      <!-- Actions Section -->
      <div class="dropdown-section actions-section">
        <div class="section-header">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
          </svg>
          Project Actions
        </div>
        <div class="action-list">
          <button @click="createNewProject" class="action-item">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="16"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
            Create New Project
          </button>

          <button @click="openProjectManager" class="action-item">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M3 9h18l-2 9H5L3 9Z"></path>
              <path d="M3 9V7a2 2 0 0 1 2-2h4l2 2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Manage Projects
          </button>

          <button v-if="currentProject" @click="openProjectSettings" class="action-item">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="3"></circle>
              <path
                d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
              ></path>
            </svg>
            Project Settings
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="projects.length === 0" class="empty-state">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        <p>No projects found</p>
        <button @click="createNewProject" class="btn-primary">Create Your First Project</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'ProjectSelector',
  props: {
    isLoading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['switch-project', 'create-project', 'manage-projects', 'project-settings'],
  data() {
    return {
      isDropdownOpen: false,
      searchQuery: ''
    }
  },
  computed: {
    ...mapState(['projects', 'currentProject', 'currentProjectId', 'tasks']),
    ...mapGetters(['recentProjects', 'isMultiProjectMode']),

    taskCount() {
      return this.tasks?.length || 0
    },

    filteredRecentProjects() {
      if (!this.searchQuery) return this.recentProjects

      const query = this.searchQuery.toLowerCase()
      return this.recentProjects.filter(
        project =>
          project.name.toLowerCase().includes(query) ||
          (project.description && project.description.toLowerCase().includes(query)) ||
          (project.tags && project.tags.some(tag => tag.toLowerCase().includes(query)))
      )
    },

    otherProjects() {
      const recentIds = new Set(this.recentProjects.map(p => p.id))
      return this.projects.filter(project => !recentIds.has(project.id))
    },

    filteredOtherProjects() {
      if (!this.searchQuery) return this.otherProjects

      const query = this.searchQuery.toLowerCase()
      return this.otherProjects.filter(
        project =>
          project.name.toLowerCase().includes(query) ||
          (project.description && project.description.toLowerCase().includes(query)) ||
          (project.tags && project.tags.some(tag => tag.toLowerCase().includes(query)))
      )
    }
  },
  mounted() {
    // Close dropdown when clicking outside
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
  },
  methods: {
    toggleDropdown() {
      this.isDropdownOpen = !this.isDropdownOpen
      if (this.isDropdownOpen) {
        this.searchQuery = ''
      }
    },

    closeDropdown() {
      this.isDropdownOpen = false
      this.searchQuery = ''
    },

    handleClickOutside(event) {
      if (!this.$refs.projectSelector?.contains(event.target)) {
        this.closeDropdown()
      }
    },

    switchToProject(projectId) {
      if (projectId !== this.currentProjectId) {
        this.$emit('switch-project', projectId)
      }
      this.closeDropdown()
    },

    createNewProject() {
      this.$emit('create-project')
      this.closeDropdown()
    },

    openProjectManager() {
      this.$emit('manage-projects')
      this.closeDropdown()
    },

    openProjectSettings() {
      this.$emit('project-settings')
      this.closeDropdown()
    },

    formatProjectMeta(project) {
      const parts = []

      if (project.status) {
        parts.push(this.formatStatus(project.status))
      }

      if (project.stats?.totalTasks > 0) {
        parts.push(`${project.stats.totalTasks} tasks`)
      }

      if (project.dueDate) {
        const dueDate = new Date(project.dueDate)
        const now = new Date()
        const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24))

        if (diffDays < 0) {
          parts.push('Overdue')
        } else if (diffDays === 0) {
          parts.push('Due today')
        } else if (diffDays <= 7) {
          parts.push(`Due in ${diffDays}d`)
        }
      }

      return parts.join(' • ') || 'No details'
    },

    formatStatus(status) {
      const statusMap = {
        active: 'Active',
        completed: 'Completed',
        'on-hold': 'On Hold',
        cancelled: 'Cancelled'
      }
      return statusMap[status] || status
    }
  }
}
</script>

<style scoped>
.project-selector {
  position: relative;
  display: inline-block;
}

.current-project-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #ced4da;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 200px;
  text-align: left;
}

.current-project-btn:hover {
  border-color: #007bff;
  background: #f8f9ff;
}

.current-project-btn.active {
  border-color: #007bff;
  background: #f8f9ff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.project-preview {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
}

.project-color-indicator {
  width: 4px;
  height: 32px;
  border-radius: 2px;
  flex-shrink: 0;
}

.project-details {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
  flex: 1;
}

.project-name {
  font-weight: 500;
  color: #495057;
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
}

.loading-text {
  color: #6c757d;
  font-style: italic;
  opacity: 0.8;
}

.task-count {
  font-size: 0.75rem;
  color: #6c757d;
}

.dropdown-arrow {
  color: #6c757d;
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.dropdown-arrow.rotated {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ced4da;
  border-radius: 8px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-height: 400px;
  overflow-y: auto;
  margin-top: 0.25rem;
  min-width: 320px;
}

.search-section {
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input-wrapper svg {
  position: absolute;
  left: 0.75rem;
  color: #6c757d;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.5rem 0.75rem 0.5rem 2.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.875rem;
  outline: none;
}

.search-input:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.dropdown-section {
  padding: 0.75rem 0;
}

.dropdown-section:not(:last-child) {
  border-bottom: 1px solid #e9ecef;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.project-list,
.action-list {
  display: flex;
  flex-direction: column;
}

.project-item,
.action-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background-color 0.2s ease;
  width: 100%;
}

.project-item:hover,
.action-item:hover {
  background: #f8f9fa;
}

.project-item.current {
  background: #e7f1ff;
  color: #0056b3;
}

.project-item-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
}

.project-color-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.project-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
  flex: 1;
}

.project-title {
  font-weight: 500;
  color: #495057;
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.project-meta {
  font-size: 0.75rem;
  color: #6c757d;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.current-indicator {
  color: #28a745;
  flex-shrink: 0;
}

.action-item {
  gap: 0.75rem;
  color: #495057;
  font-size: 0.875rem;
  font-weight: 500;
}

.action-item svg {
  flex-shrink: 0;
  color: #6c757d;
}

.actions-section {
  background: #f8f9fa;
}

.empty-state {
  padding: 2rem;
  text-align: center;
}

.empty-state svg {
  color: #6c757d;
  margin-bottom: 1rem;
}

.empty-state p {
  margin: 0 0 1rem 0;
  color: #6c757d;
  font-size: 0.875rem;
}

.btn-primary {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background: #0056b3;
}

@media (max-width: 768px) {
  .current-project-btn {
    min-width: 160px;
    padding: 0.375rem 0.75rem;
  }

  .dropdown-menu {
    min-width: 280px;
    max-height: 300px;
  }

  .project-name {
    font-size: 0.8rem;
  }

  .task-count {
    font-size: 0.7rem;
  }
}
</style>
