# Charts Components

This directory contains visualization components for the SchoolGantt application.

## Components

### GanttChart.vue

Interactive Gantt chart component for timeline visualization.

**Features:**

- Timeline visualization with multiple view modes (Day/Week/Month)
- Drag-and-drop functionality for task management
- Real-time task updates with automatic persistence
- Color-coded task bars by priority
- Progress indicators and status visualization
- Responsive design with horizontal scrolling

**Props:**

- `tasks` (Array): Array of task objects to display
- `selectedTaskId` (String): ID of currently selected task
- Additional configuration props for view modes and filters

**Events:**

- `task-select`: Emitted when a task is selected
- `task-edit`: Emitted when a task is edited
- `task-update`: Emitted when a task is updated
- `task-update-preview`: Emitted during drag operations

**Usage:**

```vue
<template>
  <GanttChart
    :tasks="tasks"
    :selected-task-id="selectedTaskId"
    @task-select="selectTask"
    @task-edit="editTask"
    @task-update="handleTaskUpdate"
  />
</template>

<script>
import { GanttChart } from '@/components/charts'

export default {
  components: { GanttChart }
}
</script>
```

## Adding New Chart Components

When adding new chart components to this directory:

1. Create the Vue component file
2. Add the export to `index.js`
3. Update this README with component documentation
4. Follow the established naming conventions (PascalCase)
