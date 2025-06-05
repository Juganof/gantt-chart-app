<!--
  ViewSwitcher.vue - Multi-View Task Display Component
  
  Features:
  - Seamless switching between Gantt, List, and Calendar views
  - Shared data source and event handling
  - Consistent filtering and selection across views
  - View preference persistence
-->
<template>
  <div class="view-switcher">
    <!-- View Selection Controls -->
    <div class="view-controls">
      <div class="view-tabs">
        <button
          v-for="view in availableViews"
          :key="view.value"
          @click="setCurrentView(view.value)"
          :class="['view-tab', { active: currentView === view.value }]"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <g v-if="view.value === 'gantt'">
              <rect x="3" y="6" width="18" height="4" rx="1"></rect>
              <rect x="6" y="14" width="12" height="4" rx="1"></rect>
            </g>
            <g v-else-if="view.value === 'list'">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </g>
            <g v-else-if="view.value === 'calendar'">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </g>
            <g v-else-if="view.value === 'multi-month'">
              <!-- First calendar -->
              <rect x="2" y="3" width="9" height="9" rx="1" ry="1"></rect>
              <line x1="4" y1="1" x2="4" y2="5"></line>
              <line x1="9" y1="1" x2="9" y2="5"></line>
              <line x1="2" y1="6" x2="11" y2="6"></line>
              <!-- Second calendar -->
              <rect x="13" y="3" width="9" height="9" rx="1" ry="1"></rect>
              <line x1="15" y1="1" x2="15" y2="5"></line>
              <line x1="20" y1="1" x2="20" y2="5"></line>
              <line x1="13" y1="6" x2="22" y2="6"></line>
              <!-- Third calendar -->
              <rect x="2" y="14" width="9" height="9" rx="1" ry="1"></rect>
              <line x1="4" y1="12" x2="4" y2="16"></line>
              <line x1="9" y1="12" x2="9" y2="16"></line>
              <line x1="2" y1="17" x2="11" y2="17"></line>
              <!-- Fourth calendar -->
              <rect x="13" y="14" width="9" height="9" rx="1" ry="1"></rect>
              <line x1="15" y1="12" x2="15" y2="16"></line>
              <line x1="20" y1="12" x2="20" y2="16"></line>
              <line x1="13" y1="17" x2="22" y2="17"></line>
            </g>
          </svg>
          {{ view.label }}
        </button>
      </div>

      <div class="view-info">
        <span class="task-count">{{ tasks.length }} tasks</span>
        <span v-if="filteredTaskCount !== tasks.length" class="filtered-count">
          ({{ filteredTaskCount }} filtered)
        </span>
      </div>
    </div>

    <!-- View Content -->
    <div class="view-content">
      <!-- Gantt Chart View -->
      <GanttChart
        v-if="currentView === 'gantt'"
        :tasks="tasks"
        :selected-task-id="selectedTaskId"
        @task-select="handleTaskSelect"
        @task-edit="handleTaskEdit"
        @task-update="handleTaskUpdate"
        @task-update-preview="handleTaskUpdatePreview"
        @task-drag-cancelled="handleTaskDragCancelled"
      />

      <!-- List View -->
      <ListView
        v-else-if="currentView === 'list'"
        :tasks="tasks"
        :selected-task-id="selectedTaskId"
        @task-select="handleTaskSelect"
        @task-edit="handleTaskEdit"
      />

      <!-- Calendar View -->
      <CalendarView
        v-else-if="currentView === 'calendar'"
        :tasks="tasks"
        :selected-task-id="selectedTaskId"
        @task-select="handleTaskSelect"
        @task-edit="handleTaskEdit"
        @date-select="handleDateSelect"
      />

      <!-- Multi-Month Calendar View -->
      <MultiMonthCalendarView
        v-else-if="currentView === 'multi-month'"
        :tasks="tasks"
        :selected-task-id="selectedTaskId"
        @task-select="handleTaskSelect"
        @task-edit="handleTaskEdit"
        @date-select="handleDateSelect"
      />
    </div>
  </div>
</template>

<script>
import CalendarView from './CalendarView.vue'
import GanttChart from './GanttChart.vue'
import ListView from './ListView.vue'
import MultiMonthCalendarView from './MultiMonthCalendarView.vue'

export default {
  name: 'ViewSwitcher',
  components: {
    GanttChart,
    ListView,
    CalendarView,
    MultiMonthCalendarView
  },
  props: {
    tasks: {
      type: Array,
      default: () => []
    },
    selectedTaskId: {
      type: String,
      default: null
    },
    defaultView: {
      type: String,
      default: 'gantt',
      validator: value => ['gantt', 'list', 'calendar', 'multi-month'].includes(value)
    }
  },
  emits: [
    'task-select',
    'task-edit',
    'task-update',
    'task-update-preview',
    'task-drag-cancelled',
    'date-select',
    'view-change'
  ],
  data() {
    return {
      currentView: this.defaultView,
      availableViews: [
        {
          value: 'gantt',
          label: 'Timeline',
          description: 'Gantt chart with timeline visualization'
        },
        {
          value: 'list',
          label: 'List',
          description: 'Tabular view with sorting and filtering'
        },
        {
          value: 'calendar',
          label: 'Calendar',
          description: 'Monthly calendar with task events'
        },
        {
          value: 'multi-month',
          label: 'Multi-Month',
          description: 'Multiple months view with scrolling'
        }
      ]
    }
  },
  computed: {
    filteredTaskCount() {
      // This would be updated by child components to reflect their filtered state
      // For now, return total count as placeholder
      return this.tasks.length
    }
  },
  methods: {
    setCurrentView(view) {
      if (this.currentView !== view) {
        this.currentView = view
        this.saveViewPreference(view)
        this.$emit('view-change', view)
      }
    },
    handleTaskSelect(taskId) {
      this.$emit('task-select', taskId)
    },
    handleTaskEdit(task) {
      this.$emit('task-edit', task)
    },
    handleTaskUpdate(event) {
      this.$emit('task-update', event)
    },
    handleTaskUpdatePreview(event) {
      this.$emit('task-update-preview', event)
    },
    handleTaskDragCancelled() {
      this.$emit('task-drag-cancelled')
    },
    handleDateSelect(date) {
      this.$emit('date-select', date)
    },
    saveViewPreference(view) {
      try {
        localStorage.setItem('task-view-preference', view)
      } catch (e) {
        console.warn('Could not save view preference:', e)
      }
    },
    loadViewPreference() {
      try {
        const saved = localStorage.getItem('task-view-preference')
        if (saved && this.availableViews.some(v => v.value === saved)) {
          this.currentView = saved
        }
      } catch (e) {
        console.warn('Could not load view preference:', e)
      }
    },
    // Keyboard shortcuts for view switching
    handleKeydown(event) {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case '1':
            event.preventDefault()
            this.setCurrentView('gantt')
            break
          case '2':
            event.preventDefault()
            this.setCurrentView('list')
            break
          case '3':
            event.preventDefault()
            this.setCurrentView('calendar')
            break
          case '4':
            event.preventDefault()
            this.setCurrentView('multi-month')
            break
        }
      }
    }
  },
  mounted() {
    this.loadViewPreference()

    // Add keyboard shortcuts
    document.addEventListener('keydown', this.handleKeydown)
  },
  beforeUnmount() {
    // Clean up keyboard event listener
    document.removeEventListener('keydown', this.handleKeydown)
  }
}
</script>

<style scoped>
.view-switcher {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.view-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
  flex-wrap: wrap;
  gap: 1rem;
}

.view-tabs {
  display: flex;
  gap: 0.25rem;
  background: #e9ecef;
  border-radius: 6px;
  padding: 0.25rem;
}

.view-tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6c757d;
  transition: all 0.2s;
  white-space: nowrap;
}

.view-tab:hover {
  background: rgba(255, 255, 255, 0.7);
  color: #495057;
}

.view-tab.active {
  background: white;
  color: #007bff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.view-tab svg {
  flex-shrink: 0;
}

.view-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6c757d;
}

.task-count {
  font-weight: 500;
  color: #495057;
}

.filtered-count {
  color: #007bff;
}

.view-content {
  /* Remove default padding since child components handle their own spacing */
  position: relative;
}

/* Responsive Design */
@media (max-width: 768px) {
  .view-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .view-tabs {
    justify-content: center;
  }

  .view-tab {
    flex: 1;
    justify-content: center;
    padding: 0.75rem 0.5rem;
  }

  .view-info {
    justify-content: center;
  }
}

@media (max-width: 576px) {
  .view-controls {
    padding: 1rem;
  }

  .view-tab {
    font-size: 0.8rem;
    padding: 0.5rem 0.25rem;
  }

  .view-tab svg {
    width: 14px;
    height: 14px;
  }
}

/* Focus states for accessibility */
.view-tab:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

/* Smooth transitions between views */
.view-content {
  transition: opacity 0.2s ease-in-out;
}

/* Loading state (if needed in future) */
.view-content.loading {
  opacity: 0.6;
  pointer-events: none;
}
</style>
