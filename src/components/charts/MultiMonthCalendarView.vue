<!--
  MultiMonthCalendarView.vue - Multi-Month Calendar View Component
  
  Features:
  - Displays multiple months in a scrollable view
  - Task visualization across all visible months
  - Horizontal and vertical scrolling support
  - Month navigation with smooth scrolling
  - Task events displayed on appropriate dates
  - Responsive grid layout
  - Jump to specific months
  - Today indicator across all months
-->
<template>
  <div class="multi-month-calendar">
    <!-- Header Controls -->
    <div class="calendar-header">
      <div class="view-controls">
        <h2 class="view-title">Multi-Month Calendar</h2>
        <div class="month-navigation">
          <button @click="scrollToPreviousMonth" class="nav-btn" title="Previous Month">
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
          
          <button @click="goToToday" class="today-btn">Go to Today</button>
          
          <button @click="scrollToNextMonth" class="nav-btn" title="Next Month">
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
      </div>

      <div class="calendar-controls">
        <div class="view-options">
          <label class="control-label">Months to show:</label>
          <select v-model="monthsToShow" @change="updateMonthsDisplay" class="control-select">
            <option value="3">3 Months</option>
            <option value="4">4 Months</option>
            <option value="6">6 Months</option>
            <option value="12">12 Months</option>
          </select>
        </div>
        
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

    <!-- Scrollable Calendar Container -->
    <div class="calendar-scroll-container" ref="scrollContainer">
      <div class="months-grid" :style="{ gridTemplateColumns: `repeat(${monthsPerRow}, 1fr)` }">
        <div
          v-for="(month, index) in displayedMonths"
          :key="month.key"
          class="month-container"
          :ref="'month-' + index"
        >
          <!-- Month Header -->
          <div class="month-header">
            <h3 class="month-title">
              {{ month.name }} {{ month.year }}
            </h3>
            <div class="month-stats" v-if="month.taskCount > 0">
              {{ month.taskCount }} task{{ month.taskCount !== 1 ? 's' : '' }}
            </div>
          </div>

          <!-- Weekday Headers -->
          <div class="weekday-headers">
            <div v-for="day in weekDays" :key="day" class="weekday-header">
              {{ day }}
            </div>
          </div>

          <!-- Calendar Days for this month -->
          <div class="calendar-days">
            <div
              v-for="date in month.dates"
              :key="date.key"
              class="calendar-day"
              :class="{
                'other-month': !date.isCurrentMonth,
                'today': date.isToday,
                'selected': date.isSelected,
                'has-tasks': date.tasks.length > 0,
                'weekend': date.isWeekend
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
                      'overdue': isTaskOverdue(task)
                    }
                  ]"
                  @click.stop="selectTask(task)"
                  :title="getTaskTooltip(task)"
                >
                  {{ task.title }}
                </div>
                
                <!-- Show more tasks indicator -->
                <div
                  v-if="date.hiddenTasksCount > 0"
                  class="more-tasks"
                  @click.stop="showAllTasksForDate(date)"
                >
                  +{{ date.hiddenTasksCount }} more
                </div>
              </div>
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
          <button @click="closeTaskModal" class="modal-close">
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
            <button @click="editTask(selectedTask)" class="btn-primary">
              Edit Task
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MultiMonthCalendarView',
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
      monthsToShow: 6, // Number of months to display
      monthsPerRow: 3, // Number of months per row
      maxTasksPerDay: 3, // Maximum tasks to show per day
      statusFilter: 'all',
      selectedDate: null,
      selectedTask: null,
      currentCenterDate: new Date(), // The date around which months are centered
      weekDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    }
  },
  computed: {
    filteredTasks() {
      return this.tasks.filter(task => {
        if (this.statusFilter !== 'all' && task.status !== this.statusFilter) {
          return false
        }
        return task.startDate && task.endDate
      })
    },
    displayedMonths() {
      const months = []
      const startMonth = this.monthsToShow / 2
      
      // Calculate start date (go back half the months from center)
      const startDate = new Date(this.currentCenterDate)
      startDate.setMonth(startDate.getMonth() - Math.floor(startMonth))
      startDate.setDate(1) // Always start from the 1st of the month
      
      // Generate each month
      for (let i = 0; i < this.monthsToShow; i++) {
        const monthDate = new Date(startDate)
        monthDate.setMonth(startDate.getMonth() + i)
        
        const monthData = this.generateMonthData(monthDate)
        months.push(monthData)
      }
      
      return months
    }
  },
  mounted() {
    this.updateLayout()
    window.addEventListener('resize', this.updateLayout)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateLayout)
  },
  methods: {
    generateMonthData(monthDate) {
      const year = monthDate.getFullYear()
      const month = monthDate.getMonth()
      const today = new Date()
      
      // Get first and last day of the month
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      
      // Start from the first Sunday of the week containing the first day
      const startDate = new Date(firstDay)
      startDate.setDate(startDate.getDate() - startDate.getDay())
      
      // End at the last Saturday of the week containing the last day
      const endDate = new Date(lastDay)
      endDate.setDate(endDate.getDate() + (6 - endDate.getDay()))
      
      const dates = []
      const current = new Date(startDate)
      let taskCount = 0
      
      while (current <= endDate) {
        const dateKey = current.toISOString().split('T')[0]
        const isCurrentMonth = current.getMonth() === month
        const isToday = current.toDateString() === today.toDateString()
        const isSelected = this.selectedDate && current.toDateString() === this.selectedDate.toDateString()
        const isWeekend = current.getDay() === 0 || current.getDay() === 6
        
        // Get tasks for this date
        const dayTasks = this.getTasksForDate(current)
        const visibleTasks = dayTasks.slice(0, this.maxTasksPerDay)
        const hiddenTasksCount = Math.max(0, dayTasks.length - this.maxTasksPerDay)
        
        if (isCurrentMonth && dayTasks.length > 0) {
          taskCount += dayTasks.length
        }
        
        dates.push({
          key: dateKey,
          date: new Date(current),
          day: current.getDate(),
          isCurrentMonth,
          isToday,
          isSelected,
          isWeekend,
          tasks: dayTasks,
          visibleTasks,
          hiddenTasksCount
        })
        
        current.setDate(current.getDate() + 1)
      }
      
      return {
        key: `${year}-${month}`,
        name: monthDate.toLocaleDateString('en-US', { month: 'long' }),
        year,
        month,
        dates,
        taskCount
      }
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
        
        // Check if task spans this date
        if (taskStart <= checkDate && taskEnd >= checkDate) {
          // Determine task display type
          const isStart = taskStart.getTime() === checkDate.getTime()
          const isEnd = taskEnd.getTime() === checkDate.getTime()
          const isSpan = !isStart && !isEnd
          
          tasks.push({
            ...task,
            isStart,
            isEnd,
            isSpan
          })
        }
      })
      
      return tasks.sort((a, b) => {
        // Sort by priority (critical first)
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      })
    },
    updateMonthsDisplay() {
      this.updateLayout()
    },
    updateLayout() {
      // Responsive layout: adjust months per row based on screen size
      const containerWidth = this.$refs.scrollContainer?.clientWidth || window.innerWidth
      
      if (containerWidth < 768) {
        this.monthsPerRow = 1
      } else if (containerWidth < 1200) {
        this.monthsPerRow = 2
      } else {
        this.monthsPerRow = Math.min(3, this.monthsToShow)
      }
    },
    scrollToPreviousMonth() {
      this.currentCenterDate = new Date(this.currentCenterDate.setMonth(this.currentCenterDate.getMonth() - 1))
    },
    scrollToNextMonth() {
      this.currentCenterDate = new Date(this.currentCenterDate.setMonth(this.currentCenterDate.getMonth() + 1))
    },
    goToToday() {
      this.currentCenterDate = new Date()
      this.selectedDate = new Date()
      this.$nextTick(() => {
        this.scrollToCurrentMonth()
      })
    },
    scrollToCurrentMonth() {
      // Find the month containing today and scroll to it
      const today = new Date()
      const todayMonth = today.getMonth()
      const todayYear = today.getFullYear()
      
      this.displayedMonths.forEach((month, index) => {
        if (month.month === todayMonth && month.year === todayYear) {
          const monthElement = this.$refs[`month-${index}`]?.[0]
          if (monthElement) {
            monthElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
          }
        }
      })
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
    showAllTasksForDate(date) {
      // For now, just select the date. Could be extended to show a detailed task list modal
      this.selectDate(date)
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
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString()
    },
    formatStatus(status) {
      return status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
    },
    formatPriority(priority) {
      return priority.charAt(0).toUpperCase() + priority.slice(1)
    },
    getTaskDuration(task) {
      const start = new Date(task.startDate)
      const end = new Date(task.endDate)
      const diffTime = Math.abs(end - start)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
      return `${diffDays} day${diffDays !== 1 ? 's' : ''}`
    },
    applyFilters() {
      this.$nextTick()
    }
  }
}
</script>

<style scoped>
.multi-month-calendar {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
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

.view-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.view-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #495057;
  margin: 0;
}

.month-navigation {
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

.calendar-scroll-container {
  flex: 1;
  overflow: auto;
  padding: 1rem;
}

.months-grid {
  display: grid;
  gap: 2rem;
  min-height: 100%;
}

.month-container {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.month-header {
  padding: 0.75rem 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.month-title {
  font-size: 1rem;
  font-weight: 600;
  color: #495057;
  margin: 0;
}

.month-stats {
  font-size: 0.75rem;
  color: #6c757d;
  padding: 0.25rem 0.5rem;
  background: white;
  border-radius: 12px;
  border: 1px solid #dee2e6;
}

.weekday-headers {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.weekday-header {
  padding: 0.5rem;
  text-align: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: #495057;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.calendar-day {
  min-height: 80px;
  background: white;
  padding: 0.25rem;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  flex-direction: column;
  position: relative;
  border-right: 1px solid #f1f1f1;
  border-bottom: 1px solid #f1f1f1;
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
  position: relative;
}

.calendar-day.today::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 2px solid #2196f3;
  pointer-events: none;
}

.calendar-day.today .day-number {
  background: #2196f3;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.75rem;
}

.calendar-day.selected {
  background: #fff3e0;
  border: 2px solid #ff9800;
}

.calendar-day.has-tasks {
  border-left: 3px solid #007bff;
}

.calendar-day.weekend {
  background: #f9f9f9;
}

.day-number {
  font-size: 0.75rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
  align-self: flex-start;
}

.day-tasks {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
  overflow: hidden;
}

.task-event {
  font-size: 0.65rem;
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Task Priority Colors */
.task-event.priority-low {
  background: #d4edda;
  color: #155724;
}

.task-event.priority-medium {
  background: #fff3cd;
  color: #856404;
}

.task-event.priority-high {
  background: #f8d7da;
  color: #721c24;
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
  font-size: 0.6rem;
  color: #6c757d;
  padding: 0.125rem 0.25rem;
  text-align: center;
  background: #f8f9fa;
  border-radius: 2px;
  cursor: pointer;
  margin-top: auto;
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
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 500px;
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
  font-size: 1.25rem;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  color: #6c757d;
  border-radius: 4px;
  transition: all 0.2s;
}

.modal-close:hover {
  background-color: #f8f9fa;
  color: #495057;
}

.modal-content {
  padding: 1.5rem;
}

.task-description {
  margin-bottom: 1rem;
  color: #495057;
  line-height: 1.5;
}

.task-details {
  margin-bottom: 1.5rem;
}

.detail-item {
  display: flex;
  margin-bottom: 0.5rem;
  align-items: center;
}

.detail-item strong {
  min-width: 100px;
  color: #495057;
}

.modal-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.btn-primary {
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #0056b3;
}

/* Animations */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .calendar-header {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
  
  .view-controls {
    justify-content: center;
  }
  
  .calendar-controls {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .months-grid {
    grid-template-columns: 1fr !important;
    gap: 1rem;
  }
  
  .calendar-day {
    min-height: 60px;
  }
  
  .task-event {
    font-size: 0.6rem;
  }
}

@media (max-width: 576px) {
  .calendar-scroll-container {
    padding: 0.5rem;
  }
  
  .month-header {
    padding: 0.5rem;
  }
  
  .month-title {
    font-size: 0.875rem;
  }
  
  .calendar-day {
    min-height: 50px;
    padding: 0.125rem;
  }
  
  .day-number {
    font-size: 0.7rem;
  }
  
  .task-event {
    font-size: 0.55rem;
    padding: 0.05rem 0.125rem;
  }
}
</style>
