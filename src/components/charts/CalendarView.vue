<!--
  CalendarView.vue - Task Calendar View Component
  
  Features:
  - Monthly calendar view with task visualization
  - Task events displayed on appropriate dates
  - Navigation between months
  - Task creation by clicking on dates
  - Task details on hover/click
  - Multi-day task spans
  - Responsive design
-->
<template>
  <div class="calendar-view">
    <!-- Calendar Header -->
    <div class="calendar-header">
      <div class="month-navigation">
        <button @click="previousMonth" class="nav-btn">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="15,18 9,12 15,6"></polyline>
          </svg>
        </button>

        <h2 class="month-title">{{ currentMonthName }} {{ currentYear }}</h2>

        <button @click="nextMonth" class="nav-btn">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="9,18 15,12 9,6"></polyline>
          </svg>
        </button>
      </div>

      <div class="calendar-controls">
        <button @click="goToToday" class="today-btn">Today</button>
        <div class="view-options">
          <label class="control-label">Filter:</label>
          <select v-model="statusFilter" @change="applyFilters" class="control-select">
            <option value="all">All Status</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="on-hold">On Hold</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="calendar-grid">
      <!-- Weekday Headers -->
      <div class="weekday-headers">
        <div v-for="day in weekDays" :key="day" class="weekday-header">
          {{ day }}
        </div>
      </div>

      <!-- Calendar Days -->
      <div class="calendar-days">
        <div
          v-for="date in calendarDates"
          :key="date.key"
          class="calendar-day"
          :class="{
            'other-month': !date.isCurrentMonth,
            today: date.isToday,
            selected: date.isSelected,
            'has-tasks': date.tasks.length > 0
          }"
          @click="selectDate(date)"
        >
          <div class="day-number">{{ date.day }}</div>

          <!-- Task Events -->
          <div class="day-tasks">
            <div
              v-for="task in date.visibleTasks"
              :key="task.id"
              class="task-event"
              :class="[
                'priority-' + task.priority,
                'status-' + task.status,
                {
                  'task-start': task.isStart,
                  'task-end': task.isEnd,
                  'task-span': task.isSpan,
                  overdue: isTaskOverdue(task)
                }
              ]"
              @click.stop="selectTask(task)"
              :title="getTaskTooltip(task)"
            >
              <span class="task-title">
                {{ task.title }}
              </span>
            </div>

            <!-- More tasks indicator -->
            <div v-if="date.hiddenTasksCount > 0" class="more-tasks">
              +{{ date.hiddenTasksCount }} more
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Task Details Modal -->
    <div v-if="selectedTask" class="task-modal-overlay" @click="closeTaskModal">
      <div class="task-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ selectedTask.title }}</h3>
          <button @click="closeTaskModal" class="close-btn">
            <svg
              width="16"
              height="16"
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
        <div class="modal-content">
          <p v-if="selectedTask.description" class="task-description">
            {{ selectedTask.description }}
          </p>
          <div class="task-details">
            <div class="detail-item">
              <strong>Status:</strong> {{ formatStatus(selectedTask.status) }}
            </div>
            <div class="detail-item">
              <strong>Priority:</strong> {{ formatPriority(selectedTask.priority) }}
            </div>
            <div class="detail-item">
              <strong>Start Date:</strong> {{ formatDate(selectedTask.startDate) }}
            </div>
            <div class="detail-item">
              <strong>End Date:</strong> {{ formatDate(selectedTask.endDate) }}
            </div>
            <div class="detail-item">
              <strong>Duration:</strong> {{ getTaskDuration(selectedTask) }}
            </div>
          </div>
          <div class="modal-actions">
            <button @click="editTask(selectedTask)" class="edit-btn">Edit Task</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CalendarView',
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
  emits: ['task-select', 'task-edit', 'date-select'],
  data() {
    return {
      currentDate: new Date(),
      selectedDate: null,
      selectedTask: null,
      statusFilter: 'all',
      weekDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      maxTasksPerDay: 3 // Limit visible tasks per day
    }
  },
  computed: {
    currentYear() {
      return this.currentDate.getFullYear()
    },
    currentMonth() {
      return this.currentDate.getMonth()
    },
    currentMonthName() {
      return this.currentDate.toLocaleDateString('en-US', { month: 'long' })
    },
    filteredTasks() {
      return this.tasks.filter(task => {
        if (this.statusFilter !== 'all' && task.status !== this.statusFilter) {
          return false
        }
        return task.startDate && task.endDate
      })
    },
    calendarDates() {
      const dates = []
      const today = new Date()
      const firstDay = new Date(this.currentYear, this.currentMonth, 1)
      const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0)

      // Start from the first Sunday of the week containing the first day
      const startDate = new Date(firstDay)
      startDate.setDate(startDate.getDate() - startDate.getDay())

      // End at the last Saturday of the week containing the last day
      const endDate = new Date(lastDay)
      endDate.setDate(endDate.getDate() + (6 - endDate.getDay()))

      const current = new Date(startDate)

      while (current <= endDate) {
        const dateKey = current.toISOString().split('T')[0]
        const isCurrentMonth = current.getMonth() === this.currentMonth
        const isToday = current.toDateString() === today.toDateString()
        const isSelected =
          this.selectedDate && current.toDateString() === this.selectedDate.toDateString()

        // Get tasks for this date
        const dayTasks = this.getTasksForDate(current)
        const visibleTasks = dayTasks.slice(0, this.maxTasksPerDay)
        const hiddenTasksCount = Math.max(0, dayTasks.length - this.maxTasksPerDay)

        dates.push({
          key: dateKey,
          date: new Date(current),
          day: current.getDate(),
          isCurrentMonth,
          isToday,
          isSelected,
          tasks: dayTasks,
          visibleTasks,
          hiddenTasksCount
        })

        current.setDate(current.getDate() + 1)
      }

      return dates
    }
  },
  methods: {
    previousMonth() {
      this.currentDate = new Date(this.currentYear, this.currentMonth - 1, 1)
    },
    nextMonth() {
      this.currentDate = new Date(this.currentYear, this.currentMonth + 1, 1)
    },
    goToToday() {
      this.currentDate = new Date()
      this.selectedDate = new Date()
    },
    selectDate(dateObj) {
      this.selectedDate = dateObj.date
      this.$emit('date-select', dateObj.date)
    },
    selectTask(task) {
      this.selectedTask = task
      this.$emit('task-select', task.id)
    },
    editTask(task) {
      this.closeTaskModal()
      this.$emit('task-edit', task)
    },
    closeTaskModal() {
      this.selectedTask = null
    },
    getTasksForDate(date) {
      const dateStr = date.toISOString().split('T')[0]
      const tasks = []

      this.filteredTasks.forEach(task => {
        const taskStart = new Date(task.startDate)
        const taskEnd = new Date(task.endDate)

        // Normalize dates to avoid time zone issues
        const checkDate = new Date(date)
        checkDate.setHours(0, 0, 0, 0)
        taskStart.setHours(0, 0, 0, 0)
        taskEnd.setHours(0, 0, 0, 0)

        // Check if task is active on this date
        if (checkDate >= taskStart && checkDate <= taskEnd) {
          const isStart = checkDate.getTime() === taskStart.getTime()
          const isEnd = checkDate.getTime() === taskEnd.getTime()
          const isSpan = !isStart && !isEnd

          tasks.push({
            ...task,
            isStart,
            isEnd,
            isSpan
          })
        }
      })

      // Sort tasks by priority and start date
      return tasks.sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
        const aPriority = priorityOrder[a.priority] || 0
        const bPriority = priorityOrder[b.priority] || 0

        if (aPriority !== bPriority) {
          return bPriority - aPriority // Higher priority first
        }

        return new Date(a.startDate) - new Date(b.startDate)
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
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
      return days === 1 ? '1 day' : `${days} days`
    },
    getTaskTooltip(task) {
      const start = this.formatDate(task.startDate)
      const end = this.formatDate(task.endDate)
      return `${task.title}\n${start} - ${end}\nStatus: ${this.formatStatus(task.status)}\nPriority: ${this.formatPriority(task.priority)}`
    },
    isTaskOverdue(task) {
      if (task.status === 'completed') return false
      const today = new Date()
      const taskEnd = new Date(task.endDate)
      today.setHours(0, 0, 0, 0)
      taskEnd.setHours(0, 0, 0, 0)
      return taskEnd < today
    },
    applyFilters() {
      this.$nextTick()
    }
  }
}
</script>

<style scoped>
.calendar-view {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
  flex-wrap: wrap;
  gap: 1rem;
}

.month-navigation {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.month-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #495057;
  margin: 0;
  min-width: 200px;
  text-align: center;
}

.calendar-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.view-options {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-btn,
.today-btn {
  padding: 0.5rem;
  border: 1px solid #ced4da;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.nav-btn:hover,
.today-btn:hover {
  background: #e9ecef;
}

.today-btn {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.control-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #495057;
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

.calendar-grid {
  padding: 1rem;
}

.weekday-headers {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  margin-bottom: 1px;
}

.weekday-header {
  padding: 0.75rem;
  text-align: center;
  font-weight: 600;
  color: #495057;
  background: #f8f9fa;
  border-radius: 4px 4px 0 0;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: #e9ecef;
  border-radius: 0 0 4px 4px;
}

.calendar-day {
  min-height: 120px;
  background: white;
  padding: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  flex-direction: column;
  position: relative;
}

.calendar-day:hover {
  background: #f8f9fa;
}

.calendar-day.other-month {
  background: #fafafa;
  color: #adb5bd;
}

.calendar-day.other-month:hover {
  background: #f1f1f1;
}

.calendar-day.today {
  background: #e3f2fd;
}

.calendar-day.today .day-number {
  background: #2196f3;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.calendar-day.selected {
  background: #fff3e0;
  border: 2px solid #ff9800;
}

.calendar-day.has-tasks {
  border-left: 3px solid #007bff;
}

.day-number {
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  align-self: flex-start;
}

.day-tasks {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
}

.task-event {
  font-size: 0.75rem;
  padding: 0.125rem 0.25rem;
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

.task-event:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.task-event.task-start {
  border-radius: 2px 0 0 2px;
  border-right: none;
}

.task-event.task-end {
  border-radius: 0 2px 2px 0;
  border-left: none;
}

.task-event.task-span {
  border-radius: 0;
  border-left: none;
  border-right: none;
}

.task-event.task-span .task-title {
  opacity: 0.7;
}

.task-event.priority-low {
  background: #d4edda;
  color: #155724;
}

.task-event.priority-medium {
  background: #fff3cd;
  color: #856404;
}

.task-event.priority-high {
  background: #ffeaa7;
  color: #975a16;
}

.task-event.priority-critical {
  background: #f8d7da;
  color: #721c24;
}

.task-event.status-completed {
  opacity: 0.6;
  text-decoration: line-through;
}

.task-event.overdue {
  background: #dc3545 !important;
  color: white;
  animation: pulse 2s infinite;
}

.more-tasks {
  font-size: 0.7rem;
  color: #6c757d;
  padding: 0.125rem 0.25rem;
  text-align: center;
  background: #f8f9fa;
  border-radius: 2px;
  cursor: pointer;
}

.more-tasks:hover {
  background: #e9ecef;
}

/* Task Modal */
.task-modal-overlay {
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
}

.task-modal {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  color: #495057;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  color: #6c757d;
}

.close-btn:hover {
  color: #495057;
}

.modal-content {
  padding: 1.5rem;
}

.task-description {
  margin-bottom: 1rem;
  color: #6c757d;
  line-height: 1.5;
}

.task-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.detail-item {
  display: flex;
  gap: 0.5rem;
}

.detail-item strong {
  min-width: 80px;
  color: #495057;
}

.modal-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.edit-btn {
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.2s;
}

.edit-btn:hover {
  background: #0056b3;
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

/* Responsive Design */
@media (max-width: 768px) {
  .calendar-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .month-navigation {
    justify-content: center;
  }

  .calendar-controls {
    justify-content: center;
  }

  .calendar-day {
    min-height: 80px;
    padding: 0.25rem;
  }

  .task-event {
    font-size: 0.7rem;
    padding: 0.0625rem 0.125rem;
  }

  .day-number {
    font-size: 0.8rem;
  }

  .weekday-header {
    padding: 0.5rem;
    font-size: 0.8rem;
  }
}

@media (max-width: 576px) {
  .calendar-grid {
    padding: 0.5rem;
  }

  .calendar-day {
    min-height: 60px;
  }

  .weekday-header {
    padding: 0.25rem;
  }
}
</style>
