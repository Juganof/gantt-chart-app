<template>
  <div
    class="subtask-item"
    :class="[
      `level-${level}`,
      `status-${subtask.status}`,
      { 'is-expanded': isExpanded, 'has-children': hasChildren }
    ]"
  >
    <div class="subtask-content">
      <!-- Indentation and expand/collapse button -->
      <div class="subtask-indent" :style="{ paddingLeft: `${level * 24}px` }">
        <button
          v-if="hasChildren"
          @click="$emit('toggle-expand', subtask.id)"
          class="expand-button"
          :title="isExpanded ? 'Collapse' : 'Expand'"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path :d="isExpanded ? 'M6 9l6 6 6-6' : 'M9 18l6-6-6-6'"></path>
          </svg>
        </button>
        <div v-else class="expand-spacer"></div>
      </div>

      <!-- Status indicator and checkbox -->
      <div class="status-section">
        <button
          @click="toggleStatus"
          class="status-button"
          :class="`status-${subtask.status}`"
          :title="`Mark as ${getNextStatus()}`"
        >
          <svg
            v-if="subtask.status === 'done'"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M9 12l2 2 4-4"></path>
            <circle cx="12" cy="12" r="10"></circle>
          </svg>
          <svg
            v-else-if="subtask.status === 'in-progress'"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 6v6l4 2"></path>
          </svg>
          <svg
            v-else
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10"></circle>
          </svg>
        </button>
      </div>

      <!-- Main content -->
      <div class="main-content">
        <div class="subtask-header">
          <h5 class="subtask-title">{{ subtask.title }}</h5>
          <div class="subtask-meta">
            <span
              v-if="subtask.priority && subtask.priority !== 'medium'"
              class="priority-badge"
              :class="`priority-${subtask.priority}`"
            >
              {{ subtask.priority }}
            </span>
            <span v-if="subtask.estimatedTime" class="time-estimate">
              {{ subtask.estimatedTime }}
            </span>
            <span class="status-badge" :class="`status-${subtask.status}`">
              {{ formatStatus(subtask.status) }}
            </span>
          </div>
        </div>

        <div v-if="subtask.description" class="subtask-description">
          {{ subtask.description }}
        </div>

        <!-- Progress bar (if enabled) -->
        <div v-if="showProgress && hasChildren" class="progress-section">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${subtaskProgress}%` }"></div>
          </div>
          <span class="progress-text">{{ subtaskProgress }}% complete</span>
        </div>

        <!-- Dependencies (if enabled) -->
        <div
          v-if="showDependencies && subtask.dependencies && subtask.dependencies.length > 0"
          class="dependencies-section"
        >
          <span class="dependencies-label">Depends on:</span>
          <div class="dependencies-list">
            <span v-for="depId in subtask.dependencies" :key="depId" class="dependency-tag">
              {{ getDependencyTitle(depId) }}
            </span>
          </div>
        </div>

        <!-- Implementation details (if expanded) -->
        <div v-if="isExpanded && subtask.details" class="details-section">
          <h6>Implementation Details:</h6>
          <div class="details-content">{{ subtask.details }}</div>
        </div>
      </div>

      <!-- Actions -->
      <div class="actions-section">
        <div class="action-buttons">
          <button
            @click="$emit('edit', subtask)"
            class="action-button edit-button"
            title="Edit subtask"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>

          <button
            @click="$emit('add-child', subtask)"
            class="action-button add-button"
            title="Add child subtask"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>

          <button
            @click="$emit('delete', subtask)"
            class="action-button delete-button"
            title="Delete subtask"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="3,6 5,6 21,6"></polyline>
              <path
                d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"
              ></path>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Child subtasks (if expanded) -->
    <div v-if="isExpanded && hasChildren" class="child-subtasks">
      <SubtaskItem
        v-for="child in childSubtasks"
        :key="child.id"
        :subtask="child"
        :level="level + 1"
        :is-expanded="expandedSubtasks.has(child.id)"
        :show-progress="showProgress"
        :show-dependencies="showDependencies"
        @toggle-expand="$emit('toggle-expand', $event)"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
        @status-change="$emit('status-change', $event)"
        @add-child="$emit('add-child', $event)"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'SubtaskItem',
  props: {
    subtask: {
      type: Object,
      required: true
    },
    level: {
      type: Number,
      default: 0
    },
    isExpanded: {
      type: Boolean,
      default: false
    },
    showProgress: {
      type: Boolean,
      default: true
    },
    showDependencies: {
      type: Boolean,
      default: false
    },
    allSubtasks: {
      type: Array,
      default: () => []
    },
    expandedSubtasks: {
      type: Set,
      default: () => new Set()
    }
  },
  emits: ['toggle-expand', 'edit', 'delete', 'status-change', 'add-child'],
  computed: {
    hasChildren() {
      return this.childSubtasks.length > 0
    },

    childSubtasks() {
      return this.allSubtasks.filter(s => s.parentTask === this.subtask.id)
    },

    subtaskProgress() {
      if (!this.hasChildren) return 0
      const completed = this.childSubtasks.filter(s => s.status === 'done').length
      return Math.round((completed / this.childSubtasks.length) * 100)
    }
  },
  methods: {
    toggleStatus() {
      const statusFlow = {
        pending: 'in-progress',
        'in-progress': 'done',
        done: 'pending',
        review: 'done',
        deferred: 'pending',
        cancelled: 'pending'
      }

      const newStatus = statusFlow[this.subtask.status] || 'pending'
      this.$emit('status-change', {
        subtask: this.subtask,
        newStatus
      })
    },

    getNextStatus() {
      const statusLabels = {
        pending: 'In Progress',
        'in-progress': 'Done',
        done: 'Pending',
        review: 'Done',
        deferred: 'Pending',
        cancelled: 'Pending'
      }

      return statusLabels[this.subtask.status] || 'In Progress'
    },

    formatStatus(status) {
      return status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
    },

    getDependencyTitle(depId) {
      const dep = this.allSubtasks.find(s => s.id === depId)
      return dep ? dep.title : `Task ${depId}`
    }
  }
}
</script>

<style scoped>
.subtask-item {
  border-bottom: 1px solid #f3f4f6;
  transition: all 0.2s ease;
}

.subtask-item:hover {
  background: #f9fafb;
}

.subtask-item:last-child {
  border-bottom: none;
}

.subtask-content {
  display: flex;
  align-items: flex-start;
  padding: 12px 16px;
  gap: 12px;
}

.subtask-indent {
  display: flex;
  align-items: center;
  min-width: 24px;
}

.expand-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: #6b7280;
  transition: all 0.2s;
}

.expand-button:hover {
  background: #e5e7eb;
  color: #374151;
}

.expand-spacer {
  width: 24px;
  height: 24px;
}

.status-section {
  display: flex;
  align-items: center;
}

.status-button {
  background: none;
  border: 2px solid;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.status-button.status-pending {
  border-color: #d1d5db;
  color: #6b7280;
}

.status-button.status-pending:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}

.status-button.status-in-progress {
  border-color: #3b82f6;
  color: #3b82f6;
  background: #dbeafe;
}

.status-button.status-done {
  border-color: #10b981;
  color: white;
  background: #10b981;
}

.status-button.status-review {
  border-color: #8b5cf6;
  color: #8b5cf6;
  background: #ede9fe;
}

.status-button.status-deferred {
  border-color: #6b7280;
  color: #6b7280;
}

.status-button.status-cancelled {
  border-color: #ef4444;
  color: #ef4444;
}

.main-content {
  flex: 1;
  min-width: 0;
}

.subtask-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 4px;
}

.subtask-title {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 500;
  color: #1f2937;
  line-height: 1.4;
}

.subtask-meta {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-shrink: 0;
}

.priority-badge,
.status-badge,
.time-estimate {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.priority-badge.priority-low {
  background: #f3f4f6;
  color: #6b7280;
}

.priority-badge.priority-high {
  background: #fef3c7;
  color: #92400e;
}

.priority-badge.priority-critical {
  background: #fee2e2;
  color: #991b1b;
}

.status-badge.status-pending {
  background: #f3f4f6;
  color: #6b7280;
}

.status-badge.status-in-progress {
  background: #dbeafe;
  color: #1e40af;
}

.status-badge.status-done {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.status-review {
  background: #ede9fe;
  color: #6d28d9;
}

.status-badge.status-deferred {
  background: #f3f4f6;
  color: #6b7280;
}

.status-badge.status-cancelled {
  background: #fee2e2;
  color: #991b1b;
}

.time-estimate {
  background: #e0e7ff;
  color: #3730a3;
}

.subtask-description {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.4;
  margin-bottom: 8px;
}

.progress-section {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #10b981;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.75rem;
  color: #6b7280;
  white-space: nowrap;
}

.dependencies-section {
  margin-bottom: 8px;
}

.dependencies-label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
  margin-right: 6px;
}

.dependencies-list {
  display: inline-flex;
  gap: 4px;
  flex-wrap: wrap;
}

.dependency-tag {
  background: #f3f4f6;
  color: #374151;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
}

.details-section {
  margin-top: 8px;
  padding: 8px;
  background: #f9fafb;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
}

.details-section h6 {
  margin: 0 0 6px 0;
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.details-content {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.4;
  white-space: pre-wrap;
}

.actions-section {
  display: flex;
  align-items: center;
}

.action-buttons {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.subtask-item:hover .action-buttons {
  opacity: 1;
}

.action-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  color: #6b7280;
  transition: all 0.2s;
}

.action-button:hover {
  background: #e5e7eb;
}

.edit-button:hover {
  color: #3b82f6;
}

.add-button:hover {
  color: #10b981;
}

.delete-button:hover {
  color: #ef4444;
}

.child-subtasks {
  border-left: 2px solid #e5e7eb;
  margin-left: 36px;
}

/* Level-based styling */
.level-0 {
  background: white;
}

.level-1 {
  background: #fafafa;
}

.level-2 {
  background: #f5f5f5;
}

.level-3 {
  background: #f0f0f0;
}

@media (max-width: 768px) {
  .subtask-content {
    padding: 8px 12px;
    gap: 8px;
  }

  .subtask-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .subtask-meta {
    flex-wrap: wrap;
  }

  .action-buttons {
    opacity: 1; /* Always show on mobile */
  }

  .child-subtasks {
    margin-left: 24px;
  }
}
</style>
