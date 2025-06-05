<template>
  <div class="task-card" :class="{ completed: task.status === 'completed' }">
    <div class="task-header">
      <h3 class="task-title">{{ task.title }}</h3>
      <div class="task-actions">
        <button @click="$emit('edit', task)" class="btn-icon" title="Edit task">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
        <button @click="$emit('delete', task.id)" class="btn-icon btn-danger" title="Delete task">
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
              d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2,2h4a2,2 0 0,1,2,2v2"
            ></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      </div>
    </div>

    <p class="task-description" v-if="task.description">{{ task.description }}</p>

    <div class="task-dates" v-if="task.startDate && task.endDate">
      <span class="date-range">
        {{ formatDate(task.startDate) }} - {{ formatDate(task.endDate) }}
      </span>
      <span class="duration">{{ calculateDuration() }}</span>
    </div>

    <!-- Days Left Indicator -->
    <div v-if="daysLeftInfo.show" class="days-left" :class="daysLeftInfo.urgencyClass">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12,6 12,12 16,14"></polyline>
      </svg>
      <span>{{ daysLeftInfo.message }}</span>
    </div>

    <!-- Subtasks Section -->
    <div v-if="hasSubtasks" class="subtasks-section">
      <div class="subtasks-header">
        <h4>Subtasks ({{ subtasks.length }})</h4>
        <button @click="handleAddSubtask" class="btn-add-subtask" title="Add subtask">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>

      <!-- Existing Subtasks -->
      <div class="subtasks-list">
        <div
          v-for="subtask in subtasks"
          :key="subtask.id"
          class="subtask-item"
          :class="{ completed: subtask.status === 'done' }"
        >
          <button
            @click="toggleSubtaskStatus(subtask)"
            class="subtask-checkbox"
            :class="{ checked: subtask.status === 'done' }"
          >
            <svg
              v-if="subtask.status === 'done'"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
            >
              <polyline points="20,6 9,17 4,12"></polyline>
            </svg>
          </button>
          <span class="subtask-title" @click="$emit('edit', subtask)">{{ subtask.title }}</span>
          <button @click="deleteSubtask(subtask)" class="subtask-delete" title="Delete subtask">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      <!-- Subtask Progress -->
      <div class="subtask-progress">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: subtaskProgress + '%' }"></div>
        </div>
        <span class="progress-text"
          >{{ completedSubtasks }} of {{ subtasks.length }} completed</span
        >
      </div>
    </div>

    <!-- Add Subtask Button (when no subtasks exist) -->
    <button v-if="!hasSubtasks" @click="handleAddSubtask" class="btn-add-first-subtask">
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
      Add Subtasks
    </button>

    <div class="task-meta">
      <span class="priority" :class="task.priority">{{ task.priority }}</span>
      <span class="status" :class="task.status">{{ formatStatus(task.status) }}</span>
      <span v-if="task.estimatedTime" class="estimated-time">{{ task.estimatedTime }}</span>
      <span v-if="task.complexity" class="complexity">Complexity: {{ task.complexity }}/10</span>
    </div>

    <div class="task-tags" v-if="task.tags && task.tags.length">
      <span v-for="tag in task.tags" :key="tag" class="tag">{{ tag }}</span>
    </div>

    <div class="task-footer">
      <small class="task-dates-meta">
        Created: {{ formatDate(task.created) }}
        <span v-if="task.updated !== task.created">
          • Updated: {{ formatDate(task.updated) }}
        </span>
      </small>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'TaskCard',
  props: {
    task: {
      type: Object,
      required: true
    }
  },
  emits: ['edit', 'delete', 'add-subtask'],
  data() {
    return {
      // No longer need showSubtaskForm or newSubtaskTitle
    }
  },
  computed: {
    ...mapGetters(['subtasksOf']),

    subtasks() {
      return this.subtasksOf(this.task.id)
    },

    hasSubtasks() {
      return this.subtasks.length > 0
    },

    completedSubtasks() {
      return this.subtasks.filter(subtask => subtask.status === 'done').length
    },

    subtaskProgress() {
      if (this.subtasks.length === 0) return 0
      return Math.round((this.completedSubtasks / this.subtasks.length) * 100)
    },

    daysLeftInfo() {
      // Don't show for completed or cancelled tasks
      if (this.task.status === 'completed' || this.task.status === 'cancelled') {
        return { show: false }
      }

      if (!this.task.endDate) {
        return { show: false }
      }

      const today = new Date()
      const endDate = new Date(this.task.endDate)

      // Set times to midnight for accurate day comparison
      today.setHours(0, 0, 0, 0)
      endDate.setHours(0, 0, 0, 0)

      const diffTime = endDate - today
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays < 0) {
        // Overdue
        const overdueDays = Math.abs(diffDays)
        return {
          show: true,
          message: `${overdueDays} day${overdueDays !== 1 ? 's' : ''} overdue`,
          urgencyClass: 'overdue'
        }
      } else if (diffDays === 0) {
        // Due today
        return {
          show: true,
          message: 'Due today',
          urgencyClass: 'due-today'
        }
      } else if (diffDays === 1) {
        // Due tomorrow
        return {
          show: true,
          message: 'Due tomorrow',
          urgencyClass: 'due-soon'
        }
      } else if (diffDays <= 3) {
        // Due within 3 days
        return {
          show: true,
          message: `${diffDays} days left`,
          urgencyClass: 'due-soon'
        }
      } else if (diffDays <= 7) {
        // Due within a week
        return {
          show: true,
          message: `${diffDays} days left`,
          urgencyClass: 'due-normal'
        }
      } else {
        // Due in more than a week
        return {
          show: true,
          message: `${diffDays} days left`,
          urgencyClass: 'due-later'
        }
      }
    }
  },
  methods: {
    ...mapActions(['addSubtask', 'updateTask', 'deleteTask']),

    async toggleSubtaskStatus(subtask) {
      try {
        const newStatus = subtask.status === 'done' ? 'pending' : 'done'
        await this.updateTask({
          id: subtask.id,
          updates: { status: newStatus }
        })
      } catch (error) {
        console.error('Error updating subtask status:', error)
        alert('Failed to update subtask: ' + error.message)
      }
    },

    async deleteSubtask(subtask) {
      if (confirm(`Are you sure you want to delete "${subtask.title}"?`)) {
        try {
          await this.deleteTask(subtask.id)
        } catch (error) {
          console.error('Error deleting subtask:', error)
          alert('Failed to delete subtask: ' + error.message)
        }
      }
    },

    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    },
    formatStatus(status) {
      const statusMap = {
        todo: 'To Do',
        'in-progress': 'In Progress',
        completed: 'Completed',
        'on-hold': 'On Hold',
        cancelled: 'Cancelled'
      }
      return statusMap[status] || status
    },
    calculateDuration() {
      if (!this.task.startDate || !this.task.endDate) return ''

      const start = new Date(this.task.startDate)
      const end = new Date(this.task.endDate)
      const diffTime = Math.abs(end - start)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 1) return '1 day'
      if (diffDays < 7) return `${diffDays} days`
      if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7)
        const remainingDays = diffDays % 7
        if (remainingDays === 0) return `${weeks} week${weeks > 1 ? 's' : ''}`
        return `${weeks}w ${remainingDays}d`
      }

      const months = Math.floor(diffDays / 30)
      return `${months} month${months > 1 ? 's' : ''}`
    },
    handleAddSubtask() {
      this.$emit('add-subtask', this.task)
    }
  }
}
</script>

<style scoped>
.task-card {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
  background: white;
  transition: all 0.2s ease;
  position: relative;
}

.task-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #007bff;
}

.task-card.completed {
  opacity: 0.8;
  background: #f8f9fa;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.task-title {
  margin: 0;
  color: #495057;
  font-size: 1.1rem;
  font-weight: 600;
  flex: 1;
  margin-right: 1rem;
}

.task-card.completed .task-title {
  text-decoration: line-through;
  color: #6c757d;
}

.task-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  color: #6c757d;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon:hover {
  background: #f8f9fa;
  color: #495057;
}

.btn-danger:hover {
  background: #f8d7da;
  color: #721c24;
}

.task-description {
  margin: 0 0 1rem 0;
  color: #6c757d;
  font-size: 0.9rem;
  line-height: 1.4;
}

.task-dates {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: #495057;
}

.date-range {
  font-weight: 500;
}

.duration {
  color: #6c757d;
  font-style: italic;
}

/* Days Left Indicator Styles */
.days-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 1rem;
  border: 1px solid;
}

.days-left svg {
  flex-shrink: 0;
}

.days-left.overdue {
  background: #f8d7da;
  color: #721c24;
  border-color: #f5c6cb;
  animation: pulse 2s infinite;
}

.days-left.due-today {
  background: #fff3cd;
  color: #856404;
  border-color: #ffeaa7;
  animation: pulse-subtle 3s infinite;
}

.days-left.due-soon {
  background: #fef3e2;
  color: #975a16;
  border-color: #f6d55c;
}

.days-left.due-normal {
  background: #e3f2fd;
  color: #0d47a1;
  border-color: #bbdefb;
}

.days-left.due-later {
  background: #f1f8e9;
  color: #2e7d32;
  border-color: #c8e6c9;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
  100% {
    opacity: 1;
  }
}

@keyframes pulse-subtle {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.85;
  }
  100% {
    opacity: 1;
  }
}

.task-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.priority,
.status,
.estimated-time,
.complexity {
  padding: 0.25rem 0.5rem;
  border-radius: 3px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.priority.low {
  background: #d4edda;
  color: #155724;
}

.priority.medium {
  background: #fff3cd;
  color: #856404;
}

.priority.high {
  background: #f8d7da;
  color: #721c24;
}

.priority.critical {
  background: #721c24;
  color: white;
}

.status.todo {
  background: #e2e3e5;
  color: #383d41;
}

.status.in-progress {
  background: #cce7ff;
  color: #004085;
}

.status.completed {
  background: #d4edda;
  color: #155724;
}

.status.on-hold {
  background: #fff3cd;
  color: #856404;
}

.status.cancelled {
  background: #f8d7da;
  color: #721c24;
}

.estimated-time,
.complexity {
  background: #f8f9fa;
  color: #495057;
  text-transform: none;
}

.task-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-bottom: 1rem;
}

.tag {
  background: #e9ecef;
  color: #495057;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-size: 0.7rem;
  font-weight: 500;
}

.task-footer {
  border-top: 1px solid #e9ecef;
  padding-top: 0.75rem;
  margin-top: 1rem;
}

.task-dates-meta {
  color: #6c757d;
  font-size: 0.75rem;
}

/* Subtask Styles */
.subtasks-section {
  margin: 1rem 0;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.subtasks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.subtasks-header h4 {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #495057;
}

.btn-add-subtask {
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-add-subtask:hover {
  background: #0056b3;
}

.btn-add-first-subtask {
  width: 100%;
  background: #f8f9fa;
  color: #6c757d;
  border: 2px dashed #dee2e6;
  border-radius: 6px;
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: 1rem 0;
  font-size: 0.875rem;
}

.btn-add-first-subtask:hover {
  background: white;
  border-color: #007bff;
  color: #007bff;
}

.subtasks-list {
  margin-bottom: 0.75rem;
}

.subtask-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  margin-bottom: 0.25rem;
  transition: all 0.2s;
}

.subtask-item:hover {
  background: #f8f9fa;
}

.subtask-item.completed {
  opacity: 0.7;
}

.subtask-checkbox {
  width: 16px;
  height: 16px;
  border: 2px solid #ced4da;
  border-radius: 3px;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.subtask-checkbox:hover {
  border-color: #007bff;
}

.subtask-checkbox.checked {
  background: #28a745;
  border-color: #28a745;
  color: white;
}

.subtask-title {
  flex: 1;
  font-size: 0.875rem;
  color: #495057;
  cursor: pointer;
  transition: color 0.2s;
}

.subtask-title:hover {
  color: #007bff;
  text-decoration: underline;
}

.subtask-item.completed .subtask-title {
  text-decoration: line-through;
  color: #6c757d;
}

.subtask-delete {
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  padding: 2px;
  border-radius: 2px;
  opacity: 0;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.subtask-item:hover .subtask-delete {
  opacity: 1;
}

.subtask-delete:hover {
  background: #f8d7da;
}

.subtask-progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #28a745;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.75rem;
  color: #6c757d;
  white-space: nowrap;
}
</style>
