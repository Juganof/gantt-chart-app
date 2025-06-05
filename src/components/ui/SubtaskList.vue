<template>
  <div class="subtask-list">
    <div class="subtask-list-header">
      <h4>Subtasks ({{ subtasks.length }})</h4>
      <div class="header-actions">
        <button
          v-if="subtasks.length > 0"
          @click="toggleExpandAll"
          class="btn-toggle-all"
          :title="allExpanded ? 'Collapse All' : 'Expand All'"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path v-if="allExpanded" d="M18 6L6 18M6 6l12 12"></path>
            <path v-else d="M9 18l6-6-6-6"></path>
          </svg>
          {{ allExpanded ? 'Collapse All' : 'Expand All' }}
        </button>
        <button @click="$emit('add-subtask')" class="btn-add-subtask">
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
          Add Subtask
        </button>
      </div>
    </div>

    <div v-if="subtasks.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path d="M9 12l2 2 4-4"></path>
          <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.66 0 3.22.45 4.56 1.23"></path>
        </svg>
      </div>
      <h3>No subtasks yet</h3>
      <p>
        Break down this task into smaller, manageable subtasks to track progress more effectively.
      </p>
      <button @click="$emit('add-subtask')" class="btn-add-first-subtask">Add First Subtask</button>
    </div>

    <div v-else class="subtask-items">
      <TransitionGroup name="subtask" tag="div">
        <SubtaskItem
          v-for="subtask in sortedSubtasks"
          :key="subtask.id"
          :subtask="subtask"
          :level="0"
          :is-expanded="expandedSubtasks.has(subtask.id)"
          :show-progress="showProgress"
          :show-dependencies="showDependencies"
          @toggle-expand="toggleSubtaskExpansion"
          @edit="$emit('edit-subtask', $event)"
          @delete="$emit('delete-subtask', $event)"
          @status-change="$emit('status-change', $event)"
          @add-child="$emit('add-subtask', $event)"
        />
      </TransitionGroup>
    </div>

    <div v-if="subtasks.length > 0" class="subtask-list-footer">
      <div class="progress-summary">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${progressPercentage}%` }"></div>
        </div>
        <span class="progress-text">
          {{ completedCount }} of {{ subtasks.length }} completed ({{ progressPercentage }}%)
        </span>
      </div>

      <div class="list-options">
        <label class="option-toggle">
          <input
            type="checkbox"
            v-model="showProgress"
            @change="$emit('toggle-progress', showProgress)"
          />
          Show Progress
        </label>
        <label class="option-toggle">
          <input
            type="checkbox"
            v-model="showDependencies"
            @change="$emit('toggle-dependencies', showDependencies)"
          />
          Show Dependencies
        </label>
      </div>
    </div>
  </div>
</template>

<script>
import SubtaskItem from './SubtaskItem.vue'

export default {
  name: 'SubtaskList',
  components: {
    SubtaskItem
  },
  props: {
    subtasks: {
      type: Array,
      default: () => []
    },
    parentTask: {
      type: Object,
      required: true
    },
    expandedSubtasks: {
      type: Set,
      default: () => new Set()
    }
  },
  emits: [
    'add-subtask',
    'edit-subtask',
    'delete-subtask',
    'status-change',
    'toggle-progress',
    'toggle-dependencies',
    'expand-all',
    'collapse-all'
  ],
  data() {
    return {
      showProgress: true,
      showDependencies: false,
      allExpanded: false
    }
  },
  computed: {
    sortedSubtasks() {
      return [...this.subtasks].sort((a, b) => {
        // Sort by order first, then by creation date
        if (a.order !== b.order) {
          return (a.order || 0) - (b.order || 0)
        }
        return new Date(a.created || 0) - new Date(b.created || 0)
      })
    },

    completedCount() {
      return this.subtasks.filter(
        subtask => subtask.status === 'done' || subtask.status === 'completed'
      ).length
    },

    progressPercentage() {
      if (this.subtasks.length === 0) return 0
      return Math.round((this.completedCount / this.subtasks.length) * 100)
    }
  },
  watch: {
    expandedSubtasks: {
      handler(newExpanded) {
        this.allExpanded = newExpanded.size === this.subtasks.length
      },
      deep: true
    }
  },
  methods: {
    toggleSubtaskExpansion(subtaskId) {
      const newExpanded = new Set(this.expandedSubtasks)
      if (newExpanded.has(subtaskId)) {
        newExpanded.delete(subtaskId)
      } else {
        newExpanded.add(subtaskId)
      }
      this.$emit('expand-all', newExpanded)
    },

    toggleExpandAll() {
      if (this.allExpanded) {
        this.$emit('collapse-all')
      } else {
        const allIds = new Set(this.subtasks.map(s => s.id))
        this.$emit('expand-all', allIds)
      }
    }
  }
}
</script>

<style scoped>
.subtask-list {
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.subtask-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.subtask-list-header h4 {
  margin: 0;
  color: #374151;
  font-size: 1rem;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.btn-toggle-all,
.btn-add-subtask {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-toggle-all:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.btn-add-subtask {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.btn-add-subtask:hover {
  background: #2563eb;
  border-color: #2563eb;
}

.empty-state {
  text-align: center;
  padding: 48px 24px;
  color: #6b7280;
}

.empty-icon {
  margin: 0 auto 16px;
  color: #9ca3af;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  color: #374151;
  font-size: 1.125rem;
  font-weight: 600;
}

.empty-state p {
  margin: 0 0 24px 0;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.5;
}

.btn-add-first-subtask {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-add-first-subtask:hover {
  background: #2563eb;
}

.subtask-items {
  padding: 0;
}

.subtask-list-footer {
  padding: 16px 20px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.progress-summary {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #10b981;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.875rem;
  color: #374151;
  font-weight: 500;
  white-space: nowrap;
}

.list-options {
  display: flex;
  gap: 16px;
}

.option-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
}

.option-toggle input[type='checkbox'] {
  margin: 0;
}

/* Transition animations */
.subtask-enter-active,
.subtask-leave-active {
  transition: all 0.3s ease;
}

.subtask-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.subtask-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.subtask-move {
  transition: transform 0.3s ease;
}

@media (max-width: 768px) {
  .subtask-list-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .header-actions {
    justify-content: space-between;
  }

  .subtask-list-footer {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .progress-summary {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .list-options {
    justify-content: center;
  }
}
</style>
