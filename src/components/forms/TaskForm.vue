<template>
  <div class="task-form">
    <div class="form-header">
      <h3>{{ isEditing ? 'Edit Task' : 'Add New Task' }}</h3>
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

    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="title">Task Title *</label>
        <input
          id="title"
          v-model="form.title"
          type="text"
          required
          placeholder="Enter task title"
          class="form-input"
        />
      </div>

      <div class="form-group">
        <label for="description">Description</label>
        <textarea
          id="description"
          v-model="form.description"
          placeholder="Enter task description"
          class="form-textarea"
          rows="3"
        ></textarea>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="startDate">Start Date *</label>
          <input id="startDate" v-model="form.startDate" type="date" required class="form-input" />
        </div>

        <div class="form-group">
          <label for="endDate">End Date *</label>
          <input id="endDate" v-model="form.endDate" type="date" required class="form-input" />
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
            placeholder="e.g., 3 days, 2 weeks"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="complexity">Complexity (1-10)</label>
          <input
            id="complexity"
            v-model.number="form.complexity"
            type="number"
            min="1"
            max="10"
            class="form-input"
          />
        </div>
      </div>
      <div class="form-group">
        <label for="tags">Tags (comma-separated)</label>
        <input
          id="tags"
          v-model="tagsInput"
          type="text"
          placeholder="e.g., frontend, design, urgent"
          class="form-input"
        />
      </div>

      <!-- Dependencies Section -->
      <div class="form-group" v-if="availableTasks.length > 0">
        <label class="form-label">Task Dependencies</label>
        <div class="dependencies-section">
          <div v-if="form.dependencies.length === 0" class="no-dependencies">
            <p>This task has no dependencies</p>
          </div>

          <div v-else class="current-dependencies">
            <h4>Current Dependencies:</h4>
            <div v-for="(dep, index) in form.dependencies" :key="index" class="dependency-item">
              <span class="dependency-text">
                <strong>{{ getTaskTitle(dep.fromTaskId) }}</strong>
                must {{ formatDependencyType(dep.type) }}
                before this task can start
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
              <select v-model="newDependency.fromTaskId" class="form-select">
                <option value="">Select a task...</option>
                <option v-for="task in availableTasks" :key="task.id" :value="task.id">
                  {{ task.title }}
                </option>
              </select>

              <select v-model="newDependency.type" class="form-select">
                <option value="finish-to-start">Finish to Start</option>
                <option value="start-to-start">Start to Start</option>
                <option value="finish-to-finish">Finish to Finish</option>
                <option value="start-to-finish">Start to Finish</option>
              </select>

              <button
                type="button"
                @click="addDependency"
                :disabled="!newDependency.fromTaskId"
                class="btn-add-dependency"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button type="button" @click="$emit('cancel')" class="btn-secondary">Cancel</button>
        <button type="submit" class="btn-primary" :disabled="!isFormValid">
          {{ isEditing ? 'Update Task' : 'Create Task' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  name: 'TaskForm',
  props: {
    task: {
      type: Object,
      default: null
    },
    allTasks: {
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
        complexity: 5,
        dependencies: [],
        subtasks: []
      },
      tagsInput: '',
      newDependency: {
        fromTaskId: '',
        type: 'finish-to-start'
      }
    }
  },
  computed: {
    isEditing() {
      return !!this.task
    },
    isFormValid() {
      return (
        this.form.title.trim() &&
        this.form.startDate &&
        this.form.endDate &&
        new Date(this.form.startDate) <= new Date(this.form.endDate)
      )
    },
    availableTasks() {
      // Return all tasks except the current one being edited
      return this.allTasks
        .filter(task => !this.task || task.id !== this.task.id)
        .filter(
          task =>
            // Also exclude tasks that would create circular dependencies
            !this.wouldCreateCircularDependency(task.id)
        )
    }
  },
  watch: {
    task: {
      immediate: true,
      handler(newTask) {
        if (newTask) {
          this.populateForm(newTask)
        } else {
          this.resetForm()
        }
      }
    }
  },
  methods: {
    populateForm(task) {
      this.form = {
        title: task.title || '',
        description: task.description || '',
        startDate: task.startDate ? task.startDate.split('T')[0] : '',
        endDate: task.endDate ? task.endDate.split('T')[0] : '',
        priority: task.priority || 'medium',
        status: task.status || 'todo',
        estimatedTime: task.estimatedTime || '',
        complexity: task.complexity || 5,
        dependencies: task.dependencies || [],
        subtasks: task.subtasks || []
      }
      this.tagsInput = task.tags ? task.tags.join(', ') : ''
    },
    resetForm() {
      this.form = {
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        priority: 'medium',
        status: 'todo',
        estimatedTime: '',
        complexity: 5,
        dependencies: [],
        subtasks: []
      }
      this.tagsInput = ''
    },
    handleSubmit() {
      if (!this.isFormValid) return

      const taskData = {
        ...this.form,
        startDate: new Date(this.form.startDate).toISOString(),
        endDate: new Date(this.form.endDate).toISOString(),
        tags: this.tagsInput
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag),
        aiGenerated: false
      }

      if (this.isEditing) {
        this.$emit('submit', { id: this.task.id, updates: taskData })
      } else {
        this.$emit('submit', taskData)
      }
    },

    // Dependency Management Methods
    addDependency() {
      if (!this.newDependency.fromTaskId) return

      // Check if dependency already exists
      const exists = this.form.dependencies.some(
        dep => dep.fromTaskId === this.newDependency.fromTaskId
      )

      if (exists) {
        alert('This dependency already exists!')
        return
      }

      // Check for circular dependencies
      if (this.wouldCreateCircularDependency(this.newDependency.fromTaskId)) {
        alert('This would create a circular dependency!')
        return
      }

      this.form.dependencies.push({
        fromTaskId: this.newDependency.fromTaskId,
        type: this.newDependency.type,
        lag: 0
      })

      // Reset the form
      this.newDependency.fromTaskId = ''
      this.newDependency.type = 'finish-to-start'
    },

    removeDependency(index) {
      this.form.dependencies.splice(index, 1)
    },

    getTaskTitle(taskId) {
      const task = this.allTasks.find(t => t.id === taskId)
      return task ? task.title : 'Unknown Task'
    },

    formatDependencyType(type) {
      const typeMap = {
        'finish-to-start': 'finish',
        'start-to-start': 'start',
        'finish-to-finish': 'finish',
        'start-to-finish': 'start'
      }
      return typeMap[type] || 'finish'
    },

    wouldCreateCircularDependency(taskId) {
      // Simple circular dependency check
      // In a full implementation, this would need a more sophisticated algorithm
      if (!this.task) return false

      const currentTaskId = this.task.id
      const visited = new Set()
      const stack = [taskId]

      while (stack.length > 0) {
        const currentId = stack.pop()
        if (currentId === currentTaskId) return true
        if (visited.has(currentId)) continue

        visited.add(currentId)

        // Find dependencies of current task
        const currentTask = this.allTasks.find(t => t.id === currentId)
        if (currentTask && currentTask.dependencies) {
          currentTask.dependencies.forEach(dep => {
            stack.push(dep.fromTaskId)
          })
        }
      }

      return false
    }
  }
}
</script>

<style scoped>
.task-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  width: 100%;
}

.task-form h3 {
  margin: 0 0 1.5rem 0;
  color: #495057;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.form-header h3 {
  margin: 0;
  color: #495057;
  font-size: 1.25rem;
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
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  background: #f3f4f6;
  color: #374151;
}

.form-group {
  margin-bottom: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #495057;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
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

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

/* Dependencies Section Styles */
.dependencies-section {
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 1rem;
  background: #f8f9fa;
}

.no-dependencies {
  text-align: center;
  color: #6c757d;
  font-style: italic;
  margin: 1rem 0;
}

.current-dependencies h4,
.add-dependency h4 {
  margin: 0 0 0.75rem 0;
  font-size: 0.9rem;
  color: #495057;
  font-weight: 600;
}

.dependency-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 4px;
}

.dependency-text {
  font-size: 0.875rem;
  color: #495057;
}

.remove-dependency {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
}

.remove-dependency:hover {
  background: #c82333;
}

.dependency-controls {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 0.5rem;
  align-items: end;
}

.btn-add-dependency {
  padding: 0.5rem 1rem;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  white-space: nowrap;
}

.btn-add-dependency:hover:not(:disabled) {
  background: #218838;
}

.btn-add-dependency:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.add-dependency {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #dee2e6;
}
</style>
