<!--
  GanttChart.vue - Interactive Gantt Chart Component
  
  Features:
  - Timeline visualization with multiple view modes (Day/Week/Month)
  - Drag-and-drop functionality for task management:
    * Move tasks by dragging task bars
    * Resize task duration by dragging left/right edges
    * Visual feedback during drag operations
    * Grid snapping for precise positioning
    * Keyboard support (Escape to cancel)
    * Prevents dragging completed tasks
  - Real-time task updates with automatic persistence
  - Color-coded task bars by priority
  - Progress indicators and status visualization
  - Responsive design with horizontal scrolling
-->
<template>
  <div class="gantt-chart">
    <div class="gantt-controls">
      <div class="view-controls">
        <button
          v-for="view in viewModes"
          :key="view.value"
          @click="currentView = view.value"
          :class="['view-btn', { active: currentView === view.value }]"
        >
          {{ view.label }}
        </button>
      </div>
      <!-- Enhanced Filters -->
      <div class="filter-controls">
        <div class="filter-group">
          <label class="filter-label">Date Range:</label>
          <select v-model="dateRangeFilter" @change="applyDateFilter" class="filter-select">
            <option value="all">All Time</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        <div class="filter-group" v-if="dateRangeFilter === 'custom'">
          <input
            v-model="customDateStart"
            type="date"
            @change="applyDateFilter"
            class="filter-input"
            placeholder="Start Date"
          />
          <span class="filter-separator">to</span>
          <input
            v-model="customDateEnd"
            type="date"
            @change="applyDateFilter"
            class="filter-input"
            placeholder="End Date"
          />
        </div>

        <div class="filter-group">
          <label class="filter-label">Status:</label>
          <select v-model="statusFilter" @change="applyFilters" class="filter-select">
            <option value="all">All Status</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="on-hold">On Hold</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">Priority:</label>
          <select v-model="priorityFilter" @change="applyFilters" class="filter-select">
            <option value="all">All Priority</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <button @click="clearAllFilters" class="clear-filters-btn">
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
          Clear Filters
        </button>
      </div>

      <div class="timeline-controls">
        <button @click="goToPreviousPeriod" class="nav-btn">
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
        <button @click="goToToday" class="today-btn">Today</button>
        <button @click="goToNextPeriod" class="nav-btn">
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
        
        <!-- Print/Export Button -->
        <button @click="printGanttChart" class="print-btn" title="Print Gantt Chart">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="6,9 6,2 18,2 18,9"></polyline>
            <path d="M6,18H4a2,2 0 0,1-2-2v-5a2,2 0 0,1,2-2H20a2,2 0 0,1,2,2v5a2,2 0 0,1-2,2H18"></path>
            <polyline points="6,14 18,14 18,22 6,22 6,14"></polyline>
          </svg>
          Print
        </button>
      </div>
    </div>

    <div class="gantt-container" ref="ganttContainer" :class="{ dragging: dragState.isDragging }">
      <!-- Project Periods Row -->
      <div class="project-periods-row">
        <div class="periods-column-header">
          <div class="add-period-btn" @click="addProjectPeriod" title="Add Project Period">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14m-7-7h14"></path>
            </svg>
            Add Period
          </div>
        </div>
        <div class="periods-timeline-container">
          <div class="periods-container" ref="periodsContainer" :style="{ width: timelineWidth + 'px' }">
            <!-- Period drag preview overlay -->
            <div
              v-if="dragState.isDragging && activeProjectPeriods.find(p => p.id === dragState.taskId)"
              class="period-drag-preview"
              :style="getPeriodDragPreviewStyle()"
            ></div>

            <div
              v-for="period in activeProjectPeriods"
              :key="period.id"
              class="project-period"
              :class="{ 'period-dragging': dragState.isDragging && dragState.taskId === period.id }"
              :style="getPeriodStyle(period)"
              @click="editPeriod(period)"
              @mousedown="startPeriodDrag($event, period, 'move')"
              :title="period.description"
            >
              <!-- Left resize handle -->
              <div
                class="period-resize-handle period-resize-handle-left"
                @mousedown.stop="startPeriodDrag($event, period, 'resize-left')"
                title="Drag to change start date"
              ></div>

              <span class="period-title">{{ period.title }}</span>
              <button class="period-remove" @click.stop="removePeriod(period.id)" title="Remove period">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>

              <!-- Right resize handle -->
              <div
                class="period-resize-handle period-resize-handle-right"
                @mousedown.stop="startPeriodDrag($event, period, 'resize-right')"
                title="Drag to change end date"
              ></div>

              <!-- Drag preview overlay for periods -->
              <div
                v-if="dragState.isDragging && dragState.taskId === period.id"
                class="period-drag-preview"
                :style="getPeriodDragPreviewStyle(period)"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Timeline Header -->
      <div class="timeline-header">
        <div class="task-column-header">Tasks</div>
        <div class="timeline-container">
          <!-- Timeline Dates Row -->
          <div class="timeline-dates" ref="timelineDates" :style="{ width: timelineWidth + 'px' }">
            <div
              v-for="(date, index) in timelineDates"
              :key="date.key"
              :class="[
                'date-column',
                {
                  today: date.isToday,
                  'focus-day': date.isFocusDay && currentView === 'day',
                  weekend: date.isWeekend
                }
              ]"
              :style="{ 
                width: columnWidth + 'px',
                left: (index * columnWidth) + 'px'
              }"
            >
              <div class="date-label">{{ date.label }}</div>
              <div class="date-sublabel" v-if="date.sublabel">{{ date.sublabel }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Task Rows -->
      <div class="gantt-body" ref="ganttBody">
        <!-- Full-height grid lines across all rows -->
        <div class="full-timeline-grid">
          <div
            v-for="(date, index) in timelineDates"
            :key="'full-grid-' + date.key"
            class="full-grid-column"
            :class="{
              'full-today-grid': date.isToday,
              'full-focus-day-grid': date.isFocusDay && currentView === 'day'
            }"
            :style="{
              left: (index * columnWidth) + 'px',
              width: columnWidth + 'px'
            }"
          ></div>
        </div>

        <div v-if="tasks.length === 0" class="empty-state">
          <p>No tasks to display. Add some tasks to see them on the timeline.</p>
        </div>

        <div v-else class="task-rows">
          <div
            v-for="task in visibleTasks"
            :key="task.id"
            class="task-row"
            :class="{ selected: selectedTaskId === task.id }"
            @click="selectTask(task.id)"
          >
            <!-- Task Info Column -->
            <div class="task-info" :class="`level-${task.level || 0}`" @click.stop="handleTaskClick(task)">
              <!-- Hierarchy indentation and controls -->
              <div
                class="task-hierarchy-controls"
                :style="{ paddingLeft: `${(task.level || 0) * hierarchyIndentWidth}px` }"
              >
                <!-- Hierarchy connecting lines for subtasks -->
                <div 
                  v-if="task.level > 0" 
                  class="hierarchy-lines"
                  :style="{ 
                    left: `${((task.level - 1) * hierarchyIndentWidth) + 10}px`,
                    width: `${hierarchyIndentWidth}px`
                  }"
                >
                  <!-- Vertical line from parent -->
                  <div class="hierarchy-vertical-line"></div>
                  <!-- Horizontal line to task -->
                  <div class="hierarchy-horizontal-line"></div>
                </div>

                <!-- Expand/collapse button for parent tasks -->
                <button
                  v-if="task.hasChildren"
                  @click.stop="toggleTaskExpansion(task.id)"
                  class="hierarchy-expand-btn"
                  :class="{ expanded: task.isExpanded }"
                  :title="task.isExpanded ? 'Collapse subtasks' : 'Expand subtasks'"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path :d="task.isExpanded ? 'M6 9l6 6 6-6' : 'M9 18l6-6-6-6'"></path>
                  </svg>
                </button>
                <!-- Spacer for tasks without children to maintain alignment -->
                <div v-else class="hierarchy-spacer"></div>

                <!-- Task title with hierarchy styling -->
                <div class="task-title-container">
                  <div
                    class="task-title"
                    :class="{ 
                      'has-children': task.hasChildren, 
                      'is-subtask': task.level > 0,
                      'is-parent': task.hasChildren && task.level === 0
                    }"
                  >
                    {{ task.title }}
                  </div>

                  <!-- Subtask count indicator for parent tasks -->
                  <span v-if="task.hasChildren" class="subtask-count">
                    ({{ getSubtaskCount(task.id) }} {{ getSubtaskCount(task.id) === 1 ? 'subtask' : 'subtasks' }})
                  </span>
                  
                  <!-- Subtask indicator badge -->
                  <span v-if="task.level > 0" class="subtask-badge">
                    Subtask
                  </span>
                </div>
              </div>

              <div
                class="task-meta"
                :style="{ paddingLeft: `${(task.level || 0) * hierarchyIndentWidth + 24}px` }"
              >
                <span class="task-duration">{{ getTaskDuration(task) }}</span>
                
                <!-- Quick Status Changer -->
                <div class="status-changer">
                  <select 
                    :value="task.status" 
                    @change="updateTaskStatus(task.id, $event.target.value)"
                    @click.stop
                    class="status-select"
                    :class="task.status"
                  >
                    <option value="todo">TO DO</option>
                    <option value="in-progress">IN PROGRESS</option>
                    <option value="completed">COMPLETED</option>
                    <option value="on-hold">ON HOLD</option>
                    <option value="cancelled">CANCELLED</option>
                  </select>
                </div>
                
                <!-- Hierarchy level indicator -->
                <span v-if="task.level > 0" class="hierarchy-level">L{{ task.level }}</span>
              </div>

              <!-- Days Left Indicator for Timeline -->
              <div
                v-if="getTaskDaysLeftInfo(task).show"
                class="task-days-left"
                :class="getTaskDaysLeftInfo(task).urgencyClass"
                :style="{ paddingLeft: `${(task.level || 0) * hierarchyIndentWidth + 24}px` }"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12,6 12,12 16,14"></polyline>
                </svg>
                <span>{{ getTaskDaysLeftInfo(task).message }}</span>
              </div>
            </div>

            <!-- Timeline Column -->
            <div class="task-timeline" :style="{ width: timelineWidth + 'px' }">
              <!-- Drag preview overlay -->
              <div
                v-if="dragState.isDragging && dragState.taskId === task.id"
                class="drag-preview"
                :style="getDragPreviewStyle(task)"
              ></div>

              <!-- Task Bar -->
              <div
                v-if="isTaskVisible(task)"
                class="task-bar"
                :class="[
                  'priority-' + task.priority,
                  {
                    overdue: isTaskOverdue(task),
                    dragging: dragState.taskId === task.id,
                    'drag-disabled': task.status === 'completed',
                    'spans-multiple-days':
                      currentView === 'day' &&
                      getTaskDuration(task).includes('day') &&
                      !getTaskDuration(task).includes('1 day')
                  }
                ]"
                :style="getTaskBarStyle(task)"
                @click.stop="handleTaskClick(task)"
                @mousedown="startDrag($event, task, 'move')"
                :title="getTaskTooltip(task)"
              >
                <!-- Left resize handle -->
                <div
                  v-if="task.status !== 'completed'"
                  class="resize-handle resize-handle-left"
                  @mousedown.stop="startDrag($event, task, 'resize-left')"
                  title="Drag to change start date"
                ></div>

                <div class="task-bar-content">
                  <span class="task-bar-title" @click.stop="handleTaskClick(task)">{{ task.title }}</span>
                  <span class="task-bar-progress" v-if="task.status === 'in-progress'">
                    {{ getTaskProgress(task) }}%
                  </span>
                </div>

                <!-- Progress overlay for in-progress tasks -->
                <div
                  v-if="task.status === 'in-progress'"
                  class="task-progress-overlay"
                  :style="{ width: getTaskProgress(task) + '%' }"
                ></div>

                <!-- Right resize handle -->
                <div
                  v-if="task.status !== 'completed'"
                  class="resize-handle resize-handle-right"
                  @mousedown.stop="startDrag($event, task, 'resize-right')"
                  title="Drag to change end date"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Dependency Arrows Layer -->
        <div class="dependency-arrows" v-if="showDependencyArrows">
          <svg
            class="dependency-svg"
            :style="{ width: timelineWidth + 250 + 'px', height: visibleTasks.length * 50 + 'px' }"
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#007bff" />
              </marker>
            </defs>

            <path
              v-for="arrow in dependencyArrows"
              :key="arrow.id"
              :d="arrow.path"
              stroke="#007bff"
              stroke-width="2"
              fill="none"
              marker-end="url(#arrowhead)"
              class="dependency-arrow"
            />
          </svg>
        </div>
      </div>
    </div>

    <!-- Project Period Modal -->
    <div v-if="showPeriodModal" class="modal-overlay" @click="closePeriodModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ isEditingPeriod ? 'Edit Project Period' : 'Add Project Period' }}</h3>
          <button class="modal-close" @click="closePeriodModal">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="savePeriod">
            <div class="form-group">
              <label for="periodTitle">Period Title *</label>
              <input
                id="periodTitle"
                v-model="periodForm.title"
                type="text"
                placeholder="e.g., Planning Phase"
                required
                maxlength="50"
              />
            </div>

            <div class="form-group">
              <label for="periodDescription">Description</label>
              <textarea
                id="periodDescription"
                v-model="periodForm.description"
                placeholder="Brief description of this project period..."
                rows="3"
                maxlength="200"
              ></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="periodStartDate">Start Date *</label>
                <input
                  id="periodStartDate"
                  v-model="periodForm.startDate"
                  type="date"
                  required
                />
              </div>

              <div class="form-group">
                <label for="periodEndDate">End Date *</label>
                <input
                  id="periodEndDate"
                  v-model="periodForm.endDate"
                  type="date"
                  required
                />
              </div>
            </div>

            <div class="form-actions">
              <button type="button" @click="closePeriodModal" class="btn-secondary">
                Cancel
              </button>
              <button type="submit" class="btn-primary" :disabled="!isFormValid">
                {{ isEditingPeriod ? 'Update Period' : 'Add Period' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GanttChart',
  props: {
    tasks: {
      type: Array,
      default: () => []
    },
    selectedTaskId: {
      type: String,
      default: null
    },
    projectPeriods: {
      type: Array,
      default: () => []
    }
  },
  emits: ['task-select', 'task-edit', 'task-update', 'task-update-preview', 'task-drag-cancelled', 'periods-update'],
  data() {
    return {
      currentView: 'week',
      viewModes: [
        { value: 'day', label: 'Day' },
        { value: 'week', label: 'Week' },
        { value: 'month', label: 'Month' }
      ],
      currentDate: new Date(),
      timelineStart: null,
      timelineEnd: null,
      // Filter properties
      dateRangeFilter: 'all',
      customDateStart: '',
      customDateEnd: '',
      statusFilter: 'all',
      priorityFilter: 'all',
      filteredTasks: [],
      // Hierarchy management
      expandedTasks: new Set(),
      showSubtasks: true,
      hierarchyIndentWidth: 20,
      // Manual navigation override
      manualNavigation: false,
      dragState: {
        isDragging: false,
        taskId: null,
        dragType: null, // 'move', 'resize-left', 'resize-right'
        startX: 0,
        currentX: 0, // Add current mouse position
        originalStartDate: null,
        originalEndDate: null,
        initialLeft: 0,
        initialWidth: 0,
        hasMoved: false // Track if actual dragging occurred
      },
      justFinishedDrag: false,
      // Screen width for responsive column sizing
      screenWidth: typeof window !== 'undefined' ? window.innerWidth : 1200,
      // Local project periods fallback
      localProjectPeriods: [],
      showPeriodModal: false,
      isEditingPeriod: false,
      periodForm: {
        title: '',
        description: '',
        startDate: '',
        endDate: ''
      },
      colorPresets: [
        '#007bff',
        '#28a745',
        '#dc3545',
        '#6f42c1',
        '#fd7e14',
        '#20c997',
        '#e83e8c',
        '#17a2b8',
        '#795548',
        '#9c27b0',
        '#ff5722',
        '#3f51b5',
        '#4caf50',
        '#ff9800',
        '#607d8b',
        '#f44336',
        '#2196f3',
        '#8bc34a',
        '#ff6f00',
        '#673ab7'
      ]
    }
  },
  computed: {
    activeProjectPeriods() {
      // Use local data if we have any, or if parent hasn't provided non-empty periods
      return this.localProjectPeriods.length > 0 ? this.localProjectPeriods : this.projectPeriods
    },

    visibleTasks() {
      const tasksWithDates = this.tasks.filter(task => task.startDate && task.endDate)
      const filteredTasks = this.applyAllFilters(tasksWithDates)

      // Build hierarchical task structure
      return this.buildHierarchicalTaskList(filteredTasks)
    },

    // Add new computed property for hierarchy management
    hierarchicalTasks() {
      // Group tasks by hierarchy level
      const rootTasks = this.tasks.filter(task => !task.parentTask)
      const taskMap = new Map()

      // Create a map for quick lookup
      this.tasks.forEach(task => {
        taskMap.set(task.id, {
          ...task,
          children: [],
          level: 0,
          isExpanded: this.expandedTasks.has(task.id)
        })
      })

      // Build parent-child relationships
      this.tasks.forEach(task => {
        if (task.parentTask) {
          const parent = taskMap.get(task.parentTask)
          const child = taskMap.get(task.id)
          if (parent && child) {
            child.level = (parent.level || 0) + 1
            parent.children.push(child)
          }
        }
      })

      return Array.from(taskMap.values()).filter(task => !task.parentTask)
    },
    columnWidth() {
      // Calculate available width for timeline columns
      const taskInfoWidth =
        this.screenWidth < 576
          ? 150
          : this.screenWidth < 768
            ? 180
            : this.screenWidth < 992
              ? 200
              : this.screenWidth < 1200
                ? 220
                : 280

      const availableWidth = this.screenWidth - taskInfoWidth - 40 // 40px for scrollbar and padding
      const numberOfColumns = this.timelineDates.length

      if (numberOfColumns === 0) return 50

      // Calculate width per column, with minimum widths
      const calculatedWidth = availableWidth / numberOfColumns

      // Set minimum column widths based on view
      const minWidth = {
        day: 35,
        week: 25,
        month: 20
      }

      const minColumnWidth = minWidth[this.currentView] || 30

      // Use calculated width but ensure it's not too small
      return Math.max(calculatedWidth, minColumnWidth)
    },
    timelineRange() {
      // If manually navigating, use currentDate as the center point
      if (this.manualNavigation) {
        const centerDate = new Date(this.currentDate)
        let startOffset, endOffset

        switch (this.currentView) {
          case 'day':
            // Show only the selected day
            startOffset = 0
            endOffset = 0
            break
          case 'week':
            // Show exactly 7 days (3 before, current day, 3 after)
            startOffset = 3
            endOffset = 3
            break
          case 'month':
            // Show about 31 days (15 before, current day, 15 after)
            startOffset = 15
            endOffset = 15
            break
          default:
            startOffset = 3
            endOffset = 3
        }

        return {
          start: new Date(centerDate.getTime() - startOffset * 24 * 60 * 60 * 1000),
          end: new Date(centerDate.getTime() + endOffset * 24 * 60 * 60 * 1000)
        }
      }

      // Default behavior: base on current date with view-specific ranges
      const today = new Date()
      let startDays, endDays

      switch (this.currentView) {
        case 'day':
          // Show only today
          startDays = 0
          endDays = 0
          break
        case 'week':
          // Show exactly 7 days centered on today
          startDays = 3
          endDays = 3
          break
        case 'month':
          // Show about 31 days centered on today
          startDays = 15
          endDays = 15
          break
        default:
          startDays = 3
          endDays = 3
      }

      return {
        start: new Date(today.getFullYear(), today.getMonth(), today.getDate() - startDays),
        end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + endDays)
      }
    },
    timelineDates() {
      const dates = []
      const { start, end } = this.timelineRange
      const current = new Date(start)
      const today = new Date()

      // In day view with manual navigation, the focus day is currentDate instead of today
      const focusDay =
        this.currentView === 'day' && this.manualNavigation ? new Date(this.currentDate) : today

      while (current <= end) {
        const isToday = current.toDateString() === today.toDateString()
        const isFocusDay = current.toDateString() === focusDay.toDateString()
        const isWeekend = current.getDay() === 0 || current.getDay() === 6

        let label, sublabel
        if (this.currentView === 'day') {
          label = current.getDate().toString()
          sublabel = current.toLocaleDateString('en-US', { weekday: 'short' })
        } else if (this.currentView === 'week') {
          label = current.getDate().toString()
          sublabel = current.toLocaleDateString('en-US', { weekday: 'short' })
        } else {
          // month
          label = current.getDate().toString()
          if (current.getDate() === 1) {
            sublabel = current.toLocaleDateString('en-US', { month: 'short' })
          }
        }

        dates.push({
          key: current.toISOString(),
          date: new Date(current),
          label,
          sublabel,
          isToday,
          isFocusDay, // Add focus day indicator for day view
          isWeekend
        })

        current.setDate(current.getDate() + 1)
      }

      return dates
    },
    timelineWidth() {
      // Use full available width instead of calculating per column
      const taskInfoWidth =
        this.screenWidth < 576
          ? 150
          : this.screenWidth < 768
            ? 180
            : this.screenWidth < 992
              ? 200
              : this.screenWidth < 1200
                ? 220
                : 280

      return this.screenWidth - taskInfoWidth - 40 // 40px for padding and scrollbar
    },
    showDependencyArrows() {
      return this.visibleTasks.some(task => task.dependencies && task.dependencies.length > 0)
    },
    dependencyArrows() {
      const arrows = []

      this.visibleTasks.forEach((task, taskIndex) => {
        if (!task.dependencies || task.dependencies.length === 0)
          return task.dependencies.forEach(dependency => {
            const fromTask = this.visibleTasks.find(t => t.id === dependency.fromTaskId)
            if (!fromTask) return

            const fromTaskIndex = this.visibleTasks.findIndex(t => t.id === dependency.fromTaskId)
            if (fromTaskIndex === -1) return

            const arrow = this.calculateArrowPath(
              fromTask,
              fromTaskIndex,
              task,
              taskIndex,
              dependency.type
            )
            if (arrow) {
              arrows.push({
                id: `${dependency.fromTaskId}-${task.id}`,
                ...arrow
              })
            }
          })
      })

      return arrows
    },
    isFormValid() {
      return this.periodForm.title.trim() !== '' && this.periodForm.startDate && this.periodForm.endDate
    }
  },
  methods: {
    selectTask(taskId) {
      this.$emit('task-select', taskId)
    },
    editTask(task) {
      this.$emit('task-edit', task)
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
    getTaskDuration(task) {
      if (!task.startDate || !task.endDate) return ''
      const start = new Date(task.startDate)
      const end = new Date(task.endDate)
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
      return days === 1 ? '1 day' : `${days} days`
    },
    isTaskVisible(task) {
      if (!task.startDate || !task.endDate) return false
      const taskStart = new Date(task.startDate)
      const taskEnd = new Date(task.endDate)
      const { start, end } = this.timelineRange

      // For day view, show any task that is active on the visible day
      if (this.currentView === 'day') {
        const viewDay = new Date(start)
        viewDay.setHours(0, 0, 0, 0)
        const taskStartDay = new Date(taskStart)
        taskStartDay.setHours(0, 0, 0, 0)
        const taskEndDay = new Date(taskEnd)
        taskEndDay.setHours(0, 0, 0, 0)

        // Task is visible if it's active on the view day
        return taskStartDay <= viewDay && taskEndDay >= viewDay
      }

      // For other views, use the original logic
      return taskEnd >= start && taskStart <= end
    },
    isTaskOverdue(task) {
      if (task.status === 'completed') return false
      const today = new Date()
      const taskEnd = new Date(task.endDate)
      return taskEnd < today
    },
    getTaskBarStyle(task) {
      const taskStart = new Date(task.startDate)
      const taskEnd = new Date(task.endDate)

      // Special handling for day view
      if (this.currentView === 'day') {
        const { start } = this.timelineRange
        const viewDay = new Date(start)
        viewDay.setHours(0, 0, 0, 0)
        const taskStartDay = new Date(taskStart)
        taskStartDay.setHours(0, 0, 0, 0)
        const taskEndDay = new Date(taskEnd)
        taskEndDay.setHours(0, 0, 0, 0)

        // If task is active on the view day, show it spanning the full day column
        if (taskStartDay <= viewDay && taskEndDay >= viewDay) {
          return {
            left: '0px',
            width: this.columnWidth + 'px',
            backgroundColor: this.getTaskColor(task)
          }
        }
        return { left: '0px', width: '0px' } // Hide if not active
      }

      // Find the start and end column indices that match the date columns
      let startColumnIndex = -1
      let endColumnIndex = -1

      this.timelineDates.forEach((dateCol, index) => {
        const colDate = new Date(dateCol.date)
        colDate.setHours(0, 0, 0, 0)

        const taskStartDate = new Date(taskStart)
        taskStartDate.setHours(0, 0, 0, 0)

        const taskEndDate = new Date(taskEnd)
        taskEndDate.setHours(0, 0, 0, 0)

        // Find start column
        if (startColumnIndex === -1 && colDate >= taskStartDate) {
          startColumnIndex = Math.max(0, index)
        }

        // Find end column
        if (colDate <= taskEndDate) {
          endColumnIndex = index
        }
      })

      // If task starts before visible range, start at column 0
      if (startColumnIndex === -1) startColumnIndex = 0

      // If task ends after visible range, end at last column
      if (endColumnIndex === -1) endColumnIndex = this.timelineDates.length - 1

      // Ensure we have at least one column width
      if (endColumnIndex < startColumnIndex) endColumnIndex = startColumnIndex

      // Calculate position using the same pixel-based system as periods and dates
      const leftPosition = startColumnIndex * this.columnWidth
      const width = (endColumnIndex - startColumnIndex + 1) * this.columnWidth

      return {
        left: leftPosition + 'px',
        width: width + 'px',
        backgroundColor: this.getTaskColor(task)
      }
    },

    getTaskColor(task) {
      // If task has a custom color, use it
      if (task.color) {
        return task.color
      }

      // Generate a unique color based on task ID
      const colors = [
        '#007bff', // Blue
        '#28a745', // Green  
        '#dc3545', // Red
        '#6f42c1', // Purple
        '#fd7e14', // Orange
        '#20c997', // Teal
        '#e83e8c', // Pink
        '#17a2b8', // Cyan
        '#795548', // Brown
        '#9c27b0', // Magenta
        '#ff5722', // Deep Orange
        '#3f51b5', // Indigo
        '#4caf50', // Light Green
        '#ff9800', // Amber
        '#607d8b', // Blue Gray
        '#f44336', // Deep Red
        '#2196f3', // Light Blue
        '#8bc34a', // Lime
        '#ff6f00', // Orange accent
        '#673ab7'  // Deep Purple
      ]

      // Use task ID to consistently assign the same color to the same task
      const hashCode = task.id.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0)
        return a & a
      }, 0)
      
      const colorIndex = Math.abs(hashCode) % colors.length
      return colors[colorIndex]
    },
    getTaskTooltip(task) {
      const start = new Date(task.startDate).toLocaleDateString()
      const end = new Date(task.endDate).toLocaleDateString()

      if (this.currentView === 'day') {
        const taskStart = new Date(task.startDate)
        const taskEnd = new Date(task.endDate)
        const { start: viewStart } = this.timelineRange
        const viewDay = new Date(viewStart)

        // Check if task spans multiple days
        const taskDuration = Math.ceil((taskEnd - taskStart) / (1000 * 60 * 60 * 24)) + 1

        if (taskDuration > 1) {
          return `${task.title}\nFull Duration: ${start} - ${end} (${taskDuration} days)\nActive on: ${viewDay.toLocaleDateString()}\nStatus: ${this.formatStatus(task.status)}\nPriority: ${task.priority}`
        }
      }

      return `${task.title}\n${start} - ${end}\nStatus: ${this.formatStatus(task.status)}\nPriority: ${task.priority}`
    },
    getTaskProgress(task) {
      // Simple progress calculation based on time elapsed
      if (task.status === 'completed') return 100
      if (task.status === 'todo') return 0

      const now = new Date()
      const start = new Date(task.startDate)
      const end = new Date(task.endDate)

      if (now <= start) return 0
      if (now >= end) return 100

      const totalDuration = end - start
      const elapsed = now - start
      return Math.round((elapsed / totalDuration) * 100)
    },
    goToPreviousPeriod() {
      this.manualNavigation = true
      const days = this.currentView === 'month' ? 30 : this.currentView === 'week' ? 7 : 1
      this.currentDate.setDate(this.currentDate.getDate() - days)
      this.currentDate = new Date(this.currentDate)
    },
    goToNextPeriod() {
      this.manualNavigation = true
      const days = this.currentView === 'month' ? 30 : this.currentView === 'week' ? 7 : 1
      this.currentDate.setDate(this.currentDate.getDate() + days)
      this.currentDate = new Date(this.currentDate)
    },
    goToToday() {
      this.manualNavigation = false // Reset to auto mode when going to today
      this.currentDate = new Date()
    },

    // Project Period Methods
    savePeriodsToLocalStorage() {
      console.log('=== savePeriodsToLocalStorage called ===')
      try {
        const projectId = this.$store.state.currentProject?.id
        console.log('Current project ID for saving:', projectId)
        if (!projectId) {
          console.warn('No current project ID available for saving periods')
          return // Don't save if no project ID
        }
        const key = `gantt-project-periods-${projectId}`
        console.log('Saving periods with key:', key)
        console.log('Periods to save:', this.localProjectPeriods.length, 'periods')
        console.log('Period data:', this.localProjectPeriods)
        localStorage.setItem(key, JSON.stringify(this.localProjectPeriods))
        console.log('✅ Successfully saved periods to localStorage for project:', projectId)
      } catch (error) {
        console.warn('❌ Failed to save periods to localStorage:', error)
      }
    },

    loadPeriodsFromLocalStorage() {
      console.log('=== loadPeriodsFromLocalStorage called ===')
      try {
        const projectId = this.$store.state.currentProject?.id
        console.log('Current project ID:', projectId)
        if (!projectId) {
          console.warn('No current project ID available for loading periods - NOT clearing existing periods')
          return // Don't clear existing periods if no project ID
        }
        const key = `gantt-project-periods-${projectId}`
        console.log('Loading periods with key:', key)
        const saved = localStorage.getItem(key)
        console.log('Raw localStorage data:', saved)
        if (saved) {
          this.localProjectPeriods = JSON.parse(saved)
          console.log('✅ Loaded periods from localStorage for project:', projectId, this.localProjectPeriods.length, 'periods')
          console.log('Loaded periods:', this.localProjectPeriods)
        } else {
          this.localProjectPeriods = []
          console.log('📋 No saved periods found for project:', projectId)
        }
      } catch (error) {
        console.warn('❌ Failed to load periods from localStorage:', error)
        this.localProjectPeriods = []
      }
    },

    getNextPeriodColor(periods = this.activeProjectPeriods) {
      // Automatically assign colors in sequence
      const colorIndex = periods.length % this.colorPresets.length
      return this.colorPresets[colorIndex]
    },

    addProjectPeriod() {
      this.showPeriodModal = true
      this.isEditingPeriod = false
      
      // Set default dates
      const today = new Date()
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      
      this.periodForm = {
        title: '',
        description: '',
        startDate: today.toISOString().split('T')[0],
        endDate: nextWeek.toISOString().split('T')[0]
      }
    },

    editPeriod(period) {
      this.showPeriodModal = true
      this.isEditingPeriod = true
      this.periodForm = {
        id: period.id,
        title: period.title,
        description: period.description,
        startDate: new Date(period.startDate).toISOString().split('T')[0],
        endDate: new Date(period.endDate).toISOString().split('T')[0]
      }
    },

    removePeriod(periodId) {
      if (confirm('Are you sure you want to remove this period?')) {
        const updatedPeriods = this.activeProjectPeriods.filter(p => p.id !== periodId)
        
        // Always update local data
        this.localProjectPeriods = updatedPeriods
        this.savePeriodsToLocalStorage()
        
        // Also emit to parent
        this.$emit('periods-update', updatedPeriods)
      }
    },

    getPeriodStyle(period) {
      const periodStart = new Date(period.startDate)
      const periodEnd = new Date(period.endDate)
      const { start: timelineStart, end: timelineEnd } = this.timelineRange
      
      // Find the start and end column indices that match the date columns
      let startColumnIndex = -1
      let endColumnIndex = -1

      this.timelineDates.forEach((dateCol, index) => {
        const colDate = new Date(dateCol.date)
        colDate.setHours(0, 0, 0, 0)

        const periodStartDate = new Date(periodStart)
        periodStartDate.setHours(0, 0, 0, 0)

        const periodEndDate = new Date(periodEnd)
        periodEndDate.setHours(0, 0, 0, 0)

        // Find start column
        if (startColumnIndex === -1 && colDate >= periodStartDate) {
          startColumnIndex = Math.max(0, index)
        }

        // Find end column
        if (colDate <= periodEndDate) {
          endColumnIndex = index
        }
      })

      // If period starts before visible range, start at column 0
      if (startColumnIndex === -1) startColumnIndex = 0

      // If period ends after visible range, end at last column
      if (endColumnIndex === -1) endColumnIndex = this.timelineDates.length - 1

      // Ensure we have at least one column width
      if (endColumnIndex < startColumnIndex) endColumnIndex = startColumnIndex

      // Calculate position using the same column width as timeline dates
      const leftPosition = startColumnIndex * this.columnWidth
      const width = (endColumnIndex - startColumnIndex + 1) * this.columnWidth
      
      return {
        position: 'absolute',
        left: leftPosition + 'px',
        width: width + 'px',
        backgroundColor: period.color,
        borderRadius: '4px',
        minWidth: '60px',
        height: '100%'
      }
    },

    // Drag and Drop Methods
    startDrag(event, task, dragType) {
      if (task.status === 'completed') return // Don't allow dragging completed tasks

      event.preventDefault()
      this.dragState = {
        isDragging: true,
        taskId: task.id,
        dragType,
        startX: event.clientX,
        currentX: event.clientX, // Initialize current position
        originalStartDate: new Date(task.startDate),
        originalEndDate: new Date(task.endDate),
        initialLeft: parseFloat(this.getTaskBarStyle(task).left),
        initialWidth: parseFloat(this.getTaskBarStyle(task).width),
        hasMoved: false // Track if actual dragging occurred
      }

      document.addEventListener('mousemove', this.handleDrag)
      document.addEventListener('mouseup', this.endDrag)
      document.addEventListener('keydown', this.handleKeyDuringDrag)
      document.body.style.cursor = dragType === 'move' ? 'grabbing' : 'col-resize'
      document.body.style.userSelect = 'none'
    },

    handleDrag(event) {
      if (!this.dragState.isDragging) return

      // Store current mouse position for drag preview
      this.dragState.currentX = event.clientX

      const deltaX = event.clientX - this.dragState.startX
      
      // Only consider it a real drag if mouse moved more than 5 pixels
      if (Math.abs(deltaX) > 5) {
        this.dragState.hasMoved = true
      }

      // Snap to grid for smoother experience
      const deltaDays = Math.round(deltaX / this.columnWidth)

      // Check if we're dragging a task or a period
      const task = this.tasks.find(t => t.id === this.dragState.taskId)
      const period = this.activeProjectPeriods.find(p => p.id === this.dragState.taskId)

      if (task) {
        // Handle task dragging
        let newStartDate = new Date(this.dragState.originalStartDate)
        let newEndDate = new Date(this.dragState.originalEndDate)

        switch (this.dragState.dragType) {
          case 'move':
            // Move both start and end dates
            newStartDate.setDate(newStartDate.getDate() + deltaDays)
            newEndDate.setDate(newEndDate.getDate() + deltaDays)
            break

          case 'resize-left':
            // Change start date only
            newStartDate.setDate(newStartDate.getDate() + deltaDays)
            // Ensure start date doesn't go past end date (minimum 1 day duration)
            if (newStartDate >= newEndDate) {
              newStartDate = new Date(newEndDate)
              newStartDate.setDate(newStartDate.getDate() - 1)
            }
            break

          case 'resize-right':
            // Change end date only
            newEndDate.setDate(newEndDate.getDate() + deltaDays)
            // Ensure end date doesn't go before start date (minimum 1 day duration)
            if (newEndDate <= newStartDate) {
              newEndDate = new Date(newStartDate)
              newEndDate.setDate(newEndDate.getDate() + 1)
            }
            break
        }

        // Update task temporarily for visual feedback
        const updates = {
          startDate: newStartDate.toISOString().split('T')[0],
          endDate: newEndDate.toISOString().split('T')[0]
        }

        this.$emit('task-update-preview', { id: task.id, updates })
      } else if (period) {
        // Handle period dragging - just visual feedback, update happens in endDrag
        // The visual feedback is handled by getPeriodDragPreviewStyle
      }
    },

    endDrag(event) {
      if (!this.dragState.isDragging) return

      // Check if we're dragging a task or a period
      const task = this.tasks.find(t => t.id === this.dragState.taskId)
      const period = this.activeProjectPeriods.find(p => p.id === this.dragState.taskId)

      if (task && this.dragState.hasMoved) {
        // Handle task drag end
        const deltaX = event.clientX - this.dragState.startX
        const deltaDays = Math.round(deltaX / this.columnWidth)

        let newStartDate = new Date(this.dragState.originalStartDate)
        let newEndDate = new Date(this.dragState.originalEndDate)

        switch (this.dragState.dragType) {
          case 'move':
            newStartDate.setDate(newStartDate.getDate() + deltaDays)
            newEndDate.setDate(newEndDate.getDate() + deltaDays)
            break

          case 'resize-left':
            newStartDate.setDate(newStartDate.getDate() + deltaDays)
            if (newStartDate >= newEndDate) {
              newStartDate = new Date(newEndDate)
              newStartDate.setDate(newStartDate.getDate() - 1)
            }
            break

          case 'resize-right':
            newEndDate.setDate(newEndDate.getDate() + deltaDays)
            if (newEndDate <= newStartDate) {
              newEndDate = new Date(newStartDate)
              newEndDate.setDate(newEndDate.getDate() + 1)
            }
            break
        }

        const updates = {
          startDate: newStartDate.toISOString().split('T')[0],
          endDate: newEndDate.toISOString().split('T')[0]
        }

        this.$emit('task-update', { id: task.id, updates })
      } else if (period && this.dragState.hasMoved) {
        // Handle period drag end
        const deltaX = event.clientX - this.dragState.startX
        const deltaDays = Math.round(deltaX / this.columnWidth)

        let newStartDate = new Date(this.dragState.originalStartDate)
        let newEndDate = new Date(this.dragState.originalEndDate)

        switch (this.dragState.dragType) {
          case 'move':
            newStartDate.setDate(newStartDate.getDate() + deltaDays)
            newEndDate.setDate(newEndDate.getDate() + deltaDays)
            break

          case 'resize-left':
            newStartDate.setDate(newStartDate.getDate() + deltaDays)
            if (newStartDate >= newEndDate) {
              newStartDate = new Date(newEndDate)
              newStartDate.setDate(newStartDate.getDate() - 1)
            }
            break

          case 'resize-right':
            newEndDate.setDate(newEndDate.getDate() + deltaDays)
            if (newEndDate <= newStartDate) {
              newEndDate = new Date(newStartDate)
              newEndDate.setDate(newEndDate.getDate() + 1)
            }
            break
        }

        // Update the period directly
        const periodIndex = this.activeProjectPeriods.findIndex(p => p.id === period.id)
        if (periodIndex !== -1) {
          const updatedPeriods = [...this.activeProjectPeriods]
          updatedPeriods[periodIndex] = {
            ...period,
            startDate: newStartDate.toISOString(),
            endDate: newEndDate.toISOString()
          }
          
          // Always update local data
          this.localProjectPeriods = updatedPeriods
          this.savePeriodsToLocalStorage()
          
          // Also emit to parent
          this.$emit('periods-update', updatedPeriods)
        }
      }
      
      this.cleanupDrag()
    },

    handleTaskClick(task) {
      console.log('handleTaskClick called with task:', task.title)
      console.log('justFinishedDrag:', this.justFinishedDrag)
      // Prevent opening task form if we just finished dragging
      if (this.justFinishedDrag) {
        console.log('Click ignored due to recent drag')
        this.justFinishedDrag = false
        return
      }
      console.log('About to emit task-edit event')
      this.editTask(task)
    },

    handleKeyDuringDrag(event) {
      if (event.key === 'Escape' && this.dragState.isDragging) {
        // Cancel drag operation
        this.cleanupDrag()
        // Optionally emit a cancel event
        this.$emit('task-drag-cancelled')
      }
    },
    cleanupDrag() {
      // Set flag to prevent click event only if actual dragging occurred
      const wasActuallyDragging = this.dragState.isDragging && this.dragState.hasMoved
      
      // Clean up
      this.dragState = {
        isDragging: false,
        taskId: null,
        dragType: null,
        startX: 0,
        currentX: 0, // Reset current position
        originalStartDate: null,
        originalEndDate: null,
        initialLeft: 0,
        initialWidth: 0,
        hasMoved: false // Reset hasMoved flag
      }

      document.removeEventListener('mousemove', this.handleDrag)
      document.removeEventListener('mouseup', this.endDrag)
      document.removeEventListener('keydown', this.handleKeyDuringDrag)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''

      // Only set justFinishedDrag AFTER cleaning up dragState and only if actual dragging occurred
      this.justFinishedDrag = wasActuallyDragging

      // Clear the flag after a short delay to allow for normal clicks
      if (this.justFinishedDrag) {
        console.log('Setting justFinishedDrag timeout')
        setTimeout(() => {
          console.log('Clearing justFinishedDrag')
          this.justFinishedDrag = false
        }, 100)
      }
    },

    getDragPreviewStyle(task) {
      if (!this.dragState.isDragging) return {}

      // Calculate the current drag offset in pixels
      const currentDeltaX = this.dragState.currentX - this.dragState.startX

      // Get the original task bar style (which returns percentages)
      const originalStyle = this.getTaskBarStyle(task)

      // Just use the percentage-based positioning directly with the drag offset
      const originalLeftPercent = parseFloat(originalStyle.left)
      const originalWidthPercent = parseFloat(originalStyle.width)

      // Convert current drag offset to percentage of timeline
      // Use the actual column count and column width for accurate calculation
      const totalTimelineWidth = this.timelineDates.length * this.columnWidth
      const dragOffsetPercent = (currentDeltaX / totalTimelineWidth) * 100

      // Calculate new position based on drag type
      let newLeftPercent = originalLeftPercent
      let newWidthPercent = originalWidthPercent

      switch (this.dragState.dragType) {
        case 'move':
          // Move the entire bar
          newLeftPercent += dragOffsetPercent
          break

        case 'resize-left':
          // Resize from the left side
          newLeftPercent += dragOffsetPercent
          newWidthPercent -= dragOffsetPercent
          // Ensure minimum width (at least one column)
          const minWidthPercent = (this.columnWidth / totalTimelineWidth) * 100
          if (newWidthPercent < minWidthPercent) {
            newWidthPercent = minWidthPercent
            newLeftPercent = originalLeftPercent + originalWidthPercent - minWidthPercent
          }
          break

        case 'resize-right':
          // Resize from the right side
          newWidthPercent += dragOffsetPercent
          // Ensure minimum width
          const minWidth = (this.columnWidth / totalTimelineWidth) * 100
          if (newWidthPercent < minWidth) {
            newWidthPercent = minWidth
          }
          break
      }

      // Ensure the preview doesn't go outside timeline bounds
      if (newLeftPercent < 0) newLeftPercent = 0
      if (newLeftPercent + newWidthPercent > 100) {
        if (this.dragState.dragType === 'move') {
          newLeftPercent = 100 - newWidthPercent
        } else {
          newWidthPercent = 100 - newLeftPercent
        }
      }

      return {
        left: newLeftPercent + '%',
        width: newWidthPercent + '%',
        opacity: 0.7,
        zIndex: 1000,
        position: 'absolute',
        height: '24px',
        background: 'rgba(33, 150, 243, 0.8)',
        borderRadius: '4px',
        pointerEvents: 'none'
      }
    },

    calculateArrowPath(fromTask, fromTaskIndex, toTask, toTaskIndex, dependencyType) {
      // Get task bar positions
      const fromTaskStyle = this.getTaskBarStyle(fromTask)
      const toTaskStyle = this.getTaskBarStyle(toTask)

      const fromLeft = parseFloat(fromTaskStyle.left) + 250 // Account for task info column
      const fromWidth = parseFloat(fromTaskStyle.width)
      const toLeft = parseFloat(toTaskStyle.left) + 250

      const rowHeight = 50
      const fromY = fromTaskIndex * rowHeight + 25 // Center of task bar
      const toY = toTaskIndex * rowHeight + 25

      let startX, endX

      // Calculate connection points based on dependency type
      switch (dependencyType) {
        case 'finish-to-start':
          startX = fromLeft + fromWidth // End of from task
          endX = toLeft // Start of to task
          break
        case 'start-to-start':
          startX = fromLeft // Start of from task
          endX = toLeft // Start of to task
          break
        case 'finish-to-finish':
          startX = fromLeft + fromWidth // End of from task
          endX = toLeft + parseFloat(toTaskStyle.width) // End of to task
          break
        case 'start-to-finish':
          startX = fromLeft // Start of from task
          endX = toLeft + parseFloat(toTaskStyle.width) // End of to task
          break
        default:
          startX = fromLeft + fromWidth
          endX = toLeft
      }

      // Create path with smooth curves
      const midX = (startX + endX) / 2
      const controlOffset = Math.abs(endX - startX) * 0.3

      let path
      if (Math.abs(toY - fromY) < 10) {
        // Same row - simple horizontal line
        path = `M ${startX} ${fromY} L ${endX - 5} ${toY}`
      } else {
        // Different rows - curved line
        path = `M ${startX} ${fromY} 
                C ${startX + controlOffset} ${fromY}, 
                  ${endX - controlOffset} ${toY}, 
                  ${endX - 5} ${toY}`
      }

      return { path }
    },

    // Filter Methods
    applyAllFilters(tasks) {
      let filtered = [...tasks]

      // Apply date range filter
      filtered = this.applyDateRangeFilter(filtered)

      // Apply status filter
      if (this.statusFilter !== 'all') {
        filtered = filtered.filter(task => task.status === this.statusFilter)
      }

      // Apply priority filter
      if (this.priorityFilter !== 'all') {
        filtered = filtered.filter(task => task.priority === this.priorityFilter)
      }

      return filtered
    },

    applyDateRangeFilter(tasks) {
      if (this.dateRangeFilter === 'all') {
        return tasks
      }

      const now = new Date()
      let startDate, endDate

      switch (this.dateRangeFilter) {
        case 'week':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
          endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
          break
        case 'quarter':
          const quarter = Math.floor(now.getMonth() / 3)
          startDate = new Date(now.getFullYear(), quarter * 3, 1)
          endDate = new Date(now.getFullYear(), quarter * 3 + 3, 0)
          break
        case 'custom':
          if (this.customDateStart && this.customDateEnd) {
            startDate = new Date(this.customDateStart)
            endDate = new Date(this.customDateEnd)
          } else {
            return tasks // Return all if custom dates not set
          }
          break
        default:
          return tasks
      }

      return tasks.filter(task => {
        const taskStart = new Date(task.startDate)
        const taskEnd = new Date(task.endDate)

        // Task overlaps with filter range
        return taskEnd >= startDate && taskStart <= endDate
      })
    },

    applyDateFilter() {
      // Called when date range filter changes
      this.$nextTick(() => {
        this.$forceUpdate()
      })
    },

    applyFilters() {
      // Called when status or priority filters change
      this.$nextTick(() => {
        this.$forceUpdate()
      })
    },

    clearAllFilters() {
      this.dateRangeFilter = 'all'
      this.statusFilter = 'all'
      this.priorityFilter = 'all'
      this.customDateStart = ''
      this.customDateEnd = ''

      this.$nextTick(() => {
        this.$forceUpdate()
      })
    },

    getTaskDaysLeftInfo(task) {
      // Don't show for completed or cancelled tasks
      if (task.status === 'completed' || task.status === 'cancelled') {
        return { show: false }
      }

      if (!task.endDate) {
        return { show: false }
      }

      const today = new Date()
      const endDate = new Date(task.endDate)

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
          message: `${overdueDays}d overdue`,
          urgencyClass: 'urgent'
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
          urgencyClass: 'due-soon'
        }
      } else {
        // Due in more than a week - don't show to avoid clutter
        return { show: false }
      }
    },

    // Add new method for building hierarchical task list
    buildHierarchicalTaskList(tasks) {
      const result = []
      const taskMap = new Map()

      // Create task map with hierarchy metadata
      tasks.forEach(task => {
        taskMap.set(task.id, {
          ...task,
          level: task.level || 0,
          hierarchyPath: task.hierarchyPath || [],
          isExpanded: this.expandedTasks.has(task.id),
          hasChildren: false
        })
      })

      // Identify parent-child relationships and mark parents
      tasks.forEach(task => {
        if (task.parentTask) {
          const parent = taskMap.get(task.parentTask)
          if (parent) {
            parent.hasChildren = true
          }
        }
      })

      // Build flattened hierarchy list
      const addTaskAndChildren = (task, level = 0) => {
        const taskWithLevel = {
          ...task,
          level,
          hasChildren: taskMap.get(task.id)?.hasChildren || false,
          isExpanded: this.expandedTasks.has(task.id)
        }

        result.push(taskWithLevel)

        // Add children if parent is expanded
        if (this.showSubtasks && this.expandedTasks.has(task.id)) {
          const children = tasks
            .filter(t => t.parentTask === task.id)
            .sort((a, b) => (a.order || 0) - (b.order || 0))

          children.forEach(child => {
            addTaskAndChildren(child, level + 1)
          })
        }
      }

      // Start with root tasks (no parent)
      const rootTasks = tasks
        .filter(task => !task.parentTask)
        .sort((a, b) => (a.order || 0) - (b.order || 0))

      rootTasks.forEach(task => {
        addTaskAndChildren(task, 0)
      })

      return result
    },

    // Add method to toggle task expansion
    toggleTaskExpansion(taskId) {
      if (this.expandedTasks.has(taskId)) {
        this.expandedTasks.delete(taskId)
      } else {
        this.expandedTasks.add(taskId)
      }
      // Force reactivity
      this.expandedTasks = new Set(this.expandedTasks)
      
      // Save expanded state to localStorage
      this.saveExpandedState()
    },

    // Add method to save expanded state to localStorage
    saveExpandedState() {
      const expandedArray = Array.from(this.expandedTasks)
      localStorage.setItem('gantt-expanded-tasks', JSON.stringify(expandedArray))
    },

    // Add method to load expanded state from localStorage
    loadExpandedState() {
      try {
        const saved = localStorage.getItem('gantt-expanded-tasks')
        if (saved) {
          const expandedArray = JSON.parse(saved)
          this.expandedTasks = new Set(expandedArray)
          return true // Indicate that we loaded saved state
        }
      } catch (error) {
        console.warn('Failed to load expanded tasks state:', error)
      }
      return false // Indicate no saved state was loaded
    },

    // Add method to auto-expand parent tasks (only for first time or new projects)
    initializeExpandedState() {
      // Try to load saved state first
      const hasLoadedState = this.loadExpandedState()
      
      // Only auto-expand if we didn't load any saved state
      if (!hasLoadedState) {
        this.tasks.forEach(task => {
          if (this.getSubtaskCount(task.id) > 0) {
            this.expandedTasks.add(task.id)
          }
        })
        // Save the initial auto-expanded state
        this.saveExpandedState()
      }
      
      // Force reactivity update
      this.expandedTasks = new Set(this.expandedTasks)
    },

    // Add method to get subtask count for a parent task
    getSubtaskCount(parentId) {
      return this.tasks.filter(task => task.parentTask === parentId).length
    },

    updateTaskStatus(taskId, status) {
      try {
        console.log('Updating task status:', { taskId, status, taskType: typeof taskId })
        
        // Find the task to make sure it exists
        const task = this.tasks.find(t => t.id === taskId)
        if (!task) {
          console.error('Task not found:', taskId)
          return
        }
        
        console.log('Found task:', task.title, 'Current status:', task.status, 'New status:', status)
        
        // Emit task update to parent component
        this.$emit('task-update', { 
          id: taskId, 
          updates: { status } 
        })
      } catch (error) {
        console.error('Error in updateTaskStatus:', error)
      }
    },

    savePeriod() {
      // Validate form
      if (!this.isFormValid) {
        return
      }
      
      // Validate that end date is not before start date
      if (new Date(this.periodForm.endDate) < new Date(this.periodForm.startDate)) {
        alert('End date cannot be before start date')
        return
      }

      let updatedPeriods = [...this.activeProjectPeriods]

      if (this.isEditingPeriod) {
        // Update existing period - keep original color
        const periodIndex = updatedPeriods.findIndex(p => p.id === this.periodForm.id)
        if (periodIndex !== -1) {
          const originalColor = updatedPeriods[periodIndex].color
          updatedPeriods[periodIndex] = {
            id: this.periodForm.id,
            title: this.periodForm.title.trim(),
            description: this.periodForm.description.trim(),
            startDate: new Date(this.periodForm.startDate).toISOString(),
            endDate: new Date(this.periodForm.endDate).toISOString(),
            color: originalColor // Keep the original color when editing
          }
        }
      } else {
        // Add new period with auto-assigned color
        const newPeriod = {
          id: 'period_' + Date.now(),
          title: this.periodForm.title.trim(),
          description: this.periodForm.description.trim(),
          startDate: new Date(this.periodForm.startDate).toISOString(),
          endDate: new Date(this.periodForm.endDate).toISOString(),
          color: this.getNextPeriodColor(updatedPeriods) // Pass current periods for color calculation
        }
        updatedPeriods.push(newPeriod)
      }
      
      // Always update local data
      this.localProjectPeriods = updatedPeriods
      
      // Save to localStorage
      this.savePeriodsToLocalStorage()
      
      // Also emit to parent in case it wants to handle persistence
      this.$emit('periods-update', updatedPeriods)
      
      this.closePeriodModal()
    },

    closePeriodModal() {
      this.showPeriodModal = false
    },

    startPeriodDrag(event, period, dragType) {
      event.preventDefault()
      this.dragState = {
        isDragging: true,
        taskId: period.id,
        dragType,
        startX: event.clientX,
        currentX: event.clientX, // Initialize current position
        originalStartDate: new Date(period.startDate),
        originalEndDate: new Date(period.endDate),
        initialLeft: parseFloat(this.getPeriodStyle(period).left),
        initialWidth: parseFloat(this.getPeriodStyle(period).width),
        hasMoved: false // Track if actual dragging occurred
      }

      document.addEventListener('mousemove', this.handleDrag)
      document.addEventListener('mouseup', this.endDrag)
      document.addEventListener('keydown', this.handleKeyDuringDrag)
      document.body.style.cursor = dragType === 'move' ? 'grabbing' : 'col-resize'
      document.body.style.userSelect = 'none'
    },

    getPeriodDragPreviewStyle() {
      if (!this.dragState.isDragging) return {}

      // Find the period being dragged
      const period = this.activeProjectPeriods.find(p => p.id === this.dragState.taskId)
      if (!period) return {}

      // Calculate the current drag offset in pixels
      const currentDeltaX = this.dragState.currentX - this.dragState.startX

      // Get the original period style (which returns pixels now)
      const originalStyle = this.getPeriodStyle(period)

      // Parse the left and width pixel values
      const originalLeft = parseFloat(originalStyle.left)
      const originalWidth = parseFloat(originalStyle.width)

      // Snap drag offset to column widths
      const dragOffsetColumns = Math.round(currentDeltaX / this.columnWidth)
      const dragOffsetPixels = dragOffsetColumns * this.columnWidth

      // Calculate new position based on drag type
      let newLeft = originalLeft
      let newWidth = originalWidth

      switch (this.dragState.dragType) {
        case 'move':
          // Move the entire period
          newLeft += dragOffsetPixels
          break

        case 'resize-left':
          // Resize from the left side
          newLeft += dragOffsetPixels
          newWidth -= dragOffsetPixels
          // Ensure minimum width (at least one column)
          const minWidth = this.columnWidth
          if (newWidth < minWidth) {
            newWidth = minWidth
            newLeft = originalLeft + originalWidth - minWidth
          }
          break

        case 'resize-right':
          // Resize from the right side
          newWidth += dragOffsetPixels
          // Ensure minimum width
          if (newWidth < this.columnWidth) {
            newWidth = this.columnWidth
          }
          break
      }

      // Ensure the preview doesn't go outside timeline bounds
      const maxLeft = (this.timelineDates.length - 1) * this.columnWidth
      if (newLeft < 0) newLeft = 0
      if (newLeft + newWidth > maxLeft + this.columnWidth) {
        if (this.dragState.dragType === 'move') {
          newLeft = maxLeft + this.columnWidth - newWidth
        } else {
          newWidth = maxLeft + this.columnWidth - newLeft
        }
      }

      return {
        position: 'absolute',
        left: newLeft + 'px',
        width: newWidth + 'px',
        top: '0',
        height: '28px',
        backgroundColor: 'rgba(33, 150, 243, 0.6)',
        border: '2px solid #007bff',
        borderRadius: '4px',
        zIndex: 1000,
        pointerEvents: 'none',
        animation: 'periodDragPulse 1s ease-in-out infinite alternate'
      }
    },

    printGanttChart() {
      // Create a print-optimized version of the Gantt chart
      const printWindow = window.open('', '_blank')
      const printContent = this.generatePrintContent()
      
      printWindow.document.write(printContent)
      printWindow.document.close()
      
      // Wait for content to load, then print
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 1000)
    },

    generatePrintContent() {
      // Calculate optimal scaling for A4 landscape (297mm x 210mm)
      const projectTitle = this.$store.state.currentProject?.name || 'Project Timeline'
      const printDate = new Date().toLocaleDateString()
      
      // Calculate timeline span for better scaling
      const taskStartDates = this.visibleTasks.map(t => new Date(t.startDate)).filter(d => !isNaN(d))
      const taskEndDates = this.visibleTasks.map(t => new Date(t.endDate)).filter(d => !isNaN(d))
      
      const minDate = taskStartDates.length ? new Date(Math.min(...taskStartDates)) : new Date()
      const maxDate = taskEndDates.length ? new Date(Math.max(...taskEndDates)) : new Date()
      
      // Generate extended timeline dates for full project span
      const printTimelineDates = this.generatePrintTimelineDates(minDate, maxDate)
      
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Gantt Chart - ${projectTitle}</title>
          <meta charset="utf-8">
          <style>
            ${this.getPrintStyles()}
          </style>
        </head>
        <body>
          <div class="print-container">
            <!-- Header -->
            <div class="print-header">
              <h1>${projectTitle} - Gantt Chart</h1>
              <div class="print-info">
                <span>Generated: ${printDate}</span>
                <span>Tasks: ${this.visibleTasks.length}</span>
                <span>Period: ${minDate.toLocaleDateString()} - ${maxDate.toLocaleDateString()}</span>
              </div>
            </div>

            <!-- Project Periods -->
            ${this.activeProjectPeriods.length > 0 ? this.generatePrintPeriods(printTimelineDates) : ''}

            <!-- Timeline Header -->
            <div class="print-timeline-header">
              <div class="print-task-column-header">Tasks</div>
              <div class="print-timeline-dates">
                ${printTimelineDates.map(date => `
                  <div class="print-date-column ${date.isToday ? 'today' : ''} ${date.isWeekend ? 'weekend' : ''}">
                    <div class="print-date-label">${date.label}</div>
                    <div class="print-date-sublabel">${date.sublabel || ''}</div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Task Rows -->
            <div class="print-gantt-body">
              ${this.visibleTasks.map(task => this.generatePrintTaskRow(task, printTimelineDates)).join('')}
            </div>

            <!-- Footer -->
            <div class="print-footer">
              <div class="print-legend">
                <div class="legend-item"><div class="legend-color todo"></div>To Do</div>
                <div class="legend-item"><div class="legend-color in-progress"></div>In Progress</div>
                <div class="legend-item"><div class="legend-color completed"></div>Completed</div>
                <div class="legend-item"><div class="legend-color on-hold"></div>On Hold</div>
                <div class="legend-item"><div class="legend-color cancelled"></div>Cancelled</div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    },

    generatePrintTimelineDates(startDate, endDate) {
      const dates = []
      const current = new Date(startDate)
      const today = new Date()
      
      // Add some buffer days before and after
      current.setDate(current.getDate() - 3)
      const finalDate = new Date(endDate)
      finalDate.setDate(finalDate.getDate() + 3)

      while (current <= finalDate) {
        const isToday = current.toDateString() === today.toDateString()
        const isWeekend = current.getDay() === 0 || current.getDay() === 6

        let label, sublabel
        label = current.getDate().toString()
        sublabel = current.toLocaleDateString('en-US', { weekday: 'short' })
        
        // Add month indicator on first day of month
        if (current.getDate() === 1) {
          sublabel = current.toLocaleDateString('en-US', { month: 'short' })
        }

        dates.push({
          date: new Date(current),
          label,
          sublabel,
          isToday,
          isWeekend
        })

        current.setDate(current.getDate() + 1)
      }

      return dates
    },

    generatePrintPeriods(timelineDates) {
      return `
        <div class="print-periods-row">
          <div class="print-periods-header">Project Periods</div>
          <div class="print-periods-timeline">
            ${this.activeProjectPeriods.map(period => {
              const style = this.getPrintPeriodStyle(period, timelineDates)
              return `
                <div class="print-period" style="${style}">
                  <span class="print-period-title">${period.title}</span>
                </div>
              `
            }).join('')}
          </div>
        </div>
      `
    },

    generatePrintTaskRow(task, timelineDates) {
      const taskBarStyle = this.getPrintTaskBarStyle(task, timelineDates)
      const indentStyle = `padding-left: ${(task.level || 0) * 15}px`
      
      return `
        <div class="print-task-row">
          <div class="print-task-info" style="${indentStyle}">
            <div class="print-task-title ${task.level > 0 ? 'subtask' : ''} ${task.hasChildren ? 'parent' : ''}">
              ${task.level > 0 ? '└─ ' : ''}${task.title}
            </div>
            <div class="print-task-meta">
              <span class="print-task-status ${task.status}">${this.formatStatus(task.status)}</span>
              <span class="print-task-duration">${this.getTaskDuration(task)}</span>
              <span class="print-task-dates">${new Date(task.startDate).toLocaleDateString()} - ${new Date(task.endDate).toLocaleDateString()}</span>
            </div>
          </div>
          <div class="print-task-timeline">
            ${this.isTaskVisible(task) ? `
              <div class="print-task-bar ${task.status} ${this.isTaskOverdue(task) ? 'overdue' : ''}" style="${taskBarStyle}">
                <span class="print-task-bar-title">${task.title}</span>
              </div>
            ` : ''}
          </div>
        </div>
      `
    },

    getPrintTaskBarStyle(task, timelineDates) {
      if (!this.isTaskVisible(task)) return 'display: none;'
      
      const taskStart = new Date(task.startDate)
      const taskEnd = new Date(task.endDate)
      
      let startColumnIndex = -1
      let endColumnIndex = -1

      timelineDates.forEach((dateCol, index) => {
        const colDate = new Date(dateCol.date)
        colDate.setHours(0, 0, 0, 0)

        const taskStartDate = new Date(taskStart)
        taskStartDate.setHours(0, 0, 0, 0)

        const taskEndDate = new Date(taskEnd)
        taskEndDate.setHours(0, 0, 0, 0)

        if (startColumnIndex === -1 && colDate >= taskStartDate) {
          startColumnIndex = Math.max(0, index)
        }

        if (colDate <= taskEndDate) {
          endColumnIndex = index
        }
      })

      if (startColumnIndex === -1) startColumnIndex = 0
      if (endColumnIndex === -1) endColumnIndex = timelineDates.length - 1
      if (endColumnIndex < startColumnIndex) endColumnIndex = startColumnIndex

      const columnWidth = 20 // Fixed width for print
      const leftPosition = startColumnIndex * columnWidth
      const width = (endColumnIndex - startColumnIndex + 1) * columnWidth

      return `
        left: ${leftPosition}px;
        width: ${width}px;
        background-color: ${this.getTaskColor(task)};
      `
    },

    getPrintPeriodStyle(period, timelineDates) {
      const periodStart = new Date(period.startDate)
      const periodEnd = new Date(period.endDate)
      
      let startColumnIndex = -1
      let endColumnIndex = -1

      timelineDates.forEach((dateCol, index) => {
        const colDate = new Date(dateCol.date)
        colDate.setHours(0, 0, 0, 0)

        const periodStartDate = new Date(periodStart)
        periodStartDate.setHours(0, 0, 0, 0)

        const periodEndDate = new Date(periodEnd)
        periodEndDate.setHours(0, 0, 0, 0)

        if (startColumnIndex === -1 && colDate >= periodStartDate) {
          startColumnIndex = Math.max(0, index)
        }

        if (colDate <= periodEndDate) {
          endColumnIndex = index
        }
      })

      if (startColumnIndex === -1) startColumnIndex = 0
      if (endColumnIndex === -1) endColumnIndex = timelineDates.length - 1
      if (endColumnIndex < startColumnIndex) endColumnIndex = startColumnIndex

      const columnWidth = 20 // Fixed width for print
      const leftPosition = startColumnIndex * columnWidth
      const width = (endColumnIndex - startColumnIndex + 1) * columnWidth
      
      return `
        position: absolute;
        left: ${leftPosition}px;
        width: ${width}px;
        background-color: ${period.color};
      `
    },

    getPrintStyles() {
      return `
        @media print {
          @page {
            size: A4 landscape;
            margin: 0.5in;
          }
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: Arial, sans-serif;
          font-size: 10px;
          line-height: 1.2;
          color: #333;
        }
        
        .print-container {
          width: 100%;
          max-width: 100%;
        }
        
        .print-header {
          border-bottom: 2px solid #333;
          margin-bottom: 15px;
          padding-bottom: 10px;
        }
        
        .print-header h1 {
          font-size: 18px;
          margin-bottom: 5px;
          color: #333;
        }
        
        .print-info {
          display: flex;
          gap: 20px;
          font-size: 9px;
          color: #666;
        }
        
        .print-periods-row {
          display: flex;
          margin-bottom: 10px;
          min-height: 25px;
        }
        
        .print-periods-header {
          width: 200px;
          font-weight: bold;
          padding: 5px 8px;
          background: #f0f0f0;
          border: 1px solid #ddd;
          display: flex;
          align-items: center;
        }
        
        .print-periods-timeline {
          flex: 1;
          position: relative;
          height: 25px;
          border: 1px solid #ddd;
          border-left: none;
        }
        
        .print-period {
          height: 100%;
          border-radius: 2px;
          display: flex;
          align-items: center;
          padding: 0 5px;
          font-size: 8px;
          color: white;
          font-weight: bold;
        }
        
        .print-period-title {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .print-timeline-header {
          display: flex;
          border-bottom: 2px solid #333;
          margin-bottom: 5px;
          background: #f8f8f8;
        }
        
        .print-task-column-header {
          width: 200px;
          padding: 8px;
          font-weight: bold;
          border-right: 1px solid #ddd;
          background: #f0f0f0;
        }
        
        .print-timeline-dates {
          display: flex;
          flex: 1;
        }
        
        .print-date-column {
          width: 20px;
          min-width: 20px;
          padding: 3px 1px;
          text-align: center;
          border-right: 1px solid #eee;
          font-size: 7px;
        }
        
        .print-date-column.today {
          background: #e3f2fd;
          font-weight: bold;
          border-right: 1px solid #2196f3;
        }
        
        .print-date-column.weekend {
          background: #f5f5f5;
        }
        
        .print-date-label {
          font-weight: bold;
          line-height: 1;
        }
        
        .print-date-sublabel {
          font-size: 6px;
          color: #666;
          line-height: 1;
        }
        
        .print-gantt-body {
          margin-bottom: 15px;
        }
        
        .print-task-row {
          display: flex;
          min-height: 30px;
          border-bottom: 1px solid #eee;
        }
        
        .print-task-row:nth-child(even) {
          background: #fafafa;
        }
        
        .print-task-info {
          width: 200px;
          padding: 5px 8px;
          border-right: 1px solid #ddd;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        
        .print-task-title {
          font-weight: bold;
          font-size: 9px;
          margin-bottom: 2px;
          color: #333;
        }
        
        .print-task-title.subtask {
          font-weight: normal;
          color: #666;
          font-size: 8px;
        }
        
        .print-task-title.parent {
          color: #007bff;
          font-weight: bold;
        }
        
        .print-task-meta {
          display: flex;
          gap: 5px;
          flex-wrap: wrap;
          font-size: 7px;
        }
        
        .print-task-status {
          padding: 1px 3px;
          border-radius: 2px;
          font-weight: bold;
          text-transform: uppercase;
        }
        
        .print-task-status.todo { background: #e2e3e5; color: #383d41; }
        .print-task-status.in-progress { background: #cce7ff; color: #004085; }
        .print-task-status.completed { background: #d4edda; color: #155724; }
        .print-task-status.on-hold { background: #fff3cd; color: #856404; }
        .print-task-status.cancelled { background: #f8d7da; color: #721c24; }
        
        .print-task-duration {
          color: #666;
        }
        
        .print-task-dates {
          color: #666;
          font-size: 6px;
        }
        
        .print-task-timeline {
          flex: 1;
          position: relative;
          height: 30px;
          display: flex;
          align-items: center;
        }
        
        .print-task-bar {
          position: absolute;
          height: 16px;
          border-radius: 2px;
          display: flex;
          align-items: center;
          padding: 0 3px;
          color: white;
          font-size: 7px;
          font-weight: bold;
          overflow: hidden;
        }
        
        .print-task-bar.overdue {
          border: 1px solid #dc3545;
        }
        
        .print-task-bar-title {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .print-footer {
          border-top: 1px solid #ddd;
          padding-top: 10px;
          margin-top: 15px;
        }
        
        .print-legend {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
        }
        
        .legend-item {
          display: flex;
          align-items: center;
          gap: 3px;
          font-size: 8px;
        }
        
        .legend-color {
          width: 10px;
          height: 10px;
          border-radius: 1px;
        }
        
        .legend-color.todo { background: #6c757d; }
        .legend-color.in-progress { background: #007bff; }
        .legend-color.completed { background: #28a745; }
        .legend-color.on-hold { background: #ffc107; }
        .legend-color.cancelled { background: #dc3545; }
      `
    }
  },
  watch: {
    // Watch for current project changes to reload periods
    '$store.state.currentProject': {
      handler(newProject, oldProject) {
        console.log('=== Current project changed ===')
        console.log('Old project:', oldProject?.name, oldProject?.id)
        console.log('New project:', newProject?.name, newProject?.id)
        
        if (newProject && newProject.id !== oldProject?.id) {
          console.log('Project ID changed, reloading periods for project:', newProject.id)
          // Load periods for the new project
          this.loadPeriodsFromLocalStorage()
        }
      },
      immediate: true, // Load periods when component is first created
      deep: true
    },

    // Watch for tasks prop changes (when switching projects)
    tasks: {
      handler(newTasks, oldTasks) {
        // When tasks change (project switch), reset filters and timeline
        if (!oldTasks || newTasks.length !== oldTasks.length) {
          console.log('Tasks changed, updating Gantt chart timeline')

          // Reset filters to show all data
          this.dateRangeFilter = 'all'
          this.statusFilter = 'all'
          this.priorityFilter = 'all'
          this.customDateStart = ''
          this.customDateEnd = ''

          // Reset manual navigation
          this.manualNavigation = false
          this.currentDate = new Date()

          // Clear any drag states
          this.dragState = {
            isDragging: false,
            taskId: null,
            dragType: null,
            startX: 0,
            currentX: 0,
            originalStartDate: null,
            originalEndDate: null,
            initialLeft: 0,
            initialWidth: 0,
            hasMoved: false
          }

          // Clear selected task to prevent blue highlighting
          this.$emit('task-select', null)

          // Only reset expanded state if this is actually a new project (different task IDs)
          // not just a refresh of the same project
          const isNewProject = oldTasks && newTasks.length > 0 && oldTasks.length > 0 &&
            !newTasks.some(newTask => oldTasks.some(oldTask => oldTask.id === newTask.id))
          
          if (isNewProject) {
            // This is a project switch - reset expanded state and auto-expand
            this.expandedTasks.clear()
            newTasks.forEach(task => {
              if (this.getSubtaskCount(task.id) > 0) {
                this.expandedTasks.add(task.id)
              }
            })
            this.saveExpandedState()
            // Force reactivity update
            this.expandedTasks = new Set(this.expandedTasks)
          }

          // Force reactivity update
          this.$nextTick(() => {
            this.$forceUpdate()
          })
        }
      },
      immediate: false
    },

    // Watch for selected task changes
    selectedTaskId: {
      handler(newId, oldId) {
        if (newId !== oldId) {
          // Clear drag states when selection changes
          this.justFinishedDrag = false
        }
      }
    }
  },
  mounted() {
    console.log('=== GanttChart mounted ===')
    // Add window resize listener for responsive column sizing
    this.handleResize = () => {
      this.screenWidth = window.innerWidth
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.handleResize)
    }

    // Initialize expanded state (load from localStorage or auto-expand for first time)
    this.initializeExpandedState()
    
    // Load saved project periods from localStorage
    // Note: The project watcher will also load periods, but this ensures
    // they're loaded even if the project is already set when component mounts
    console.log('Loading periods on mount...')
    this.loadPeriodsFromLocalStorage()
  },
  beforeDestroy() {
    // Clean up resize listener
    if (typeof window !== 'undefined' && this.handleResize) {
      window.removeEventListener('resize', this.handleResize)
    }
  }
}
</script>

<style scoped>
.gantt-chart {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 100%;
  max-width: 100%;
}

.gantt-controls {
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
  gap: 0.5rem;
  flex-wrap: wrap;
}

.view-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ced4da;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
  white-space: nowrap;
}

.view-btn:hover {
  background: #e9ecef;
}

.view-btn.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.timeline-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.nav-btn,
.today-btn {
  padding: 0.375rem;
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
  padding: 0.375rem 0.75rem;
  font-size: 0.8rem;
  white-space: nowrap;
}

.gantt-container {
  overflow-x: hidden;
  overflow-y: visible;
  width: 100%;
  position: relative;
}

.gantt-container.dragging {
  user-select: none;
  cursor: grabbing;
}

.timeline-header {
  display: flex;
  border-bottom: 2px solid #dee2e6;
  background: #f8f9fa;
  position: sticky;
  top: 0;
  z-index: 10;
  width: 100%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.task-column-header {
  width: 280px;
  min-width: 280px;
  max-width: 280px;
  padding: 1rem;
  font-weight: 600;
  color: #495057;
  border-right: 1px solid #dee2e6;
  background: #f8f9fa;
  box-sizing: border-box;
  flex-shrink: 0;
}

.timeline-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
}

.project-periods-row {
  display: flex;
  align-items: stretch;
  min-height: 40px;
  height: 40px;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  padding: 0;
}

.periods-column-header {
  width: 280px;
  min-width: 280px;
  max-width: 280px;
  padding: 0.5rem 1rem;
  border-right: 1px solid #dee2e6;
  background: #f8f9fa;
  box-sizing: border-box;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.periods-timeline-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  height: 100%;
}

.add-period-btn {
  padding: 0.375rem 0.75rem;
  border: 1px solid #ced4da;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.2s;
  white-space: nowrap;
  font-size: 0.75rem;
  color: #495057;
  flex-shrink: 0;
}

.add-period-btn:hover {
  background: #e9ecef;
}

.add-period-btn svg {
  width: 12px;
  height: 12px;
}

.periods-container {
  display: block;
  position: relative;
  height: 40px;
  overflow: hidden;
}

.project-period {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  cursor: grab;
  transition: all 0.2s;
  font-size: 0.75rem;
  position: absolute;
  top: 0;
  user-select: none;
  height: 100%;
  box-sizing: border-box;
}

.project-period:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.project-period:hover .period-resize-handle {
  opacity: 1;
}

.project-period.period-dragging {
  cursor: grabbing;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  z-index: 10;
  opacity: 0.7;
}

.period-title {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.period-remove {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  cursor: pointer;
  padding: 2px;
  border-radius: 2px;
  color: white;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.period-remove:hover {
  background: rgba(255, 255, 255, 0.4);
}

.period-remove svg {
  width: 10px;
  height: 10px;
}

.timeline-dates {
  display: block;
  flex: 1;
  width: 100%;
  overflow: hidden;
  position: relative;
  min-height: 60px;
}

.date-column {
  position: absolute;
  top: 0;
  border-right: 1px solid #dee2e6;
  padding: 0.5rem 0.25rem;
  text-align: center;
  height: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;
  overflow: hidden;
}

.date-column.today {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  font-weight: 600;
  border-right: 2px solid #2196f3;
}

.date-column.today .date-label,
.date-column.today .date-sublabel {
  color: #1565c0;
}

.date-column.weekend {
  background: #f5f5f5;
}

.date-column.focus-day {
  background: linear-gradient(135deg, #fff3e0 0%, #ffcc80 100%);
  font-weight: 600;
  border-right: 2px solid #ff9800;
  border-left: 2px solid #ff9800;
}

.date-column.focus-day .date-label,
.date-column.focus-day .date-sublabel {
  color: #e65100;
}

/* If a day is both today and focus day, prioritize today styling */
.date-column.today.focus-day {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border-right: 2px solid #2196f3;
  border-left: 2px solid #2196f3;
}

.date-column.today.focus-day .date-label,
.date-column.today.focus-day .date-sublabel {
  color: #1565c0;
}

.date-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #495057;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.date-sublabel {
  font-size: 0.75rem;
  color: #6c757d;
  margin-top: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gantt-body {
  position: relative;
  width: 100%;
  max-height: 60vh;
  overflow-y: auto;
  overflow-x: hidden;
}

.full-timeline-grid {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 280px;
  right: 0;
  pointer-events: none;
  z-index: 0;
}

.full-grid-column {
  position: absolute;
  top: 0;
  bottom: 0;
  pointer-events: none;
  border-right: 1px solid #dee2e6;
}

.full-grid-column:last-child {
  border-right: none;
}

.full-grid-column.full-today-grid {
  background: rgba(33, 150, 243, 0.12);
  border-left: 2px solid #2196f3;
  border-right: 2px solid #2196f3;
}

.full-grid-column.full-focus-day-grid {
  background: rgba(255, 152, 0, 0.12);
  border-left: 2px solid #ff9800;
  border-right: 2px solid #ff9800;
}

/* If a column is both today and focus day, prioritize today styling */
.full-grid-column.full-today-grid.full-focus-day-grid {
  background: rgba(33, 150, 243, 0.12);
  border-left: 2px solid #2196f3;
  border-right: 2px solid #2196f3;
}

.empty-state {
  padding: 3rem;
  text-align: center;
  color: #6c757d;
}

.task-rows {
  position: relative;
  width: 100%;
  z-index: 1;
}

.task-row {
  display: flex;
  min-height: 50px;
  cursor: pointer;
  transition: background-color 0.2s;
  width: 100%;
  position: relative;
  z-index: 1;
  margin: 0;
  padding: 0;
  background: transparent;
  border-bottom: 1px solid #f0f0f0;
}

.task-row:last-child {
  border-bottom: none;
}

.task-row:nth-child(even) {
  background: rgba(252, 252, 252, 0.3);
}

.task-row:nth-child(odd) {
  background: rgba(255, 255, 255, 0.3);
}

.task-row:hover {
  background: rgba(248, 249, 250, 0.8) !important;
}

.task-row.selected {
  background: rgba(227, 242, 253, 0.8) !important;
}

.task-info {
  width: 280px;
  min-width: 280px;
  max-width: 280px;
  padding: 0.75rem 1rem;
  border-right: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;
  flex-shrink: 0;
  overflow: hidden;
}

/* Hierarchy-specific styles */
.task-info.level-0 {
  background: rgba(255, 255, 255, 0.95);
  border-left: 3px solid transparent;
}

.task-info.level-1 {
  background: rgba(248, 249, 250, 0.95);
  border-left: 3px solid #007bff;
}

.task-info.level-2 {
  background: rgba(241, 243, 245, 0.95);
  border-left: 3px solid #28a745;
}

.task-info.level-3 {
  background: rgba(233, 236, 239, 0.95);
  border-left: 3px solid #ffc107;
}

.task-hierarchy-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 0.25rem;
  position: relative;
}

/* Hierarchy connecting lines */
.hierarchy-lines {
  position: absolute;
  top: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;
}

.hierarchy-vertical-line {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 50%;
  width: 1px;
  background: #007bff;
  opacity: 0.6;
}

.hierarchy-horizontal-line {
  position: absolute;
  left: 0;
  top: 50%;
  width: 15px;
  height: 1px;
  background: #007bff;
  opacity: 0.6;
}

.hierarchy-expand-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 3px;
  color: #6c757d;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  position: relative;
  z-index: 2;
}

.hierarchy-expand-btn:hover {
  background: #e9ecef;
  color: #495057;
}

.hierarchy-expand-btn.expanded {
  color: #007bff;
}

.hierarchy-spacer {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.task-title-container {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.task-title {
  font-weight: 500;
  color: #495057;
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}

.task-title.has-children {
  font-weight: 600;
  color: #343a40;
}

.task-title.is-parent {
  font-weight: 700;
  color: #007bff;
  font-size: 0.9rem;
}

.task-title.is-subtask {
  font-weight: 400;
  color: #6c757d;
  font-size: 0.8125rem;
  position: relative;
}

.task-title.is-subtask::before {
  content: '└─';
  margin-right: 4px;
  color: #007bff;
  font-weight: normal;
}

.subtask-count {
  color: #6c757d;
  font-size: 0.75rem;
  font-weight: 400;
  flex-shrink: 0;
  background: #f8f9fa;
  padding: 2px 6px;
  border-radius: 10px;
  border: 1px solid #e9ecef;
}

.subtask-badge {
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 123, 255, 0.3);
}

.hierarchy-level {
  background: #e9ecef;
  color: #495057;
  padding: 2px 4px;
  border-radius: 2px;
  font-size: 0.6875rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.task-meta {
  display: flex;
  gap: 0.5rem;
  font-size: 0.75rem;
  flex-wrap: wrap;
}

.task-duration {
  color: #6c757d;
  white-space: nowrap;
}

.task-status {
  padding: 0.125rem 0.375rem;
  border-radius: 3px;
  font-weight: 500;
  text-transform: uppercase;
  white-space: nowrap;
  flex-shrink: 0;
}

/* Timeline Days Left Indicator */
.task-days-left {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 500;
  margin-top: 0.25rem;
  border: 1px solid;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-days-left svg {
  flex-shrink: 0;
}

.task-days-left.urgent {
  background: #f8d7da;
  color: #721c24;
  border-color: #f5c6cb;
  animation: pulse 2s infinite;
}

.task-days-left.due-today {
  background: #fff3cd;
  color: #856404;
  border-color: #ffeaa7;
  animation: pulse-subtle 3s infinite;
}

.task-days-left.due-soon {
  background: #fef3e2;
  color: #975a16;
  border-color: #f6d55c;
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

.task-status.todo {
  background: #e2e3e5;
  color: #383d41;
}

.task-status.in-progress {
  background: #cce7ff;
  color: #004085;
}

.task-status.completed {
  background: #d4edda;
  color: #155724;
}

.task-status.on-hold {
  background: #fff3cd;
  color: #856404;
}

.task-status.cancelled {
  background: #f8d7da;
  color: #721c24;
}

.task-timeline {
  position: relative;
  height: 50px;
  display: flex;
  align-items: center;
  flex: 1;
  width: 100%;
  overflow: hidden;
  z-index: 2;
}

.timeline-grid-overlay {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  pointer-events: none;
  z-index: 1;
  height: 100%;
}

.grid-column {
  position: absolute;
  top: 0;
  bottom: 0;
  height: 100%;
  border-right: 1px solid #dee2e6;
  pointer-events: none;
}

.grid-column:last-child {
  border-right: none;
}

.grid-column.today-grid {
  border-left: 2px solid #2196f3;
  border-right: 2px solid #2196f3;
  background: rgba(33, 150, 243, 0.08);
}

.task-bar {
  position: absolute;
  height: 24px;
  border-radius: 4px;
  cursor: grab;
  transition: all 0.2s;
  overflow: hidden;
  display: flex;
  align-items: center;
  padding: 0 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  position: relative;
  color: white; /* Ensure text is visible on colored backgrounds */
}

.task-bar:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.task-bar.dragging {
  cursor: grabbing;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 10;
}

.task-bar.drag-disabled {
  cursor: not-allowed !important;
  opacity: 0.6;
}

.task-bar.drag-disabled .resize-handle {
  display: none;
}

.resize-handle {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 8px;
  background: rgba(255, 255, 255, 0.3);
  cursor: col-resize;
  opacity: 0;
  transition: opacity 0.2s;
}

.task-bar:hover .resize-handle {
  opacity: 1;
}

.resize-handle-left {
  left: 0;
  border-radius: 4px 0 0 4px;
}

.resize-handle-right {
  right: 0;
  border-radius: 0 4px 4px 0;
}

.resize-handle:hover {
  background: rgba(255, 255, 255, 0.5);
}

.resize-handle::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 3px;
  height: 12px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 1px;
}

.resize-handle-left::after {
  box-shadow: 1px 0 0 rgba(255, 255, 255, 0.8);
}

.resize-handle-right::after {
  box-shadow: -1px 0 0 rgba(255, 255, 255, 0.8);
}

.drag-preview {
  position: absolute;
  height: 24px;
  background: rgba(0, 123, 255, 0.3);
  border: 2px solid #007bff;
  border-radius: 4px;
  z-index: 15;
  pointer-events: none;
  animation: dragPulse 1s ease-in-out infinite alternate;
}

@keyframes dragPulse {
  from {
    opacity: 0.3;
  }
  to {
    opacity: 0.6;
  }
}

/*
.task-bar.priority-low {
  background: #28a745;
}

.task-bar.priority-medium {
  background: #ffc107;
  color: #212529;
}

.task-bar.priority-high {
  background: #fd7e14;
  color: white;
}

.task-bar.priority-critical {
  background: #dc3545;
  color: white;
}
*/

/* Status-based colors (override priority colors) */
.task-bar.status-todo {
  background: #6c757d !important;
  color: white !important;
}

.task-bar.status-in-progress {
  background: #007bff !important;
  color: white !important;
}

.task-bar.status-completed {
  background: #28a745 !important;
  color: white !important;
}

.task-bar.status-on-hold {
  background: #ffc107 !important;
  color: #212529 !important;
}

.task-bar.status-cancelled {
  background: #dc3545 !important;
  color: white !important;
}

.task-bar.status-completed {
  opacity: 0.7;
}

.task-bar.overdue {
  background: #dc3545 !important;
  color: white;
  animation: pulse 2s infinite;
}

.task-bar.spans-multiple-days {
  border-left: 3px solid rgba(255, 255, 255, 0.8);
  border-right: 3px solid rgba(255, 255, 255, 0.8);
  position: relative;
}

.task-bar.spans-multiple-days::before,
.task-bar.spans-multiple-days::after {
  content: '';
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-style: solid;
}

.task-bar.spans-multiple-days::before {
  left: -3px;
  border-left: 0;
  border-right: 6px solid rgba(255, 255, 255, 0.9);
  border-top: 4px solid transparent;
  border-bottom: 4px solid transparent;
}

.task-bar.spans-multiple-days::after {
  right: -3px;
  border-right: 0;
  border-left: 6px solid rgba(255, 255, 255, 0.9);
  border-top: 4px solid transparent;
  border-bottom: 4px solid transparent;
}

.task-bar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  position: relative;
  z-index: 2;
}

.task-bar-title {
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.task-bar-progress {
  font-size: 0.7rem;
  font-weight: 600;
  margin-left: 0.5rem;
}

.task-progress-overlay {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px 0 0 4px;
  z-index: 1;
}

.today-line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #dc3545;
  z-index: 5;
  pointer-events: none;
}

.today-line::before {
  content: '';
  position: absolute;
  top: -4px;
  left: -3px;
  width: 8px;
  height: 8px;
  background: #dc3545;
  border-radius: 50%;
}

/* Dependency Arrows Styles */
.dependency-arrows {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 5;
}

.dependency-svg {
  position: absolute;
  top: 0;
  left: 0;
}

.dependency-arrow {
  transition: stroke-width 0.2s;
}

.dependency-arrow:hover {
  stroke-width: 3;
  stroke: #0056b3;
}

/* Arrow marker styles are defined in the SVG defs */

/* Responsive Breakpoints */
@media (max-width: 1200px) {
  .task-column-header,
  .task-info {
    width: 220px;
    min-width: 220px;
    max-width: 220px;
  }

  .gantt-controls {
    padding: 0.75rem 1rem;
  }

  .full-timeline-grid {
    left: 220px;
  }
}

@media (max-width: 992px) {
  .task-column-header,
  .task-info {
    width: 200px;
    min-width: 200px;
    max-width: 200px;
  }

  .gantt-container {
    max-height: 60vh;
  }

  .filter-controls {
    order: 3;
    width: 100%;
    margin-top: 0.5rem;
  }

  .full-timeline-grid {
    left: 200px;
  }
}

@media (max-width: 768px) {
  .task-column-header,
  .task-info {
    width: 180px;
    min-width: 180px;
    max-width: 180px;
  }

  .gantt-controls {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
    padding: 1rem;
  }

  .filter-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
    order: initial;
    width: auto;
    margin-top: 0;
  }

  .filter-group {
    flex-direction: column;
    align-items: stretch;
    gap: 0.25rem;
  }

  .filter-group input[type='date'] {
    width: 100%;
  }

  .timeline-controls {
    justify-content: center;
  }

  .gantt-container {
    max-height: 50vh;
  }

  .task-title {
    font-size: 0.8rem;
  }

  .task-meta {
    font-size: 0.7rem;
  }

  .full-timeline-grid {
    left: 180px;
  }
}

@media (max-width: 576px) {
  .task-column-header,
  .task-info {
    width: 150px;
    min-width: 150px;
    max-width: 150px;
    padding: 0.5rem;
  }

  .gantt-controls {
    padding: 0.75rem;
  }

  .view-controls {
    justify-content: center;
  }

  .view-btn {
    padding: 0.375rem 0.75rem;
    font-size: 0.8rem;
  }

  .nav-btn,
  .today-btn {
    padding: 0.375rem;
  }

  .today-btn {
    padding: 0.375rem 0.75rem;
    font-size: 0.8rem;
  }

  .gantt-container {
    max-height: 45vh;
  }

  .task-bar {
    height: 20px;
    padding: 0 0.25rem;
  }

  .task-bar-title {
    font-size: 0.7rem;
  }

  .task-bar-progress {
    font-size: 0.65rem;
  }

  .task-days-left {
    font-size: 0.65rem;
    padding: 0.125rem 0.25rem;
  }

  .full-timeline-grid {
    left: 150px;
  }
}

/* Filter Controls Styles */
.filter-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #495057;
  white-space: nowrap;
  flex-shrink: 0;
}

.filter-select {
  padding: 0.375rem 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background: white;
  font-size: 0.875rem;
  cursor: pointer;
  transition:
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
  min-width: 120px;
}

.filter-select:focus {
  border-color: #007bff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.filter-input {
  padding: 0.375rem 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background: white;
  font-size: 0.875rem;
  transition:
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
  min-width: 140px;
}

.filter-input:focus {
  border-color: #007bff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.filter-separator {
  font-size: 0.875rem;
  color: #6c757d;
  margin: 0 0.25rem;
  flex-shrink: 0;
}

.clear-filters-btn {
  padding: 0.375rem 0.75rem;
  border: 1px solid #dc3545;
  background: white;
  color: #dc3545;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
}

.clear-filters-btn:hover {
  background: #dc3545;
  color: white;
}

.clear-filters-btn svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

/* Improved scroll behavior */
.gantt-container::-webkit-scrollbar {
  width: 8px;
  height: 0px;
}

.gantt-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.gantt-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.gantt-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Ensure proper text wrapping and overflow handling */
* {
  box-sizing: border-box;
}

.timeline-header,
.task-row {
  flex-wrap: nowrap;
}

.task-timeline {
  position: relative;
  height: 50px;
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.task-bar {
  position: absolute;
  height: 24px;
  border-radius: 4px;
  cursor: grab;
  transition: all 0.2s;
  overflow: hidden;
  display: flex;
  align-items: center;
  padding: 0 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  position: relative;
  color: white; /* Ensure text is visible on colored backgrounds */
}

.task-bar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  position: relative;
  z-index: 2;
  overflow: hidden;
}

.task-bar-title {
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}

.task-bar-progress {
  font-size: 0.7rem;
  font-weight: 600;
  margin-left: 0.5rem;
  white-space: nowrap;
  flex-shrink: 0;
}

/* Today column highlight across all task rows */
.task-row::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: calc(280px + var(--today-offset, 0px));
  width: var(--column-width);
  background: rgba(33, 150, 243, 0.08);
  pointer-events: none;
  z-index: 1;
  border-left: 1px solid #2196f3;
  border-right: 1px solid #2196f3;
}

.timeline-grid {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  pointer-events: none;
  z-index: 1;
}

.timeline-grid-column {
  position: absolute;
  top: 0;
  bottom: 0;
  border-right: 1px solid #dee2e6;
  pointer-events: none;
}

.timeline-grid-column.today-column {
  background: rgba(33, 150, 243, 0.08);
  border-left: 1px solid #2196f3;
  border-right: 1px solid #2196f3;
}

.hierarchy-lines {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  pointer-events: none;
  z-index: 1;
}

.hierarchy-vertical-line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background: #dee2e6;
  z-index: 1;
}

.hierarchy-horizontal-line {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  pointer-events: none;
  z-index: 1;
}

.status-changer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-select {
  padding: 0.375rem 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background: white;
  font-size: 0.875rem;
  cursor: pointer;
  transition:
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
  min-width: 120px;
}

.status-select:focus {
  border-color: #007bff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

/* Status-specific styling for the select dropdown */
.status-select.todo {
  background: #e2e3e5;
  color: #383d41;
  border-color: #ced4da;
}

.status-select.in-progress {
  background: #cce7ff;
  color: #004085;
  border-color: #4dabf7;
}

.status-select.completed {
  background: #d4edda;
  color: #155724;
  border-color: #28a745;
}

.status-select.on-hold {
  background: #fff3cd;
  color: #856404;
  border-color: #ffc107;
}

.status-select.cancelled {
  background: #f8d7da;
  color: #721c24;
  border-color: #dc3545;
}

.task-bar.priority-critical {
  background: #dc3545;
  color: white;
}

.task-bar.status-completed {
  opacity: 0.7;
}

.task-bar.overdue {
  border: 2px solid #dc3545 !important;
  animation: pulse 2s infinite;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
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

.modal-body {
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #495057;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.875rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: #007bff;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}

.btn-secondary,
.btn-primary {
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.2s;
}

.btn-secondary {
  background-color: #f0f0f0;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.color-picker-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.color-input {
  width: 100px;
  height: 30px;
}

.color-presets {
  display: flex;
  gap: 0.5rem;
}

.color-preset {
  width: 30px;
  height: 30px;
  border: 2px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.color-preset.active {
  border-color: #007bff;
}

.period-resize-handle {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 8px;
  background: rgba(255, 255, 255, 0.4);
  cursor: col-resize;
  opacity: 0;
  transition: opacity 0.2s;
  border-radius: 2px;
}

.period-resize-handle:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.6);
}

.period-resize-handle-left {
  left: 0;
  border-radius: 4px 0 0 4px;
}

.period-resize-handle-right {
  right: 0;
  border-radius: 0 4px 4px 0;
}

.period-resize-handle::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 2px;
  height: 12px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 1px;
  box-shadow: 1px 0 0 rgba(255, 255, 255, 0.7);
}

.period-drag-preview {
  position: absolute;
  height: 24px;
  background: rgba(0, 123, 255, 0.3);
  border: 2px solid #007bff;
  border-radius: 4px;
  z-index: 15;
  pointer-events: none;
  animation: dragPulse 1s ease-in-out infinite alternate;
}

@keyframes dragPulse {
  from {
    opacity: 0.3;
  }
  to {
    opacity: 0.6;
  }
}

@keyframes periodDragPulse {
  from {
    opacity: 0.4;
  }
  to {
    opacity: 0.8;
  }
}

.print-btn {
  padding: 0.375rem 0.75rem;
  border: 1px solid #28a745;
  background: white;
  color: #28a745;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  white-space: nowrap;
  transition: all 0.2s;
}

.print-btn:hover {
  background: #28a745;
  color: white;
}
</style>
