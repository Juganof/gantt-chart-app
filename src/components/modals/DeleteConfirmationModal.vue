<template>
  <div v-if="isVisible" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="warning-icon"
          >
            <path
              d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
            ></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          Delete {{ itemType }}?
        </h3>
        <button class="close-btn" @click="$emit('cancel')" type="button">
          <svg
            width="20"
            height="20"
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
        <!-- Item being deleted info -->
        <div class="item-info">
          <div v-if="item.color" class="item-color" :style="{ backgroundColor: item.color }"></div>
          <div class="item-details">
            <h4 class="item-name">{{ item.name || item.title }}</h4>
            <p v-if="item.description" class="item-description">{{ item.description }}</p>
          </div>
        </div>

        <!-- Warning message -->
        <div class="warning-section">
          <div class="warning-content">
            <p class="warning-text">
              {{ warningMessage }}
            </p>

            <!-- Project-specific warnings -->
            <div v-if="itemType === 'Project'" class="project-warnings">
              <div v-if="taskCount > 0" class="warning-item">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polyline points="9 11 12 14 22 4"></polyline>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h11"></path>
                </svg>
                <span
                  >{{ taskCount }} task{{ taskCount === 1 ? '' : 's' }} will be permanently
                  deleted</span
                >
              </div>

              <div v-if="isCurrentProject" class="warning-item">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M12 1v6m0 6v6"></path>
                  <path d="M12 1l-3 3m6 0L12 1"></path>
                </svg>
                <span>This is your current active project</span>
              </div>

              <div v-if="hasAcademicData" class="warning-item">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                </svg>
                <span>Academic information will be lost (grades, assignments, etc.)</span>
              </div>
            </div>

            <!-- Task-specific warnings -->
            <div v-else-if="itemType === 'Task'" class="task-warnings">
              <div v-if="hasDependents" class="warning-item">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polyline points="16 3 21 3 21 8"></polyline>
                  <line x1="4" y1="20" x2="21" y2="3"></line>
                  <polyline points="21 16 21 21 16 21"></polyline>
                  <line x1="15" y1="15" x2="21" y2="21"></line>
                  <line x1="4" y1="4" x2="9" y2="9"></line>
                </svg>
                <span>Other tasks depend on this task</span>
              </div>

              <div v-if="hasSubtasks" class="warning-item">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <rect x="7" y="7" width="10" height="3"></rect>
                  <rect x="7" y="14" width="10" height="3"></rect>
                </svg>
                <span
                  >{{ subtaskCount }} subtask{{ subtaskCount === 1 ? '' : 's' }} will be
                  deleted</span
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Alternative actions -->
        <div v-if="showAlternatives" class="alternatives-section">
          <h5>Alternative actions:</h5>
          <div class="alternative-actions">
            <button v-if="itemType === 'Project'" @click="$emit('archive')" class="alternative-btn">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="21 8 21 21 3 21 3 8"></polyline>
                <rect x="1" y="3" width="22" height="5"></rect>
                <line x1="10" y1="12" x2="14" y2="12"></line>
              </svg>
              Archive instead
            </button>

            <button v-if="itemType === 'Project'" @click="$emit('export')" class="alternative-btn">
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
              Export first
            </button>

            <button
              v-if="itemType === 'Task'"
              @click="$emit('convert-to-standalone')"
              class="alternative-btn"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
                ></path>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
              </svg>
              Convert subtasks
            </button>
          </div>
        </div>

        <!-- Confirmation input for critical items -->
        <div v-if="requiresConfirmation" class="confirmation-section">
          <label for="confirmInput" class="confirmation-label">
            Type "{{ confirmationText }}" to confirm deletion:
          </label>
          <input
            id="confirmInput"
            v-model="confirmationInput"
            type="text"
            class="confirmation-input"
            :placeholder="confirmationText"
            @input="validateConfirmation"
          />
          <p v-if="confirmationError" class="confirmation-error">
            Please type "{{ confirmationText }}" exactly as shown
          </p>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" @click="$emit('cancel')" class="btn-cancel">Cancel</button>
        <button type="button" @click="handleDelete" class="btn-delete" :disabled="!canDelete">
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
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
          {{ deleteButtonText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DeleteConfirmationModal',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    item: {
      type: Object,
      required: true
    },
    itemType: {
      type: String,
      required: true // 'Project', 'Task', etc.
    },
    // Project-specific props
    taskCount: {
      type: Number,
      default: 0
    },
    isCurrentProject: {
      type: Boolean,
      default: false
    },
    // Task-specific props
    subtaskCount: {
      type: Number,
      default: 0
    },
    hasDependents: {
      type: Boolean,
      default: false
    },
    // Options
    showAlternatives: {
      type: Boolean,
      default: true
    },
    requiresConfirmation: {
      type: Boolean,
      default: false
    }
  },
  emits: ['delete', 'cancel', 'archive', 'export', 'convert-to-standalone'],
  data() {
    return {
      confirmationInput: '',
      confirmationError: false
    }
  },
  computed: {
    warningMessage() {
      if (this.itemType === 'Project') {
        if (this.taskCount > 0) {
          return `Are you sure you want to delete this project? This action cannot be undone and will permanently remove all project data including ${this.taskCount} task${this.taskCount === 1 ? '' : 's'}.`
        } else {
          return 'Are you sure you want to delete this project? This action cannot be undone.'
        }
      } else if (this.itemType === 'Task') {
        if (this.hasSubtasks) {
          return `Are you sure you want to delete this task? This will also delete ${this.subtaskCount} subtask${this.subtaskCount === 1 ? '' : 's'}.`
        } else {
          return 'Are you sure you want to delete this task? This action cannot be undone.'
        }
      }
      return `Are you sure you want to delete this ${this.itemType.toLowerCase()}?`
    },
    hasAcademicData() {
      return (
        this.item.subject || this.item.semester || this.item.instructor || this.item.gradeWeight
      )
    },
    hasSubtasks() {
      return this.subtaskCount > 0
    },
    confirmationText() {
      return this.item.name || this.item.title || 'DELETE'
    },
    canDelete() {
      if (this.requiresConfirmation) {
        return this.confirmationInput === this.confirmationText
      }
      return true
    },
    deleteButtonText() {
      if (this.itemType === 'Project') {
        return this.taskCount > 0 ? `Delete Project & ${this.taskCount} Tasks` : 'Delete Project'
      } else if (this.itemType === 'Task') {
        return this.hasSubtasks ? `Delete Task & ${this.subtaskCount} Subtasks` : 'Delete Task'
      }
      return `Delete ${this.itemType}`
    }
  },
  watch: {
    isVisible(newVal) {
      if (newVal) {
        this.resetForm()
        // Focus on confirmation input if required
        this.$nextTick(() => {
          if (this.requiresConfirmation) {
            const input = this.$el.querySelector('#confirmInput')
            if (input) input.focus()
          }
        })
      }
    }
  },
  methods: {
    handleOverlayClick() {
      this.$emit('cancel')
    },
    handleDelete() {
      if (this.canDelete) {
        this.$emit('delete', this.item)
      }
    },
    validateConfirmation() {
      this.confirmationError =
        this.requiresConfirmation &&
        this.confirmationInput !== '' &&
        this.confirmationInput !== this.confirmationText
    },
    resetForm() {
      this.confirmationInput = ''
      this.confirmationError = false
    }
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
  padding: 1rem;
}

.modal-container {
  background: white;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem 1rem 2rem;
  border-bottom: 1px solid #e9ecef;
}

.modal-title {
  margin: 0;
  color: #dc3545;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
}

.warning-icon {
  color: #ffc107;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #6c757d;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background: #f8f9fa;
}

.modal-body {
  padding: 1.5rem 2rem;
}

.item-info {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.item-color {
  width: 4px;
  height: 40px;
  border-radius: 2px;
  flex-shrink: 0;
}

.item-details {
  flex: 1;
  min-width: 0;
}

.item-name {
  margin: 0 0 0.5rem 0;
  color: #495057;
  font-size: 1rem;
  font-weight: 600;
}

.item-description {
  margin: 0;
  color: #6c757d;
  font-size: 0.875rem;
  line-height: 1.4;
}

.warning-section {
  margin-bottom: 1.5rem;
}

.warning-content {
  padding: 1rem;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 6px;
  border-left: 4px solid #ffc107;
}

.warning-text {
  margin: 0 0 1rem 0;
  color: #856404;
  font-weight: 500;
  line-height: 1.5;
}

.project-warnings,
.task-warnings {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.warning-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #856404;
  font-size: 0.875rem;
}

.warning-item svg {
  flex-shrink: 0;
  color: #dc3545;
}

.alternatives-section {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8f9ff;
  border-radius: 6px;
  border-left: 3px solid #007bff;
}

.alternatives-section h5 {
  margin: 0 0 0.75rem 0;
  color: #495057;
  font-size: 0.875rem;
  font-weight: 600;
}

.alternative-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.alternative-btn {
  background: white;
  border: 1px solid #007bff;
  color: #007bff;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  transition: all 0.2s;
}

.alternative-btn:hover {
  background: #007bff;
  color: white;
}

.confirmation-section {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8d7da;
  border-radius: 6px;
  border-left: 3px solid #dc3545;
}

.confirmation-label {
  display: block;
  color: #721c24;
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.confirmation-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #dc3545;
  border-radius: 4px;
  font-size: 0.875rem;
  background: white;
}

.confirmation-input:focus {
  outline: none;
  border-color: #c82333;
  box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.25);
}

.confirmation-error {
  margin: 0.5rem 0 0 0;
  color: #721c24;
  font-size: 0.75rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 2rem 1.5rem 2rem;
  border-top: 1px solid #e9ecef;
}

.btn-cancel,
.btn-delete {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-cancel {
  background: #6c757d;
  color: white;
}

.btn-cancel:hover {
  background: #545b62;
}

.btn-delete {
  background: #dc3545;
  color: white;
}

.btn-delete:hover:not(:disabled) {
  background: #c82333;
}

.btn-delete:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .modal-container {
    margin: 1rem;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .item-info {
    flex-direction: column;
    gap: 0.75rem;
  }

  .alternative-actions {
    flex-direction: column;
  }

  .modal-footer {
    flex-direction: column;
  }
}
</style>
