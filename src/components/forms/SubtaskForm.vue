<template>
  <div class="subtask-form">
    <h3>{{ isEditing ? 'Edit Subtask' : 'Add New Subtask' }}</h3>

    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="title">Subtask Title *</label>
        <input
          id="title"
          v-model="form.title"
          type="text"
          required
          placeholder="Enter subtask title"
          class="form-input"
          @keydown.enter.prevent="handleSubmit"
        />
      </div>

      <div class="form-group">
        <label for="description">Description</label>
        <textarea
          id="description"
          v-model="form.description"
          placeholder="Enter subtask description"
          class="form-textarea"
          rows="2"
        ></textarea>
      </div>

      <!-- Date Fields -->
      <div class="form-row">
        <div class="form-group">
          <label for="startDate">Start Date</label>
          <input id="startDate" v-model="form.startDate" type="date" class="form-input" />
        </div>

        <div class="form-group">
          <label for="endDate">End Date</label>
          <input id="endDate" v-model="form.endDate" type="date" class="form-input" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="priority">Priority</label>
          <select id="priority" v-model="form.priority" class="form-select">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div class="form-group">
          <label for="status">Status</label>
          <select id="status" v-model="form.status" class="form-select">
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="on-hold">On Hold</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="estimatedTime">Estimated Time</label>
          <input
            id="estimatedTime"
            v-model="form.estimatedTime"
            type="text"
            placeholder="e.g., 2 hours, 1 day"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="order">Order</label>
          <input
            id="order"
            v-model.number="form.order"
            type="number"
            min="0"
            class="form-input"
            placeholder="Order within parent"
          />
        </div>
      </div>

      <!-- Subtask Dependencies Section -->
      <div class="form-group" v-if="availableSubtasks.length > 0">
        <label class="form-label">Subtask Dependencies</label>
        <div class="dependencies-section">
          <div v-if="form.dependencies.length === 0" class="no-dependencies">
            <p>This subtask has no dependencies</p>
          </div>

          <div v-else class="current-dependencies">
            <h4>Current Dependencies:</h4>
            <div v-for="(depId, index) in form.dependencies" :key="index" class="dependency-item">
              <span class="dependency-text">
                <strong>{{ getSubtaskTitle(depId) }}</strong>
                must be completed first
              </span>
              <button
                type="button"
                @click="removeDependency(index)"
                class="remove-dependency"
                title="Remove dependency"
              >
                ×
              </button>
            </div>
          </div>

          <div class="add-dependency">
            <h4>Add Dependency:</h4>
            <div class="dependency-controls">
              <select v-model="newDependencyId" class="form-select">
                <option value="">Select a subtask...</option>
                <option v-for="subtask in availableSubtasks" :key="subtask.id" :value="subtask.id">
                  {{ subtask.title }}
                </option>
              </select>

              <button
                type="button"
                @click="addDependency"
                :disabled="!newDependencyId"
                class="btn-add-dependency"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label for="details">Implementation Details</label>
        <textarea
          id="details"
          v-model="form.details"
          placeholder="Enter implementation notes, code snippets, or specific requirements"
          class="form-textarea"
          rows="4"
        ></textarea>
      </div>

      <div class="form-actions">
        <button type="button" @click="$emit('cancel')" class="btn-secondary">Cancel</button>
        <button type="submit" class="btn-primary" :disabled="!isFormValid">
          {{ isEditing ? 'Update Subtask' : 'Create Subtask' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'SubtaskForm',
  props: {
    subtask: {
      type: Object,
      default: null
    },
    parentTask: {
      type: Object,
      required: true
    },
    allSubtasks: {
      type: Array,
      default: () => []
    }
  },
  emits: ['submit', 'cancel'],
  data() {
    return {
      form: {
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        priority: 'medium',
        status: 'todo',
        estimatedTime: '',
        order: 0,
        dependencies: [],
        details: ''
      },
      newDependencyId: ''
    }
  },
  computed: {
    ...mapState(['tasks']),
    ...mapGetters(['subtasksOf']),

    isEditing() {
      return !!this.subtask
    },

    isFormValid() {
      return this.form.title.trim().length > 0
    },

    availableSubtasks() {
      // Get all subtasks of the same parent, excluding the current one being edited
      return this.allSubtasks.filter(
        subtask =>
          subtask.parentTask === this.parentTask.id &&
          (!this.subtask || subtask.id !== this.subtask.id)
      )
    }
  },
  watch: {
    subtask: {
      immediate: true,
      handler(newSubtask) {
        if (newSubtask) {
          this.form = {
            title: newSubtask.title || '',
            description: newSubtask.description || '',
            startDate: newSubtask.startDate || '',
            endDate: newSubtask.endDate || '',
            priority: newSubtask.priority || 'medium',
            status: newSubtask.status || 'todo',
            estimatedTime: newSubtask.estimatedTime || '',
            order: newSubtask.order || 0,
            dependencies: [...(newSubtask.dependencies || [])],
            details: newSubtask.details || ''
          }
        } else {
          this.resetForm()
        }
      }
    }
  },
  methods: {
    resetForm() {
      this.form = {
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        priority: 'medium',
        status: 'todo',
        estimatedTime: '',
        order: this.allSubtasks.length,
        dependencies: [],
        details: ''
      }
      this.newDependencyId = ''
    },

    handleSubmit() {
      if (!this.isFormValid) return

      // Set default dates if not provided
      const today = new Date().toISOString().split('T')[0]
      const oneWeekLater = new Date()
      oneWeekLater.setDate(oneWeekLater.getDate() + 7)
      const defaultEndDate = oneWeekLater.toISOString().split('T')[0]

      const subtaskData = {
        ...this.form,
        parentTask: this.parentTask.id,
        projectId: this.parentTask.projectId,
        // Ensure required fields have default values
        startDate: this.form.startDate || today,
        endDate: this.form.endDate || defaultEndDate,
        status: this.form.status || 'todo' // Use 'todo' instead of 'pending'
      }

      if (this.isEditing) {
        subtaskData.id = this.subtask.id
      }

      this.$emit('submit', subtaskData)
    },

    addDependency() {
      if (this.newDependencyId && !this.form.dependencies.includes(this.newDependencyId)) {
        this.form.dependencies.push(this.newDependencyId)
        this.newDependencyId = ''
      }
    },

    removeDependency(index) {
      this.form.dependencies.splice(index, 1)
    },

    getSubtaskTitle(subtaskId) {
      const subtask = this.allSubtasks.find(s => s.id === subtaskId)
      return subtask ? subtask.title : 'Unknown Subtask'
    }
  }
}
</script>

<style scoped>
.subtask-form {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.subtask-form h3 {
  margin: 0 0 24px 0;
  color: #2c3e50;
  font-size: 1.25rem;
  font-weight: 600;
}

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 60px;
}

.dependencies-section {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 16px;
  background: #f9fafb;
}

.no-dependencies {
  color: #6b7280;
  font-style: italic;
  text-align: center;
  padding: 12px;
}

.current-dependencies h4,
.add-dependency h4 {
  margin: 0 0 12px 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.dependency-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  margin-bottom: 8px;
}

.dependency-text {
  font-size: 0.875rem;
  color: #374151;
}

.remove-dependency {
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  transition: background-color 0.2s;
}

.remove-dependency:hover {
  background: #dc2626;
}

.add-dependency {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.dependency-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

.dependency-controls .form-select {
  flex: 1;
  margin-bottom: 0;
}

.btn-add-dependency {
  background: #10b981;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.btn-add-dependency:hover:not(:disabled) {
  background: #059669;
}

.btn-add-dependency:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.btn-secondary,
.btn-primary {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .dependency-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-add-dependency {
    margin-top: 8px;
  }
}
</style>
