<template>
  <div v-if="isVisible" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h2>{{ isEditing ? 'Edit Subtask' : 'Add New Subtask' }}</h2>
        <button @click="$emit('cancel')" class="close-button" title="Close">
          <svg
            width="24"
            height="24"
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

      <div class="modal-body">
        <div v-if="parentTask" class="parent-task-info">
          <h4>Parent Task:</h4>
          <div class="parent-task-card">
            <span class="parent-task-title">{{ parentTask.title }}</span>
            <span class="parent-task-status" :class="`status-${parentTask.status}`">
              {{ formatStatus(parentTask.status) }}
            </span>
          </div>
        </div>

        <SubtaskForm
          :subtask="subtask"
          :parent-task="parentTask"
          :all-subtasks="allSubtasks"
          @submit="handleSubmit"
          @cancel="$emit('cancel')"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import SubtaskForm from '../forms/SubtaskForm.vue'

export default {
  name: 'SubtaskModal',
  components: {
    SubtaskForm
  },
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    subtask: {
      type: Object,
      default: null
    },
    parentTask: {
      type: Object,
      default: null
    }
  },
  emits: ['submit', 'cancel', 'success', 'error'],
  data() {
    return {
      isSubmitting: false
    }
  },
  computed: {
    ...mapState(['tasks']),
    ...mapGetters(['subtasksOf']),

    isEditing() {
      return !!this.subtask
    },

    allSubtasks() {
      if (!this.parentTask) return []
      return this.subtasksOf(this.parentTask.id)
    }
  },
  methods: {
    ...mapActions(['addSubtask', 'updateTask']),

    async handleSubmit(subtaskData) {
      if (this.isSubmitting) return

      this.isSubmitting = true

      try {
        if (this.isEditing) {
          // Update existing subtask
          await this.updateTask({
            id: this.subtask.id,
            updates: subtaskData
          })
          this.$emit('success', {
            type: 'update',
            message: 'Subtask updated successfully',
            subtask: { ...this.subtask, ...subtaskData }
          })
        } else {
          // Create new subtask
          const newSubtask = await this.addSubtask({
            parentId: this.parentTask.id,
            subtaskData
          })
          this.$emit('success', {
            type: 'create',
            message: 'Subtask created successfully',
            subtask: newSubtask
          })
        }

        this.$emit('submit', subtaskData)
      } catch (error) {
        console.error('Error saving subtask:', error)
        this.$emit('error', {
          message: error.message || 'Failed to save subtask',
          error
        })
      } finally {
        this.isSubmitting = false
      }
    },

    handleOverlayClick() {
      this.$emit('cancel')
    },

    formatStatus(status) {
      return status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
    }
  },
  watch: {
    isVisible(newValue) {
      if (newValue) {
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden'
      } else {
        // Restore body scroll when modal is closed
        document.body.style.overflow = ''
      }
    }
  },
  beforeUnmount() {
    // Ensure body scroll is restored if component is destroyed while modal is open
    document.body.style.overflow = ''
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 12px;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0 24px;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 0;
}

.modal-header h2 {
  margin: 0;
  color: #1f2937;
  font-size: 1.5rem;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  color: #6b7280;
  transition: all 0.2s;
}

.close-button:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.parent-task-info {
  padding: 24px 24px 0 24px;
  margin-bottom: 24px;
}

.parent-task-info h4 {
  margin: 0 0 12px 0;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.parent-task-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.parent-task-title {
  font-weight: 500;
  color: #1f2937;
}

.parent-task-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.status-in-progress {
  background: #dbeafe;
  color: #1e40af;
}

.status-done {
  background: #d1fae5;
  color: #065f46;
}

.status-review {
  background: #e0e7ff;
  color: #3730a3;
}

.status-deferred {
  background: #f3f4f6;
  color: #374151;
}

.status-cancelled {
  background: #fee2e2;
  color: #991b1b;
}

/* Override SubtaskForm styles when inside modal */
.modal-body :deep(.subtask-form) {
  box-shadow: none;
  border-radius: 0;
  padding: 0 24px 24px 24px;
}

.modal-body :deep(.subtask-form h3) {
  display: none; /* Hide the form title since we have it in modal header */
}

@media (max-width: 768px) {
  .modal-overlay {
    padding: 10px;
  }

  .modal-container {
    max-height: 95vh;
  }

  .modal-header {
    padding: 16px 16px 0 16px;
  }

  .parent-task-info {
    padding: 16px 16px 0 16px;
  }

  .modal-body :deep(.subtask-form) {
    padding: 0 16px 16px 16px;
  }

  .parent-task-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
