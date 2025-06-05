<!--
  TimelineGanttView.vue - Month-View Timeline Gantt Chart
  
  Features:
  - Calendar-style month view with smooth scrolling
  - Better task visualization across months
  - Improved navigation and controls
  - Responsive design with touch-friendly interactions
  - Clear month and day indicators
  - Enhanced task filtering and status management
-->
<template>
  <div class="timeline-gantt-view">
    <!-- Header Controls -->
    <div class="timeline-header">
      <div class="view-controls">
        <h2 class="view-title">Project Timeline</h2>
        <div class="timeline-navigation">
          <button @click="scrollToPreviousMonth" class="nav-btn" title="Previous Month">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15,18 9,12 15,6"></polyline>
            </svg>
          </button>
          
          <button @click="goToToday" class="today-btn">Today</button>
          
          <button @click="scrollToNextMonth" class="nav-btn" title="Next Month">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9,18 15,12 9,6"></polyline>
            </svg>
          </button>
        </div>
      </div>

      <div class="timeline-controls">
        <div class="view-options">
          <label class="control-label">View Range:</label>
          <select v-model="monthsToShow" @change="updateTimelineRange" class="control-select">
            <option value="3">3 Months</option>
            <option value="6">6 Months</option>
            <option value="12">12 Months</option>
            <option value="18">18 Months</option>
          </select>
        </div>
        
        <div class="view-options">
          <label class="control-label">Filter:</label>
          <select v-model="statusFilter" @change="applyFilters" class="control-select">
            <option value="all">All Tasks</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="on-hold">On Hold</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div class="view-options">
          <label class="control-label">Zoom:</label>
          <div class="zoom-controls">
            <button @click="zoomOut" class="zoom-btn" :disabled="dayWidth <= 20" title="Zoom Out">−</button>
            <span class="zoom-level">{{ Math.round((dayWidth - 20) / 5) * 25 + 100 }}%</span>
            <button @click="zoomIn" class="zoom-btn" :disabled="dayWidth >= 50" title="Zoom In">+</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Timeline Container -->
    <div class="timeline-container" ref="timelineContainer" @scroll="handleScroll">
      <!-- Fixed Task List Header -->
      <div class="timeline-scale-header">
        <div class="task-list-header">
          <span>Tasks</span>
          <span class="task-count">({{ filteredTasks.length }})</span>
        </div>
        
        <!-- Calendar Header -->
        <div class="timeline-scale" ref="timelineScale" :style="{ width: timelineWidth + 'px' }">
          <!-- Month headers -->
          <div class="month-headers">
            <div
              v-for="month in timelineMonths"
              :key="month.key"
              class="month-header"
              :class="{ 'current-month': month.isCurrent }"
              :style="{ 
                left: month.left + 'px',
                width: month.width + 'px'
              }"
            >
              <div class="month-info">
                <span class="month-name">{{ month.name }}</span>
                <span class="month-year">{{ month.year }}</span>
              </div>
            </div>
          </div>

          <!-- Day headers -->
          <div class="day-headers">
            <div
              v-for="month in timelineMonths"
              :key="'days-' + month.key"
              class="month-days-container"
              :style="{ 
                left: month.left + 'px',
                width: month.width + 'px'
              }"
            >
              <div 
                v-for="day in month.days"
                :key="day.key"
                class="day-header"
                :class="{
                  'today': day.isToday,
                  'weekend': day.isWeekend,
                  'month-start': day.day === 1
                }"
                :style="{ 
                  left: day.left + 'px',
                  width: day.width + 'px'
                }"
              >
                <span class="day-number">{{ day.day }}</span>
                <span class="day-name">{{ day.dayName }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Task Content Area -->
      <div class="timeline-content" ref="timelineContent">
        <div class="task-gantt-container">
          <!-- Grid lines background -->
          <div class="timeline-grid" :style="{ width: timelineWidth + 'px' }">
            <div
              v-for="month in timelineMonths"
              :key="'month-grid-' + month.key"
              class="month-grid-container"
              :style="{ 
                left: month.left + 'px',
                width: month.width + 'px'
              }"
            >
              <div
                v-for="day in month.days"
                :key="'grid-' + day.key"
                class="grid-line day-grid"
                :class="{
                  'today-grid': day.isToday,
                  'weekend-grid': day.isWeekend,
                  'month-start-grid': day.day === 1
                }"
                :style="{ 
                  left: day.left + 'px',
                  width: day.width + 'px'
                }"
              ></div>
            </div>
          </div>

          <!-- Task rows -->
          <div class="task-rows">
            <div
              v-for="task in filteredTasks"
              :key="task.id"
              class="task-row"
              :class="{ 
                'selected': selectedTaskId === task.id,
                'overdue': isTaskOverdue(task)
              }"
            >
              <!-- Task Info Panel -->
              <div class="task-info-panel" @click="selectTask(task.id)">
                <div class="task-main-info">
                  <div class="task-title">{{ task.title }}</div>
                  <div class="task-meta">
                    <span class="task-status" :class="'status-' + task.status">
                      {{ formatStatus(task.status) }}
                    </span>
                    <span class="task-priority" :class="'priority-' + task.priority">
                      {{ formatPriority(task.priority) }}
                    </span>
                    <span class="task-duration">{{ getTaskDuration(task) }}</span>
                  </div>
                </div>
              </div>

              <!-- Timeline for this task -->
              <div class="task-timeline" :style="{ width: timelineWidth + 'px' }">
                <!-- Task bar -->
                <div
                  v-if="isTaskInTimelineRange(task)"
                  class="task-bar"
                  :class="[
                    'priority-' + task.priority,
                    'status-' + task.status,
                    {
                      'overdue': isTaskOverdue(task),
                      'dragging': dragState.taskId === task.id
                    }
                  ]"
                  :style="getTaskBarStyle(task)"
                  @click.stop="selectTask(task.id)"
                  @mousedown="startDrag($event, task, 'move')"
                  :title="getTaskTooltip(task)"
                >
                  <!-- Task content -->
                  <div class="task-bar-content">
                    <span class="task-bar-title">{{ task.title }}</span>
                    <div class="task-bar-progress" :style="{ width: getTaskProgress(task) + '%' }"></div>
                  </div>
                  
                  <!-- Resize handles -->
                  <div 
                    class="resize-handle resize-left"
                    @mousedown.stop="startDrag($event, task, 'resize-left')"
                  ></div>
                  <div 
                    class="resize-handle resize-right"
                    @mousedown.stop="startDrag($event, task, 'resize-right')"
                  ></div>
                </div>

                <!-- Drag preview -->
                <div
                  v-if="dragState.isDragging && dragState.taskId === task.id"
                  class="task-bar drag-preview"
                  :style="getDragPreviewStyle(task)"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Today Indicator Line -->
      <div
        v-if="todayPosition >= 0"
        class="today-indicator"
        :style="{ left: (todayPosition + taskPanelWidth) + 'px' }"
      ></div>
    </div>

    <!-- Task Modal -->
    <div v-if="selectedTask" class="task-modal-overlay" @click="closeTaskModal">
      <div class="task-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ selectedTask.title }}</h3>
          <button @click="closeTaskModal" class="modal-close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
            <div class="detail-item">
              <strong>Progress:</strong> {{ getTaskProgress(selectedTask) }}%
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
  name: 'TimelineGanttView',
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
  emits: ['task-select', 'task-edit', 'task-update'],

  data() {
    return {
      monthsToShow: 6,
      statusFilter: 'all',
      currentCenterDate: new Date(),
      selectedTask: null,
      scrollLeft: 0,
      
      // Drag and drop state
      dragState: {
        isDragging: false,
        taskId: null,
        dragType: null, // 'move', 'resize-left', 'resize-right'
        startX: 0,
        currentX: 0,
        originalStartDate: null,
        originalEndDate: null,
        hasMoved: false
      },

      // Timeline dimensions - improved for month view
      taskPanelWidth: 320,
      dayWidth: 32, // Optimal width for month view
      minDayWidth: 20,
      maxDayWidth: 50,
    }
  },

  computed: {
    filteredTasks() {
      return this.tasks.filter(task => {
        if (this.statusFilter !== 'all' && task.status !== this.statusFilter) {
          return false
        }
        return task.startDate && task.endDate
      }).sort((a, b) => {
        // Sort by start date, then by priority
        const dateCompare = new Date(a.startDate) - new Date(b.startDate)
        if (dateCompare !== 0) return dateCompare
        
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
        return (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3)
      })
    },
    
    timelineRange() {
      const startMonth = Math.floor(this.monthsToShow / 2)
      const startDate = new Date(this.currentCenterDate)
      startDate.setMonth(startDate.getMonth() - startMonth)
      startDate.setDate(1) // Start of month
      startDate.setHours(0, 0, 0, 0)
      
      const endDate = new Date(startDate)
      endDate.setMonth(endDate.getMonth() + this.monthsToShow)
      endDate.setDate(0) // End of last month
      endDate.setHours(23, 59, 59, 999)
      
      return { start: startDate, end: endDate }
    },

    timelineMonths() {
      const months = []
      const { start, end } = this.timelineRange
      const current = new Date(start)
      let currentLeft = 0
      const today = new Date()
      
      while (current <= end) {
        const monthStart = new Date(current)
        const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0)
        const actualEnd = monthEnd > end ? end : monthEnd
        
        // Generate days for this month
        const days = []
        const dayIterator = new Date(monthStart)
        let dayLeft = 0
        
        while (dayIterator <= actualEnd) {
          const isToday = dayIterator.toDateString() === today.toDateString()
          const isWeekend = dayIterator.getDay() === 0 || dayIterator.getDay() === 6
          const isCurrentMonth = dayIterator.getMonth() === current.getMonth()
          
          days.push({
            key: dayIterator.toISOString().split('T')[0],
            day: dayIterator.getDate(),
            dayName: dayIterator.toLocaleDateString('en-US', { weekday: 'short' }),
            date: new Date(dayIterator),
            left: dayLeft,
            width: this.dayWidth,
            isToday,
            isWeekend,
            isCurrentMonth
          })
          
          dayLeft += this.dayWidth
          dayIterator.setDate(dayIterator.getDate() + 1)
        }
        
        const monthWidth = days.length * this.dayWidth
        const isCurrent = current.getMonth() === today.getMonth() && current.getFullYear() === today.getFullYear()
        
        months.push({
          key: `${current.getFullYear()}-${current.getMonth()}`,
          name: current.toLocaleDateString('en-US', { month: 'long' }),
          year: current.getFullYear(),
          left: currentLeft,
          width: monthWidth,
          days: days,
          isCurrent
        })
        
        currentLeft += monthWidth
        current.setMonth(current.getMonth() + 1)
      }
      
      return months
    },

    timelineWidth() {
      return this.timelineMonths.reduce((total, month) => total + month.width, 0)
    },

    todayPosition() {
      const today = new Date()
      for (const month of this.timelineMonths) {
        for (const day of month.days) {
          if (day.isToday) {
            return month.left + day.left + (day.width / 2)
          }
        }
      }
      return -1
    }
  },

  mounted() {
    this.setupEventListeners()
    this.goToToday()
  },

  beforeUnmount() {
    this.removeEventListeners()
  },

  methods: {
    setupEventListeners() {
      document.addEventListener('mousemove', this.handleMouseMove)
      document.addEventListener('mouseup', this.handleMouseUp)
      document.addEventListener('keydown', this.handleKeyDown)
    },

    removeEventListeners() {
      document.removeEventListener('mousemove', this.handleMouseMove)
      document.removeEventListener('mouseup', this.handleMouseUp)
      document.removeEventListener('keydown', this.handleKeyDown)
    },

    // Zoom controls
    zoomIn() {
      if (this.dayWidth < this.maxDayWidth) {
        this.dayWidth = Math.min(this.maxDayWidth, this.dayWidth + 5)
        this.$nextTick(() => {
          this.maintainScrollPosition()
        })
      }
    },

    zoomOut() {
      if (this.dayWidth > this.minDayWidth) {
        this.dayWidth = Math.max(this.minDayWidth, this.dayWidth - 5)
        this.$nextTick(() => {
          this.maintainScrollPosition()
        })
      }
    },

    maintainScrollPosition() {
      // Maintain relative scroll position when zooming
      const container = this.$refs.timelineContainer
      if (container) {
        const scrollRatio = this.scrollLeft / (container.scrollWidth - container.clientWidth)
        this.$nextTick(() => {
          const newScrollLeft = scrollRatio * (container.scrollWidth - container.clientWidth)
          container.scrollLeft = newScrollLeft
        })
      }
    },

    // Navigation methods
    handleScroll(event) {
      this.scrollLeft = event.target.scrollLeft
    },

    scrollToPreviousMonth() {
      const currentMonth = this.timelineMonths.find(month => 
        month.left <= this.scrollLeft && month.left + month.width > this.scrollLeft
      )
      
      if (currentMonth) {
        const prevMonthIndex = this.timelineMonths.indexOf(currentMonth) - 1
        if (prevMonthIndex >= 0) {
          const prevMonth = this.timelineMonths[prevMonthIndex]
          this.$refs.timelineContainer.scrollTo({
            left: prevMonth.left,
            behavior: 'smooth'
          })
        }
      }
    },

    scrollToNextMonth() {
      const currentMonth = this.timelineMonths.find(month => 
        month.left <= this.scrollLeft && month.left + month.width > this.scrollLeft
      )
      
      if (currentMonth) {
        const nextMonthIndex = this.timelineMonths.indexOf(currentMonth) + 1
        if (nextMonthIndex < this.timelineMonths.length) {
          const nextMonth = this.timelineMonths[nextMonthIndex]
          this.$refs.timelineContainer.scrollTo({
            left: nextMonth.left,
            behavior: 'smooth'
          })
        }
      }
    },

    goToToday() {
      const today = new Date()
      let todayPosition = 0
      
      for (const month of this.timelineMonths) {
        for (const day of month.days) {
          if (day.isToday) {
            todayPosition = month.left + day.left
            break
          }
        }
        if (todayPosition > 0) break
      }
      
      if (todayPosition > 0) {
        const containerWidth = this.$refs.timelineContainer.clientWidth
        const scrollPosition = Math.max(0, todayPosition - containerWidth / 2)
        
        this.$refs.timelineContainer.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        })
      }
    },

    updateTimelineRange() {
      this.$nextTick()
    },

    applyFilters() {
      this.$nextTick()
    },

    // Task methods
    selectTask(taskId) {
      this.$emit('task-select', taskId)
      const task = this.tasks.find(t => t.id === taskId)
      this.selectedTask = task
    },

    editTask(task) {
      this.closeTaskModal()
      this.$emit('task-edit', task)
    },

    closeTaskModal() {
      this.selectedTask = null
    },

    // Drag and drop methods
    startDrag(event, task, dragType) {
      if (task.status === 'completed') return
      
      event.preventDefault()
      this.dragState = {
        isDragging: true,
        taskId: task.id,
        dragType,
        startX: event.clientX,
        currentX: event.clientX,
        originalStartDate: new Date(task.startDate),
        originalEndDate: new Date(task.endDate),
        hasMoved: false
      }
    },

    handleMouseMove(event) {
      if (!this.dragState.isDragging) return
      
      this.dragState.currentX = event.clientX
      this.dragState.hasMoved = true
    },

    handleMouseUp(event) {
      if (!this.dragState.isDragging) return
      
      if (this.dragState.hasMoved) {
        this.finalizeDrag()
      }
      
      this.dragState = {
        isDragging: false,
        taskId: null,
        dragType: null,
        startX: 0,
        currentX: 0,
        originalStartDate: null,
        originalEndDate: null,
        hasMoved: false
      }
    },

    handleKeyDown(event) {
      if (event.key === 'Escape' && this.dragState.isDragging) {
        this.cancelDrag()
      }
    },

    finalizeDrag() {
      const task = this.tasks.find(t => t.id === this.dragState.taskId)
      if (!task) return
      
      const deltaX = this.dragState.currentX - this.dragState.startX
      const periodDelta = Math.round(deltaX / this.periodWidth)
      
      let newStartDate = new Date(this.dragState.originalStartDate)
      let newEndDate = new Date(this.dragState.originalEndDate)
      
      if (this.zoomLevel === 'day') {
        switch (this.dragState.dragType) {
          case 'move':
            newStartDate.setDate(newStartDate.getDate() + periodDelta)
            newEndDate.setDate(newEndDate.getDate() + periodDelta)
            break
          case 'resize-left':
            newStartDate.setDate(newStartDate.getDate() + periodDelta)
            if (newStartDate >= newEndDate) {
              newStartDate = new Date(newEndDate)
              newStartDate.setDate(newStartDate.getDate() - 1)
            }
            break
          case 'resize-right':
            newEndDate.setDate(newEndDate.getDate() + periodDelta)
            if (newEndDate <= newStartDate) {
              newEndDate = new Date(newStartDate)
              newEndDate.setDate(newEndDate.getDate() + 1)
            }
            break
        }
      } else if (this.zoomLevel === 'week') {
        const weekDelta = periodDelta * 7
        switch (this.dragState.dragType) {
          case 'move':
            newStartDate.setDate(newStartDate.getDate() + weekDelta)
            newEndDate.setDate(newEndDate.getDate() + weekDelta)
            break
          case 'resize-left':
            newStartDate.setDate(newStartDate.getDate() + weekDelta)
            break
          case 'resize-right':
            newEndDate.setDate(newEndDate.getDate() + weekDelta)
            break
        }
      }
      
      // Emit the update
      this.$emit('task-update', {
        ...task,
        startDate: newStartDate.toISOString().split('T')[0],
        endDate: newEndDate.toISOString().split('T')[0]
      })
    },

    cancelDrag() {
      this.dragState = {
        isDragging: false,
        taskId: null,
        dragType: null,
        startX: 0,
        currentX: 0,
        originalStartDate: null,
        originalEndDate: null,
        hasMoved: false
      }
    },

    // Utility methods
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

    getTaskProgress(task) {
      // Simple progress calculation
      const start = new Date(task.startDate)
      const end = new Date(task.endDate)
      const today = new Date()
      
      if (today < start) return 0
      if (today > end) return 100
      
      const totalDuration = end - start
      const elapsedDuration = today - start
      return Math.round((elapsedDuration / totalDuration) * 100)
    },

    getTaskTooltip(task) {
      const start = this.formatDate(task.startDate)
      const end = this.formatDate(task.endDate)
      return `${task.title}\n${start} - ${end}\nStatus: ${this.formatStatus(task.status)}\nPriority: ${this.formatPriority(task.priority)}`
    },

    getTaskBarStyle(task) {
      const taskStart = new Date(task.startDate)
      const taskEnd = new Date(task.endDate)
      
      // Find the position in the timeline
      let startPosition = 0
      let endPosition = 0
      let found = false
      
      // Look through all months and their days
      for (const month of this.timelineMonths) {
        for (const day of month.days) {
          const dayDate = new Date(day.date)
          dayDate.setHours(0, 0, 0, 0)
          const taskStartDay = new Date(taskStart)
          taskStartDay.setHours(0, 0, 0, 0)
          const taskEndDay = new Date(taskEnd)
          taskEndDay.setHours(0, 0, 0, 0)
          
          if (!found && dayDate >= taskStartDay) {
            startPosition = month.left + day.left
            found = true
          }
          
          if (dayDate <= taskEndDay) {
            endPosition = month.left + day.left + day.width
          }
        }
      }
      
      const width = Math.max(this.dayWidth, endPosition - startPosition)
      
      return {
        left: startPosition + 'px',
        width: width + 'px',
        backgroundColor: this.getTaskColor(task),
        position: 'absolute',
        top: '8px',
        height: '32px',
        borderRadius: '4px',
        border: `2px solid ${this.getTaskBorderColor(task)}`,
        zIndex: 10
      }
    },

    getTaskBorderColor(task) {
      const priorityBorders = {
        low: '#28a745',
        medium: '#ffc107',
        high: '#fd7e14',
        critical: '#dc3545'
      }
      return priorityBorders[task.priority] || '#6c757d'
    },

    getTaskColor(task) {
      const priorityColors = {
        low: '#28a745',
        medium: '#ffc107',
        high: '#fd7e14',
        critical: '#dc3545'
      }
      
      const statusColors = {
        todo: '#6c757d',
        'in-progress': '#007bff',
        completed: '#28a745',
        'on-hold': '#ffc107',
        cancelled: '#dc3545'
      }
      
      // Use priority color but fade for completed tasks
      const baseColor = priorityColors[task.priority] || '#6c757d'
      return task.status === 'completed' ? baseColor + '80' : baseColor
    },

    getDragPreviewStyle(task) {
      if (!this.dragState.isDragging) return {}
      
      const deltaX = this.dragState.currentX - this.dragState.startX
      const originalStyle = this.getTaskBarStyle(task)
      
      let newLeft = parseFloat(originalStyle.left)
      let newWidth = parseFloat(originalStyle.width)
      
      switch (this.dragState.dragType) {
        case 'move':
          newLeft += deltaX
          break
        case 'resize-left':
          newLeft += deltaX
          newWidth -= deltaX
          break
        case 'resize-right':
          newWidth += deltaX
          break
      }
      
      return {
        left: newLeft + 'px',
        width: Math.max(this.periodWidth, newWidth) + 'px',
        position: 'absolute',
        top: '10px',
        height: '30px',
        backgroundColor: 'rgba(0, 123, 255, 0.5)',
        border: '2px solid #007bff',
        borderRadius: '4px',
        zIndex: 1000,
        pointerEvents: 'none'
      }
    },

    getPeriodWidth() {
      // Return the width of a single period (day in this case)
      return this.dayWidth
    },

    isTaskInTimelineRange(task) {
      const taskStart = new Date(task.startDate)
      const taskEnd = new Date(task.endDate)
      const { start, end } = this.timelineRange
      
      return taskEnd >= start && taskStart <= end
    }
  }
}
</script>

<style scoped>
.timeline-gantt-view {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Header Styles */
.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e9ecef;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  flex-wrap: wrap;
  gap: 1.5rem;
}

.view-controls {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.view-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  letter-spacing: -0.5px;
}

.timeline-navigation {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: white;
  border-radius: 8px;
  padding: 0.25rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.timeline-controls {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.view-options {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.nav-btn,
.today-btn {
  padding: 0.75rem;
  border: 1px solid #dee2e6;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-weight: 500;
}

.nav-btn:hover {
  background: #f8f9fa;
  border-color: #adb5bd;
  transform: translateY(-1px);
}

.today-btn {
  padding: 0.75rem 1.25rem;
  font-size: 0.875rem;
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.today-btn:hover {
  background: #0056b3;
  border-color: #004085;
  transform: translateY(-1px);
}

/* Zoom Controls */
.zoom-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  border-radius: 6px;
  padding: 0.25rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.zoom-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #dee2e6;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.zoom-btn:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #adb5bd;
}

.zoom-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.zoom-level {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6c757d;
  padding: 0 0.5rem;
  min-width: 45px;
  text-align: center;
}

.control-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #495057;
  white-space: nowrap;
}

.control-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  background: white;
  font-size: 0.875rem;
  cursor: pointer;
  min-width: 120px;
  transition: border-color 0.2s ease;
}

.control-select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

/* Timeline Container */
.timeline-container {
  flex: 1;
  overflow: auto;
  position: relative;
  background: #fafbfc;
}

/* Timeline Header */
.timeline-scale-header {
  display: flex;
  border-bottom: 2px solid #dee2e6;
  background: white;
  position: sticky;
  top: 0;
  z-index: 20;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.task-list-header {
  width: 320px;
  min-width: 320px;
  padding: 1.25rem 1.5rem;
  font-weight: 600;
  color: #495057;
  border-right: 2px solid #dee2e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
}

.task-count {
  font-size: 0.75rem;
  color: #6c757d;
  background: #e9ecef;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-weight: 500;
}

.timeline-scale {
  position: relative;
  min-height: 100px;
  border-left: 1px solid #dee2e6;
  background: white;
}

/* Month Headers */
.month-headers {
  position: absolute;
  top: 0;
  left: 0;
  height: 50px;
  width: 100%;
}

.month-header {
  position: absolute;
  top: 0;
  padding: 0.75rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-right: 1px solid #ced4da;
  border-bottom: 1px solid #ced4da;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #495057;
}

.month-header.current-month {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  color: #1976d2;
}

.month-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.125rem;
}

.month-name {
  font-size: 0.875rem;
  font-weight: 700;
  white-space: nowrap;
}

.month-year {
  font-size: 0.75rem;
  font-weight: 500;
  opacity: 0.8;
}

/* Day Headers */
.day-headers {
  position: absolute;
  top: 50px;
  left: 0;
  height: 50px;
  width: 100%;
}

.month-days-container {
  position: absolute;
  top: 0;
  height: 100%;
}

.day-header {
  position: absolute;
  top: 0;
  height: 100%;
  padding: 0.5rem 0.25rem;
  border-right: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  background: white;
  transition: background-color 0.2s ease;
}

.day-header:hover {
  background: #f8f9fa;
}

.day-header.today {
  background: #e3f2fd;
  color: #1976d2;
  font-weight: 600;
}

.day-header.weekend {
  background: #f8f9fa;
  color: #6c757d;
}

.day-header.month-start {
  border-left: 2px solid #007bff;
}

.day-number {
  font-weight: 600;
  line-height: 1;
}

.day-name {
  font-size: 0.65rem;
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Timeline Content */
.timeline-content {
  position: relative;
}

.task-gantt-container {
  position: relative;
  min-height: 400px;
}

/* Grid Lines */
.timeline-grid {
  position: absolute;
  top: 0;
  left: 320px;
  bottom: 0;
  pointer-events: none;
  z-index: 1;
}

.month-grid-container {
  position: absolute;
  top: 0;
  bottom: 0;
}

.grid-line {
  position: absolute;
  top: 0;
  bottom: 0;
  border-right: 1px solid #f1f3f4;
}

.grid-line.today-grid {
  border-right: 2px solid #1976d2;
  background: rgba(25, 118, 210, 0.05);
}

.grid-line.weekend-grid {
  background: rgba(0, 0, 0, 0.02);
}

.grid-line.month-start-grid {
  border-right: 2px solid #007bff;
}

/* Task Rows */
.task-rows {
  position: relative;
  z-index: 5;
}

.task-row {
  display: flex;
  border-bottom: 1px solid #f1f3f4;
  min-height: 60px;
  transition: background-color 0.2s ease;
}

.task-row:hover {
  background: rgba(0, 123, 255, 0.02);
}

.task-row.selected {
  background: rgba(0, 123, 255, 0.05);
  border-color: #007bff;
}

.task-row.overdue {
  background: rgba(220, 53, 69, 0.05);
}

/* Task Info Panel */
.task-info-panel {
  width: 320px;
  min-width: 320px;
  padding: 1rem 1.5rem;
  border-right: 2px solid #dee2e6;
  display: flex;
  align-items: center;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.task-info-panel:hover {
  background: #f8f9fa;
}

.task-main-info {
  flex: 1;
}

.task-title {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  line-height: 1.3;
}

.task-meta {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  font-size: 0.75rem;
}

.task-status,
.task-priority,
.task-duration {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 500;
  white-space: nowrap;
}

.task-status {
  background: #e9ecef;
  color: #495057;
}

.status-todo { background: #6c757d; color: white; }
.status-in-progress { background: #007bff; color: white; }
.status-completed { background: #28a745; color: white; }
.status-on-hold { background: #ffc107; color: #212529; }
.status-cancelled { background: #dc3545; color: white; }

.task-priority {
  color: white;
}

.priority-low { background: #28a745; }
.priority-medium { background: #ffc107; color: #212529; }
.priority-high { background: #fd7e14; }
.priority-critical { background: #dc3545; }

.task-duration {
  background: #f8f9fa;
  color: #6c757d;
}

/* Task Timeline */
.task-timeline {
  position: relative;
  flex: 1;
  min-height: 60px;
}

/* Task Bars */
.task-bar {
  position: absolute;
  height: 36px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  overflow: hidden;
  z-index: 10;
}

.task-bar:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.task-bar-content {
  position: relative;
  padding: 0 0.75rem;
  display: flex;
  align-items: center;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.task-bar-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  position: relative;
  z-index: 2;
}

.task-bar-progress {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 6px 0 0 6px;
  transition: width 0.3s ease;
  z-index: 1;
}

/* Resize Handles */
.resize-handle {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 8px;
  cursor: ew-resize;
  background: rgba(255, 255, 255, 0.3);
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 3;
}

.resize-left {
  left: 0;
  border-radius: 6px 0 0 6px;
}

.resize-right {
  right: 0;
  border-radius: 0 6px 6px 0;
}

.task-bar:hover .resize-handle {
  opacity: 1;
}

.drag-preview {
  border-radius: 6px;
  opacity: 0.7;
  animation: dragPulse 1s ease-in-out infinite alternate;
}

/* Today Indicator */
.today-indicator {
  position: absolute;
  top: 100px;
  bottom: 0;
  width: 2px;
  background: #1976d2;
  z-index: 15;
  pointer-events: none;
}

.today-indicator::before {
  content: '';
  position: absolute;
  top: -5px;
  left: -5px;
  width: 12px;
  height: 12px;
  background: #1976d2;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(25, 118, 210, 0.3);
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
  backdrop-filter: blur(4px);
}

.task-modal {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.25rem;
  font-weight: 600;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  color: #6c757d;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background-color: #f8f9fa;
  color: #495057;
}

.modal-content {
  padding: 2rem;
}

.task-description {
  margin-bottom: 1.5rem;
  color: #495057;
  line-height: 1.6;
}

.task-details {
  margin-bottom: 2rem;
}

.detail-item {
  display: flex;
  margin-bottom: 0.75rem;
  align-items: center;
}

.detail-item strong {
  min-width: 120px;
  color: #495057;
  font-weight: 600;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: #0056b3;
  transform: translateY(-1px);
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

@keyframes dragPulse {
  from {
    opacity: 0.5;
  }
  to {
    opacity: 0.8;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .timeline-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    padding: 1rem 1.5rem;
  }
  
  .view-controls {
    justify-content: center;
  }
  
  .timeline-controls {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .task-list-header,
  .task-info-panel {
    width: 280px;
    min-width: 280px;
  }
  
  .timeline-grid {
    left: 280px;
  }
  
  .today-indicator {
    left: calc(var(--today-position) + 280px);
  }
}

@media (max-width: 576px) {
  .task-list-header,
  .task-info-panel {
    width: 240px;
    min-width: 240px;
    padding: 0.75rem 1rem;
  }
  
  .timeline-grid {
    left: 240px;
  }
  
  .task-title {
    font-size: 0.8rem;
  }
  
  .task-meta {
    font-size: 0.7rem;
  }
  
  .task-bar-title {
    font-size: 0.7rem;
  }
  
  .day-header {
    padding: 0.25rem 0.125rem;
  }
  
  .today-indicator {
    left: calc(var(--today-position) + 240px);
  }
}
</style>
