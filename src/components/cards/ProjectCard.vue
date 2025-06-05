<template>
  <div class="project-card" :class="{ 'current-project': isCurrentProject }">
    <!-- Project Header -->
    <div class="project-header">
      <div class="project-title-section">
        <div class="project-color" :style="{ backgroundColor: project.color || '#007bff' }"></div>
        <div class="project-info">
          <h3 class="project-name">{{ project.name }}</h3>
          <p v-if="project.description" class="project-description">{{ project.description }}</p>
        </div>
      </div>

      <div class="project-actions">
        <button
          v-if="!isCurrentProject"
          @click="$emit('switch-to', project.id)"
          class="action-btn switch-btn"
          title="Switch to this project"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M9 11H1l3-3m0 6l-3-3"></path>
            <path d="M22 12h-8"></path>
            <path d="M16 16l3-3"></path>
            <path d="M19 9l3 3"></path>
          </svg>
        </button>

        <button @click="$emit('edit', project)" class="action-btn edit-btn" title="Edit project">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
          </svg>
        </button>

        <div class="dropdown">
          <button
            @click="showDropdown = !showDropdown"
            class="action-btn dropdown-btn"
            title="More actions"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="12" cy="5" r="1"></circle>
              <circle cx="12" cy="19" r="1"></circle>
            </svg>
          </button>

          <div v-if="showDropdown" class="dropdown-menu" @click="showDropdown = false">
            <button @click="$emit('duplicate', project)" class="dropdown-item">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              Duplicate
            </button>

            <button @click="$emit('export', project)" class="dropdown-item">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Export
            </button>

            <hr class="dropdown-divider" />

            <button
              @click="$emit('delete', project)"
              class="dropdown-item delete-item"
              :disabled="isCurrentProject && isOnlyProject"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="3 6 5 6 21 6"></polyline>
                <path
                  d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                ></path>
              </svg>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Status and Priority Badges -->
    <div class="project-meta">
      <span class="status-badge" :class="`status-${project.status}`">
        {{ formatStatus(project.status) }}
      </span>

      <span class="priority-badge" :class="`priority-${project.priority}`">
        {{ formatPriority(project.priority) }}
      </span>

      <span v-if="isOverdue" class="overdue-badge"> Overdue </span>
    </div>

    <!-- Project Statistics -->
    <div class="project-stats">
      <div class="stat-item">
        <span class="stat-label">Tasks</span>
        <span class="stat-value">{{ stats.totalTasks }}</span>
      </div>

      <div class="stat-item">
        <span class="stat-label">Completed</span>
        <span class="stat-value">{{ stats.completedTasks }}</span>
      </div>

      <div class="stat-item">
        <span class="stat-label">Progress</span>
        <span class="stat-value">{{ stats.completionPercentage }}%</span>
      </div>

      <div v-if="stats.overdueTasks > 0" class="stat-item overdue">
        <span class="stat-label">Overdue</span>
        <span class="stat-value">{{ stats.overdueTasks }}</span>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="progress-container">
      <div class="progress-bar">
        <div
          class="progress-fill"
          :style="{
            width: `${stats.completionPercentage}%`,
            backgroundColor: project.color || '#007bff'
          }"
        ></div>
      </div>
      <span class="progress-text">{{ stats.completionPercentage }}% Complete</span>
    </div>

    <!-- Academic Information (if available) -->
    <div v-if="hasAcademicInfo" class="academic-info">
      <div v-if="project.subject" class="academic-item">
        <span class="academic-label">Subject:</span>
        <span class="academic-value">{{ project.subject }}</span>
      </div>

      <div v-if="project.semester" class="academic-item">
        <span class="academic-label">Semester:</span>
        <span class="academic-value">{{ project.semester }}</span>
      </div>

      <div v-if="project.instructor" class="academic-item">
        <span class="academic-label">Instructor:</span>
        <span class="academic-value">{{ project.instructor }}</span>
      </div>

      <div v-if="project.gradeWeight" class="academic-item">
        <span class="academic-label">Grade Weight:</span>
        <span class="academic-value">{{ project.gradeWeight }}%</span>
      </div>
    </div>

    <!-- Tags -->
    <div v-if="project.tags && project.tags.length > 0" class="project-tags">
      <span v-for="tag in project.tags.slice(0, 3)" :key="tag" class="tag">
        {{ tag }}
      </span>
      <span v-if="project.tags.length > 3" class="tag more-tags">
        +{{ project.tags.length - 3 }} more
      </span>
    </div>

    <!-- Footer with dates -->
    <div class="project-footer">
      <div class="date-info">
        <span v-if="project.dueDate" class="due-date" :class="{ overdue: isOverdue }">
          Due: {{ formatDate(project.dueDate) }}
        </span>

        <span v-if="project.lastAccessed" class="last-accessed">
          Last accessed: {{ formatRelativeDate(project.lastAccessed) }}
        </span>
      </div>

      <div v-if="isCurrentProject" class="current-indicator">
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
        Current
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProjectCard',
  props: {
    project: {
      type: Object,
      required: true
    },
    stats: {
      type: Object,
      default: () => ({
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        todoTasks: 0,
        overdueTasks: 0,
        completionPercentage: 0
      })
    },
    isCurrentProject: {
      type: Boolean,
      default: false
    },
    isOnlyProject: {
      type: Boolean,
      default: false
    }
  },
  emits: ['switch-to', 'edit', 'delete', 'duplicate', 'export'],
  data() {
    return {
      showDropdown: false
    }
  },
  computed: {
    isOverdue() {
      if (!this.project.dueDate || this.project.status === 'completed') {
        return false
      }
      return new Date(this.project.dueDate) < new Date()
    },
    hasAcademicInfo() {
      return (
        this.project.subject ||
        this.project.semester ||
        this.project.instructor ||
        this.project.gradeWeight
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
    handleClickOutside(event) {
      if (!this.$el.contains(event.target)) {
        this.showDropdown = false
      }
    },
    formatStatus(status) {
      const statusMap = {
        active: 'Active',
        completed: 'Completed',
        'on-hold': 'On Hold',
        cancelled: 'Cancelled'
      }
      return statusMap[status] || status
    },
    formatPriority(priority) {
      const priorityMap = {
        low: 'Low',
        medium: 'Medium',
        high: 'High',
        critical: 'Critical'
      }
      return priorityMap[priority] || priority
    },
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    },
    formatRelativeDate(dateString) {
      const date = new Date(dateString)
      const now = new Date()
      const diffInMs = now - date
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

      if (diffInDays === 0) {
        return 'Today'
      } else if (diffInDays === 1) {
        return 'Yesterday'
      } else if (diffInDays < 7) {
        return `${diffInDays} days ago`
      } else if (diffInDays < 30) {
        const weeks = Math.floor(diffInDays / 7)
        return `${weeks} week${weeks > 1 ? 's' : ''} ago`
      } else {
        return this.formatDate(dateString)
      }
    }
  }
}
</script>

<style scoped>
.project-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.project-card:hover {
  border-color: #007bff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.project-card.current-project {
  border-color: #28a745;
  background: linear-gradient(135deg, #f8fff9 0%, #ffffff 100%);
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.project-title-section {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
}

.project-color {
  width: 4px;
  height: 60px;
  border-radius: 2px;
  flex-shrink: 0;
}

.project-info {
  flex: 1;
  min-width: 0;
}

.project-name {
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #495057;
  word-wrap: break-word;
}

.project-description {
  margin: 0;
  color: #6c757d;
  font-size: 0.875rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-actions {
  display: flex;
  gap: 0.5rem;
  position: relative;
}

.action-btn {
  background: none;
  border: 1px solid #ced4da;
  border-radius: 4px;
  padding: 0.5rem;
  cursor: pointer;
  color: #6c757d;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  border-color: #007bff;
  color: #007bff;
  background: #f8f9ff;
}

.switch-btn:hover {
  border-color: #28a745;
  color: #28a745;
  background: #f8fff9;
}

.dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #ced4da;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10;
  min-width: 150px;
  padding: 0.5rem 0;
}

.dropdown-item {
  width: 100%;
  background: none;
  border: none;
  padding: 0.5rem 1rem;
  text-align: left;
  cursor: pointer;
  color: #495057;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.dropdown-item:hover {
  background: #f8f9fa;
}

.dropdown-item.delete-item {
  color: #dc3545;
}

.dropdown-item.delete-item:hover {
  background: #f8d7da;
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

.project-meta {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.status-badge,
.priority-badge,
.overdue-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.status-active {
  background: #d4edda;
  color: #155724;
}

.status-completed {
  background: #cce5ff;
  color: #004085;
}

.status-on-hold {
  background: #fff3cd;
  color: #856404;
}

.status-cancelled {
  background: #f8d7da;
  color: #721c24;
}

.priority-low {
  background: #e2f3ff;
  color: #0066cc;
}

.priority-medium {
  background: #fff4e6;
  color: #cc6600;
}

.priority-high {
  background: #ffe6e6;
  color: #cc0000;
}

.priority-critical {
  background: #f8d7da;
  color: #721c24;
}

.overdue-badge {
  background: #f8d7da;
  color: #721c24;
}

.project-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.stat-item {
  text-align: center;
}

.stat-item.overdue {
  color: #dc3545;
}

.stat-label {
  display: block;
  font-size: 0.75rem;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  margin-bottom: 0.25rem;
}

.stat-value {
  display: block;
  font-size: 1.25rem;
  font-weight: 600;
  color: #495057;
}

.progress-container {
  margin-bottom: 1rem;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: #007bff;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.75rem;
  color: #6c757d;
}

.academic-info {
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8f9ff;
  border-radius: 6px;
  border-left: 3px solid #007bff;
}

.academic-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.academic-item:last-child {
  margin-bottom: 0;
}

.academic-label {
  color: #6c757d;
  font-weight: 500;
}

.academic-value {
  color: #495057;
}

.project-tags {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.tag {
  background: #e9ecef;
  color: #495057;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.tag.more-tags {
  background: #007bff;
  color: white;
}

.project-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: #6c757d;
}

.date-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.due-date.overdue {
  color: #dc3545;
  font-weight: 600;
}

.current-indicator {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #28a745;
  font-weight: 600;
}

@media (max-width: 768px) {
  .project-card {
    padding: 1rem;
  }

  .project-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    padding: 0.75rem;
  }

  .project-header {
    flex-direction: column;
    gap: 1rem;
  }

  .project-actions {
    align-self: flex-end;
  }
}
</style>
