<template>
  <div class="gantt-view">
    <div class="gantt-header">
      <div class="header-title">
        <h2>
          <span v-if="isLoading" class="loading-text">Loading project...</span>
          <span v-else-if="currentProject?.name">{{ currentProject.name }}</span>
          <span v-else>Untitled Project</span>
        </h2>
        <p v-if="!isLoading && currentProject?.description" class="project-description">
          {{ currentProject.description }}
        </p>
      </div>
      <div class="header-actions">
        <div class="task-stats" v-if="!isLoading">
          <span class="stat"> Total: {{ tasks.length }} </span>
          <span class="stat"> Completed: {{ completedTasks.length }} </span>
          <span class="stat"> In Progress: {{ inProgressTasks.length }} </span>
        </div>
        <div class="view-toggle">
          <button
            @click="currentView = 'cards'"
            :class="['view-btn', { active: currentView === 'cards' }]"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
            </svg>
            Cards
          </button>
          <button
            @click="currentView = 'views'"
            :class="['view-btn', { active: currentView === 'views' }]"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="3" y="6" width="18" height="4" rx="1"></rect>
              <rect x="6" y="14" width="12" height="4" rx="1"></rect>
            </svg>
            Views
          </button>
          <button
            @click="currentView = 'data'"
            :class="['view-btn', { active: currentView === 'data' }]"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14,2 14,8 20,8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10,9 9,9 8,9"></polyline>
            </svg>
            Data
          </button>
        </div>
        <button class="btn-primary" @click="showAddTaskModal">
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
          Add Task
        </button>
      </div>
    </div>

    <div class="gantt-content">
      <!-- Cards View -->
      <div v-if="currentView === 'cards'">
        <div v-if="tasks.length === 0" class="placeholder">
          <div class="placeholder-content">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <h3>No tasks yet</h3>
            <p>Create your first task to start planning your project timeline</p>
            <button class="btn-primary" @click="showAddTaskModal">Create First Task</button>
          </div>
        </div>

        <div v-else class="task-grid">
          <TaskCard
            v-for="task in sortedTasks"
            :key="task.id"
            :task="task"
            @edit="editTask"
            @delete="confirmDeleteTask"
            @add-subtask="addSubtaskToParent"
          />
        </div>
      </div>

      <!-- Views (Timeline/List/Calendar) -->
      <div v-else-if="currentView === 'views'">
        <ViewSwitcher
          :tasks="tasks"
          :selected-task-id="selectedTaskId"
          @task-select="selectTask"
          @task-edit="editTask"
          @task-update="handleTaskUpdate"
          @task-update-preview="handleTaskUpdatePreview"
          @task-drag-cancelled="handleTaskDragCancelled"
          @date-select="handleDateSelect"
          @view-change="handleViewChange"
        />
      </div>

      <!-- Data Management View -->
      <div v-else-if="currentView === 'data'">
        <DataManager @import-success="handleImportSuccess" />
      </div>
    </div>

    <!-- Add/Edit Task Modal -->
    <div v-if="showTaskModal" class="modal-overlay" @click="closeTaskModal">
      <div class="modal" @click.stop>
        <TaskForm
          :task="editingTask"
          :allTasks="tasks"
          @submit="handleTaskSubmit"
          @cancel="closeTaskModal"
        />
      </div>
    </div>

    <!-- Subtask Modal -->
    <SubtaskModal
      :is-visible="showSubtaskModal"
      :parent-task="parentTaskForSubtask"
      @close="closeSubtaskModal"
      @cancel="closeSubtaskModal"
      @success="handleSubtaskSuccess"
    />

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
      <div class="modal modal-small" @click.stop>
        <div class="delete-confirmation">
          <div class="delete-icon">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </div>
          <h3>Delete Task</h3>
          <p>
            Are you sure you want to delete "{{ taskToDelete?.title }}"? This action cannot be
            undone.
          </p>
          <div class="delete-actions">
            <button @click="closeDeleteModal" class="btn-secondary">Cancel</button>
            <button @click="deleteTask" class="btn-danger">Delete Task</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Notification Toast -->
    <div v-if="notification.show" class="notification-toast" :class="notification.type">
      <p>{{ notification.message }}</p>
      <button class="close-btn" @click="notification.show = false">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <line x1="6" y1="6" x2="18" y2="18"></line>
          <line x1="18" y1="6" x2="6" y2="18"></line>
        </svg>
      </button>
    </div>
  </div>
</template>

<script>
import { GanttChart } from '@/components/charts'
import ViewSwitcher from '@/components/charts/ViewSwitcher.vue'
import { TaskForm } from '@/components/forms'
import { DataManager } from '@/components/management'
import { SubtaskModal } from '@/components/modals'
import { TaskCard } from '@/components/ui'
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'GanttView',
  components: {
    TaskForm,
    TaskCard,
    GanttChart,
    DataManager,
    ViewSwitcher,
    SubtaskModal
  },
  data() {
    return {
      currentView: this.getInitialView(), // Load from localStorage or default to views
      showTaskModal: false,
      showDeleteModal: false,
      showSubtaskModal: false,
      editingTask: null,
      taskToDelete: null,
      selectedTaskId: null, // Initialize as null to prevent blue highlighting
      parentTaskForSubtask: null,
      notification: {
        show: false,
        message: '',
        type: 'success'
      }
    }
  },
  computed: {
    ...mapGetters(['allTasks']),
    ...mapState(['currentProject', 'isLoading']),
    tasks() {
      return this.allTasks
    },
    sortedTasks() {
      return [...this.tasks].sort((a, b) => {
        // Sort by status priority (todo, in-progress, completed, etc.)
        const statusPriority = {
          'in-progress': 0,
          todo: 1,
          'on-hold': 2,
          completed: 3,
          cancelled: 4
        }

        const aStatus = statusPriority[a.status] ?? 5
        const bStatus = statusPriority[b.status] ?? 5

        if (aStatus !== bStatus) {
          return aStatus - bStatus
        }

        // Then by priority
        const priorityOrder = {
          critical: 0,
          high: 1,
          medium: 2,
          low: 3
        }

        const aPriority = priorityOrder[a.priority] ?? 4
        const bPriority = priorityOrder[b.priority] ?? 4

        if (aPriority !== bPriority) {
          return aPriority - bPriority
        }

        // Finally by start date
        return new Date(a.startDate || a.created) - new Date(b.startDate || b.created)
      })
    },
    completedTasks() {
      return this.tasks.filter(task => task.status === 'completed')
    },
    inProgressTasks() {
      return this.tasks.filter(task => task.status === 'in-progress')
    }
  },
  watch: {
    // Watch for project changes and update the view accordingly
    currentProject: {
      handler(newProject, oldProject) {
        if (newProject && oldProject && newProject.id !== oldProject.id) {
          console.log(`Project changed from ${oldProject.name} to ${newProject.name}`)
          // Clear selected task when switching projects
          this.selectedTaskId = null
          // Force component update
          this.$nextTick(() => {
            this.$forceUpdate()
          })
        }
      },
      immediate: false
    },

    // Watch for task changes
    tasks: {
      handler(newTasks, oldTasks) {
        // If tasks change significantly (like when loading a new project), clear selection
        if (oldTasks && newTasks.length !== oldTasks.length) {
          this.selectedTaskId = null
        }
      },
      immediate: false
    },

    // Watch for view changes and save to localStorage
    currentView: {
      handler(newView) {
        if (newView) {
          localStorage.setItem('gantt-view-preference', newView)
        }
      },
      immediate: false
    }
  },
  mounted() {
    // Remove the old loadFromLocalStorage call since we're now in multi-project mode
    // Project data should already be loaded by the store when switching projects
    console.log('GanttView mounted for project:', this.currentProject?.name)

    // Safety check: If no project is available after mounting, redirect to home
    this.$nextTick(async () => {
      // Wait a bit for any async loading to complete
      await new Promise(resolve => setTimeout(resolve, 100))

      if (!this.isLoading && !this.currentProject && this.$store.state.projects.length === 0) {
        console.warn('No project available in GanttView, redirecting to home')
        this.$router.push({ name: 'Home' })
      }
    })
  },
  methods: {
    selectTask(taskId) {
      this.selectedTaskId = taskId
    },
    showAddTaskModal() {
      this.editingTask = null
      this.showTaskModal = true
    },
    editTask(task) {
      this.editingTask = task
      this.showTaskModal = true
    },
    closeTaskModal() {
      this.showTaskModal = false
      this.editingTask = null
    },
    confirmDeleteTask(taskId) {
      this.taskToDelete = this.tasks.find(task => task.id === taskId)
      this.showDeleteModal = true
    },
    closeDeleteModal() {
      this.showDeleteModal = false
      this.taskToDelete = null
    },
    async handleTaskSubmit(taskData) {
      try {
        if (this.editingTask) {
          // Update existing task
          await this.$store.dispatch('updateTask', {
            id: this.editingTask.id,
            updates: taskData.updates || taskData
          })
          this.showNotification('Task updated successfully')
        } else {
          // Create new task
          await this.$store.dispatch('addTask', taskData)
          this.showNotification('Task created successfully')
        }
        this.closeTaskModal()
      } catch (error) {
        console.error('Error saving task:', error)
        this.showNotification('Error saving task: ' + error.message, 'error')
      }
    },
    async deleteTask() {
      try {
        await this.$store.dispatch('deleteTask', this.taskToDelete.id)
        this.showNotification('Task deleted successfully')
        this.closeDeleteModal()
      } catch (error) {
        console.error('Error deleting task:', error)
        this.showNotification('Error deleting task: ' + error.message, 'error')
      }
    },
    // Drag and Drop handlers
    async handleTaskUpdate({ id, updates }) {
      try {
        console.log('handleTaskUpdate called:', { id, updates, idType: typeof id })
        
        const task = this.tasks.find(t => t.id === id)
        if (!task) {
          throw new Error(`Task with ID ${id} not found in tasks array`)
        }
        
        console.log('Updating task via store:', task.title, updates)
        
        await this.$store.dispatch('updateTask', {
          id,
          updates
        })

        // Show success notification
        this.showNotification(`Task "${task.title}" updated successfully`, 'success')
        console.log('Task updated successfully')
      } catch (error) {
        console.error('Error updating task:', error)
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          taskId: id,
          updates,
          tasksCount: this.tasks.length
        })
        this.showNotification(`Failed to update task: ${error.message}`, 'error')
      }
    },

    handleTaskUpdatePreview(event) {
      // Handle task update preview (during drag)
      console.log('Task update preview:', event)
    },

    handleTaskDragCancelled() {
      // Handle when a task drag operation is cancelled
      console.log('Task drag cancelled')
    },

    handleDateSelect(date) {
      // Handle when a date is selected in calendar view
      console.log('Date selected:', date)
      // Could open task creation modal for this date
    },

    handleViewChange(newView) {
      // Handle when the view changes within the ViewSwitcher
      console.log('View changed to:', newView)
      // Could save preference or update analytics
    },

    showNotification(message, type = 'success') {
      this.notification.message = message
      this.notification.type = type
      this.notification.show = true

      // Auto-hide notification after 3 seconds
      setTimeout(() => {
        this.notification.show = false
      }, 3000)
    },

    handleImportSuccess() {
      this.showNotification('Project data imported successfully!', 'success')
      // Optionally switch back to views view to show the imported data
      this.currentView = 'views'
    },
    addSubtaskToParent(parentTask) {
      // Open the task form with parent information
      this.parentTaskForSubtask = parentTask
      this.showSubtaskModal = true
    },
    closeSubtaskModal() {
      this.showSubtaskModal = false
      this.parentTaskForSubtask = null
    },
    handleSubtaskSuccess() {
      // Handle success from subtask modal
      this.showNotification('Subtask added successfully', 'success')
    },
    getInitialView() {
      // Get saved view preference from localStorage
      const savedView = localStorage.getItem('gantt-view-preference')
      
      // Validate that the saved view is one of the allowed values
      const allowedViews = ['cards', 'views', 'data']
      
      if (savedView && allowedViews.includes(savedView)) {
        return savedView
      }
      
      // Default to 'views' if no valid saved preference exists
      return 'views'
    }
  }
}
</script>

<style scoped>
.gantt-view {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.gantt-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e9ecef;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.header-title h2 {
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  font-size: 1.75rem;
  font-weight: 600;
}

.loading-text {
  color: #6c757d;
  font-style: italic;
  opacity: 0.8;
}

.project-description {
  color: #6c757d;
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.4;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.task-stats {
  display: flex;
  gap: 1rem;
}

.stat {
  font-size: 0.875rem;
  color: #6c757d;
  font-weight: 500;
}

.view-toggle {
  display: flex;
  gap: 0.25rem;
  background: #e9ecef;
  border-radius: 6px;
  padding: 0.25rem;
}

.view-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  color: #6c757d;
  transition: all 0.2s;
}

.view-btn:hover {
  background: #dee2e6;
  color: #495057;
}

.view-btn.active {
  background: white;
  color: #007bff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.btn-primary {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background: #0056b3;
}

.gantt-content > div:first-child {
  padding: 2rem; /* Add padding only for cards view */
}

.gantt-content .gantt-chart {
  padding: 0; /* No padding for timeline view */
}

.placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.placeholder-content {
  text-align: center;
  max-width: 400px;
}

.placeholder-content svg {
  color: #6c757d;
  margin-bottom: 1rem;
}

.placeholder-content h3 {
  color: #495057;
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
}

.placeholder-content p {
  color: #6c757d;
  margin: 0 0 2rem 0;
  line-height: 1.5;
}

.task-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

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
  padding: 2rem;
}

.modal {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-small {
  max-width: 400px;
}

.delete-confirmation {
  padding: 2rem;
  text-align: center;
}

.delete-icon {
  margin-bottom: 1rem;
}

.delete-icon svg {
  color: #dc3545;
}

.delete-confirmation h3 {
  margin: 0 0 1rem 0;
  color: #495057;
}

.delete-confirmation p {
  margin: 0 0 2rem 0;
  color: #6c757d;
  line-height: 1.5;
}

.delete-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-secondary,
.btn-danger {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

.notification-toast {
  position: fixed;
  top: 1rem;
  right: 1rem;
  background: #28a745;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 1100;
  transition: opacity 0.3s;
}

.notification-toast.error {
  background: #dc3545;
}

.close-btn {
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  padding: 0;
  line-height: 1;
}

@media (max-width: 768px) {
  .gantt-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .header-actions {
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .task-grid {
    grid-template-columns: 1fr;
  }

  .modal-overlay {
    padding: 1rem;
  }
}
</style>
