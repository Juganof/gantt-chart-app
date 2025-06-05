<!--
  ListView.vue - Task List View Component
  
  Features:
  - Tabular task display with customizable columns
  - Sorting by various fields (date, priority, status, title)
  - Filtering by status, priority, and date ranges
  - Column show/hide functionality with localStorage persistence
  - Responsive design for mobile devices
  - Task selection and editing capabilities
-->
<template>
  <div class="list-view">
    <!-- Controls -->
    <div class="list-controls">
      <div class="view-options">
        <div class="sort-controls">
          <label class="control-label">Sort by:</label>
          <select v-model="sortBy" @change="applySorting" class="control-select">
            <option value="title">Title</option>
            <option value="startDate">Start Date</option>
            <option value="endDate">End Date</option>
            <option value="priority">Priority</option>
            <option value="status">Status</option>
            <option value="duration">Duration</option>
          </select>
          <button
            @click="toggleSortOrder"
            class="sort-order-btn"
            :title="sortOrder === 'asc' ? 'Sort Descending' : 'Sort Ascending'"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path v-if="sortOrder === 'asc'" d="M12 5v14M5 12l7-7 7 7" />
              <path v-else d="M12 19V5M5 12l7 7 7-7" />
            </svg>
          </button>
        </div>

        <div class="column-controls">
          <label class="control-label">Columns:</label>
          <div class="column-toggles">
            <label v-for="column in availableColumns" :key="column.key" class="column-toggle">
              <input
                type="checkbox"
                v-model="visibleColumns"
                :value="column.key"
                @change="saveColumnPreferences"
              />
              <span>{{ column.label }}</span>
            </label>
          </div>
        </div>

        <div class="filter-controls">
          <div class="filter-group">
            <label class="control-label">Status:</label>
            <select v-model="statusFilter" @change="applyFilters" class="control-select">
              <option value="all">All Status</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="on-hold">On Hold</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div class="filter-group">
            <label class="control-label">Priority:</label>
            <select v-model="priorityFilter" @change="applyFilters" class="control-select">
              <option value="all">All Priority</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <button @click="clearAllFilters" class="clear-btn">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            Clear
          </button>
        </div>
      </div>
    </div>

    <!-- Task Table -->
    <div class="table-container">
      <table class="task-table">
        <thead>
          <tr>
            <th
              v-if="visibleColumns.includes('title')"
              class="sortable"
              @click="setSortBy('title')"
            >
              <span class="header-content">
                Title
                <svg
                  v-if="sortBy === 'title'"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  class="sort-icon"
                >
                  <path v-if="sortOrder === 'asc'" d="M12 5v14M5 12l7-7 7 7" />
                  <path v-else d="M12 19V5M5 12l7 7 7-7" />
                </svg>
              </span>
            </th>
            <th
              v-if="visibleColumns.includes('status')"
              class="sortable"
              @click="setSortBy('status')"
            >
              <span class="header-content">
                Status
                <svg
                  v-if="sortBy === 'status'"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  class="sort-icon"
                >
                  <path v-if="sortOrder === 'asc'" d="M12 5v14M5 12l7-7 7 7" />
                  <path v-else d="M12 19V5M5 12l7 7 7-7" />
                </svg>
              </span>
            </th>
            <th
              v-if="visibleColumns.includes('priority')"
              class="sortable"
              @click="setSortBy('priority')"
            >
              <span class="header-content">
                Priority
                <svg
                  v-if="sortBy === 'priority'"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  class="sort-icon"
                >
                  <path v-if="sortOrder === 'asc'" d="M12 5v14M5 12l7-7 7 7" />
                  <path v-else d="M12 19V5M5 12l7 7 7-7" />
                </svg>
              </span>
            </th>
            <th
              v-if="visibleColumns.includes('startDate')"
              class="sortable"
              @click="setSortBy('startDate')"
            >
              <span class="header-content">
                Start Date
                <svg
                  v-if="sortBy === 'startDate'"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  class="sort-icon"
                >
                  <path v-if="sortOrder === 'asc'" d="M12 5v14M5 12l7-7 7 7" />
                  <path v-else d="M12 19V5M5 12l7 7 7-7" />
                </svg>
              </span>
            </th>
            <th
              v-if="visibleColumns.includes('endDate')"
              class="sortable"
              @click="setSortBy('endDate')"
            >
              <span class="header-content">
                End Date
                <svg
                  v-if="sortBy === 'endDate'"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  class="sort-icon"
                >
                  <path v-if="sortOrder === 'asc'" d="M12 5v14M5 12l7-7 7 7" />
                  <path v-else d="M12 19V5M5 12l7 7 7-7" />
                </svg>
              </span>
            </th>
            <th
              v-if="visibleColumns.includes('duration')"
              class="sortable"
              @click="setSortBy('duration')"
            >
              <span class="header-content">
                Duration
                <svg
                  v-if="sortBy === 'duration'"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  class="sort-icon"
                >
                  <path v-if="sortOrder === 'asc'" d="M12 5v14M5 12l7-7 7 7" />
                  <path v-else d="M12 19V5M5 12l7 7 7-7" />
                </svg>
              </span>
            </th>
            <th
              v-if="visibleColumns.includes('progress')"
              class="sortable"
              @click="setSortBy('progress')"
            >
              <span class="header-content">
                Progress
                <svg
                  v-if="sortBy === 'progress'"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  class="sort-icon"
                >
                  <path v-if="sortOrder === 'asc'" d="M12 5v14M5 12l7-7 7 7" />
                  <path v-else d="M12 19V5M5 12l7 7 7-7" />
                </svg>
              </span>
            </th>
            <th class="actions-column">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="task in filteredAndSortedTasks"
            :key="task.id"
            class="task-row"
            :class="{
              selected: selectedTaskId === task.id,
              overdue: isTaskOverdue(task),
              completed: task.status === 'completed'
            }"
            @click="selectTask(task.id)"
          >
            <td v-if="visibleColumns.includes('title')" class="title-cell">
              <div class="task-title">{{ task.title }}</div>
              <div v-if="task.description" class="task-description">{{ task.description }}</div>
            </td>
            <td v-if="visibleColumns.includes('status')" class="status-cell">
              <span class="status-badge" :class="task.status">{{ formatStatus(task.status) }}</span>
            </td>
            <td v-if="visibleColumns.includes('priority')" class="priority-cell">
              <span class="priority-badge" :class="'priority-' + task.priority">{{
                formatPriority(task.priority)
              }}</span>
            </td>
            <td v-if="visibleColumns.includes('startDate')" class="date-cell">
              {{ formatDate(task.startDate) }}
            </td>
            <td v-if="visibleColumns.includes('endDate')" class="date-cell">
              {{ formatDate(task.endDate) }}
              <span v-if="isTaskOverdue(task)" class="overdue-indicator">⚠️</span>
            </td>
            <td v-if="visibleColumns.includes('duration')" class="duration-cell">
              {{ getTaskDuration(task) }}
            </td>
            <td v-if="visibleColumns.includes('progress')" class="progress-cell">
              <div class="progress-bar-container">
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    :style="{ width: getTaskProgress(task) + '%' }"
                    :class="task.status"
                  ></div>
                </div>
                <span class="progress-text">{{ getTaskProgress(task) }}%</span>
              </div>
            </td>
            <td class="actions-cell">
              <button @click.stop="editTask(task)" class="action-btn edit-btn" title="Edit Task">
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
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="filteredAndSortedTasks.length === 0" class="empty-state">
        <p>No tasks match the current filters.</p>
        <button @click="clearAllFilters" class="clear-btn">Clear Filters</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ListView',
  props: {
    tasks: {
      type: Array,
      default: () => []
    },
    selectedTaskId: {
      type: String,
      default: null
    }
  },
  emits: ['task-select', 'task-edit'],
  computed: {
    filteredAndSortedTasks() {
      let filtered = this.tasks.filter(task => {
        // Status filter
        if (this.statusFilter !== 'all' && task.status !== this.statusFilter) {
          return false
        }

        // Priority filter
        if (this.priorityFilter !== 'all' && task.priority !== this.priorityFilter) {
          return false
        }

        return true
      })

      // Apply sorting
      return filtered.sort((a, b) => {
        let aValue = this.getSortValue(a, this.sortBy)
        let bValue = this.getSortValue(b, this.sortBy)

        if (aValue < bValue) return this.sortOrder === 'asc' ? -1 : 1
        if (aValue > bValue) return this.sortOrder === 'asc' ? 1 : -1
        return 0
      })
    }
  },
  data() {
    return {
      sortBy: 'startDate',
      sortOrder: 'asc',
      statusFilter: 'all',
      priorityFilter: 'all',
      visibleColumns: [
        'title',
        'status',
        'priority',
        'startDate',
        'endDate',
        'duration',
        'progress'
      ],
      availableColumns: [
        { key: 'title', label: 'Title' },
        { key: 'status', label: 'Status' },
        { key: 'priority', label: 'Priority' },
        { key: 'startDate', label: 'Start Date' },
        { key: 'endDate', label: 'End Date' },
        { key: 'duration', label: 'Duration' },
        { key: 'progress', label: 'Progress' }
      ]
    }
  },
  methods: {
    selectTask(taskId) {
      this.$emit('task-select', taskId)
    },
    editTask(task) {
      this.$emit('task-edit', task)
    },
    setSortBy(field) {
      if (this.sortBy === field) {
        this.toggleSortOrder()
      } else {
        this.sortBy = field
        this.sortOrder = 'asc'
      }
      this.applySorting()
    },
    toggleSortOrder() {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
      this.applySorting()
    },
    applySorting() {
      // Trigger reactivity
      this.$nextTick()
    },
    getSortValue(task, field) {
      switch (field) {
        case 'title':
          return task.title.toLowerCase()
        case 'status':
          return task.status
        case 'priority':
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
          return priorityOrder[task.priority] || 0
        case 'startDate':
          return new Date(task.startDate)
        case 'endDate':
          return new Date(task.endDate)
        case 'duration':
          return this.getTaskDurationDays(task)
        case 'progress':
          return this.getTaskProgress(task)
        default:
          return ''
      }
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
    formatPriority(priority) {
      return priority.charAt(0).toUpperCase() + priority.slice(1)
    },
    formatDate(dateString) {
      if (!dateString) return ''
      return new Date(dateString).toLocaleDateString()
    },
    getTaskDuration(task) {
      if (!task.startDate || !task.endDate) return ''
      const start = new Date(task.startDate)
      const end = new Date(task.endDate)
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
      return days === 1 ? '1 day' : `${days} days`
    },
    getTaskDurationDays(task) {
      if (!task.startDate || !task.endDate) return 0
      const start = new Date(task.startDate)
      const end = new Date(task.endDate)
      return Math.ceil((end - start) / (1000 * 60 * 60 * 24))
    },
    getTaskProgress(task) {
      if (task.status === 'completed') return 100
      if (task.status === 'todo') return 0
      if (task.status === 'cancelled') return 0

      const now = new Date()
      const start = new Date(task.startDate)
      const end = new Date(task.endDate)

      if (now <= start) return 0
      if (now >= end) return 100

      const totalDuration = end - start
      const elapsed = now - start
      return Math.round((elapsed / totalDuration) * 100)
    },
    isTaskOverdue(task) {
      if (task.status === 'completed') return false
      const today = new Date()
      const taskEnd = new Date(task.endDate)
      return taskEnd < today
    },
    applyFilters() {
      this.$nextTick()
    },
    clearAllFilters() {
      this.statusFilter = 'all'
      this.priorityFilter = 'all'
      this.$nextTick()
    },
    saveColumnPreferences() {
      localStorage.setItem('listview-columns', JSON.stringify(this.visibleColumns))
    },
    loadColumnPreferences() {
      const saved = localStorage.getItem('listview-columns')
      if (saved) {
        try {
          this.visibleColumns = JSON.parse(saved)
        } catch (e) {
          console.warn('Could not load column preferences:', e)
        }
      }
    },
    getSortDirection(field) {
      if (this.sortBy === field) {
        return this.sortOrder === 'asc' ? 'ascending' : 'descending'
      }
      return 'none'
    }
  },
  watch: {
    // Watch for tasks prop changes (when switching projects)
    tasks: {
      handler(newTasks, oldTasks) {
        // When tasks change significantly (project switch), reset filters
        if (!oldTasks || newTasks.length !== oldTasks.length) {
          console.log('Tasks changed in ListView, resetting filters')

          // Reset filters to show all data for the new project
          this.statusFilter = 'all'
          this.priorityFilter = 'all'

          // Keep sort preferences as they are user-specific
          // this.sortBy = 'startDate'
          // this.sortOrder = 'asc'

          // Force reactivity update
          this.$nextTick(() => {
            this.applyFilters()
          })
        }
      },
      immediate: false
    }
  },
  mounted() {
    this.loadColumnPreferences()
  }
}
</script>

<style scoped>
.list-view {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.list-controls {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
}

.view-options {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  align-items: flex-start;
}

.sort-controls,
.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.column-controls {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.column-toggles {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.column-toggle {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  cursor: pointer;
}

.column-toggle input[type='checkbox'] {
  margin: 0;
}

.filter-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.control-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #495057;
  white-space: nowrap;
}

.control-select {
  padding: 0.375rem 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background: white;
  font-size: 0.875rem;
  cursor: pointer;
  min-width: 120px;
}

.control-select:focus {
  border-color: #007bff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.sort-order-btn,
.clear-btn,
.action-btn {
  padding: 0.375rem 0.75rem;
  border: 1px solid #ced4da;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.sort-order-btn:hover,
.clear-btn:hover,
.action-btn:hover {
  background: #e9ecef;
}

.clear-btn {
  border-color: #dc3545;
  color: #dc3545;
}

.clear-btn:hover {
  background: #dc3545;
  color: white;
}

.table-container {
  overflow-x: auto;
  max-height: 70vh;
  overflow-y: auto;
}

.task-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  table-layout: fixed;
}

.task-table th,
.task-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
  vertical-align: middle;
  word-wrap: break-word;
  overflow: hidden;
}

.task-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #495057;
  position: sticky;
  top: 0;
  z-index: 10;
}

.task-table th.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
  position: relative;
}

.task-table th.sortable .header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.task-table th.sortable .sort-icon {
  flex-shrink: 0;
  margin-left: 0.5rem;
}

.task-table th.sortable:hover {
  background: #e9ecef;
}

.task-row {
  cursor: pointer;
  transition: background-color 0.2s;
}

.task-row:hover {
  background: #f8f9fa;
}

.task-row.selected {
  background: #e3f2fd;
}

.task-row.overdue {
  background: #fff5f5;
}

.task-row.overdue:hover {
  background: #fed7d7;
}

.task-row.completed {
  opacity: 0.7;
}

.title-cell {
  min-width: 200px;
  width: 25%;
}

.status-cell {
  width: 12%;
  min-width: 100px;
}

.priority-cell {
  width: 10%;
  min-width: 80px;
}

.date-cell {
  width: 12%;
  min-width: 100px;
  white-space: nowrap;
}

.duration-cell {
  width: 10%;
  min-width: 80px;
}

.progress-cell {
  width: 15%;
  min-width: 120px;
}

.actions-column {
  width: 80px;
  min-width: 80px;
}

.actions-cell {
  white-space: nowrap;
}

.task-title {
  font-weight: 500;
  color: #495057;
  margin-bottom: 0.25rem;
}

.task-description {
  font-size: 0.8rem;
  color: #6c757d;
  line-height: 1.3;
}

.status-badge,
.priority-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 3px;
  font-weight: 500;
  font-size: 0.75rem;
  text-transform: uppercase;
  white-space: nowrap;
}

.status-badge.todo {
  background: #e2e3e5;
  color: #383d41;
}

.status-badge.in-progress {
  background: #cce7ff;
  color: #004085;
}

.status-badge.completed {
  background: #d4edda;
  color: #155724;
}

.status-badge.on-hold {
  background: #fff3cd;
  color: #856404;
}

.status-badge.cancelled {
  background: #f8d7da;
  color: #721c24;
}

.priority-badge.priority-low {
  background: #d4edda;
  color: #155724;
}

.priority-badge.priority-medium {
  background: #fff3cd;
  color: #856404;
}

.priority-badge.priority-high {
  background: #ffeaa7;
  color: #975a16;
}

.priority-badge.priority-critical {
  background: #f8d7da;
  color: #721c24;
}

.overdue-indicator {
  margin-left: 0.5rem;
  color: #dc3545;
}

.progress-bar-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-fill.todo {
  background: #6c757d;
}

.progress-fill.in-progress {
  background: #007bff;
}

.progress-fill.completed {
  background: #28a745;
}

.progress-text {
  font-size: 0.8rem;
  color: #6c757d;
  min-width: 35px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .view-options {
    flex-direction: column;
    gap: 1rem;
  }

  .column-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .column-toggles {
    gap: 0.5rem;
  }

  .filter-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  .task-table {
    font-size: 0.8rem;
  }

  .task-table th,
  .task-table td {
    padding: 0.5rem;
  }

  .title-cell {
    min-width: 150px;
    width: 30%;
  }

  .status-cell,
  .priority-cell {
    width: 15%;
    min-width: 80px;
  }

  .date-cell {
    width: 18%;
    min-width: 90px;
  }

  .duration-cell {
    width: 12%;
    min-width: 70px;
  }

  .progress-cell {
    width: 20%;
    min-width: 100px;
  }
}

@media (max-width: 576px) {
  .list-controls {
    padding: 1rem;
  }

  .column-toggles {
    flex-direction: column;
  }

  .table-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .task-table {
    min-width: 600px; /* Ensure horizontal scroll on very small screens */
  }

  .task-table th,
  .task-table td {
    padding: 0.375rem;
    font-size: 0.75rem;
  }

  .title-cell {
    min-width: 120px;
  }

  .status-cell,
  .priority-cell {
    min-width: 70px;
  }

  .date-cell {
    min-width: 80px;
  }

  .duration-cell {
    min-width: 60px;
  }

  .progress-cell {
    min-width: 90px;
  }

  .actions-column {
    min-width: 60px;
  }
}
</style>
