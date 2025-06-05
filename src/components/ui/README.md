# UI Components

This directory contains user interface components for displaying information and providing user interactions in the SchoolGantt application.

## Components

### TaskCard.vue

Card component for displaying task information in a compact, visually appealing format.

**Features:**

- Displays all key task information (title, description, dates, status, priority)
- Visual indicators for task urgency and days remaining
- Interactive edit and delete buttons
- Responsive design with hover effects
- Status-based styling and color coding
- Tag display and complexity indicators

**Props:**

- `task` (Object, required): Task object containing all task data

**Events:**

- `edit`: Emitted when edit button is clicked, passes task object
- `delete`: Emitted when delete button is clicked, passes task ID

**Usage:**

```vue
<template>
  <TaskCard
    v-for="task in tasks"
    :key="task.id"
    :task="task"
    @edit="editTask"
    @delete="confirmDeleteTask"
  />
</template>

<script>
import { TaskCard } from '@/components/ui'

export default {
  components: { TaskCard }
}
</script>
```

**Visual Features:**

- **Priority Indicators**: Color-coded priority levels
- **Status Badges**: Visual status representation
- **Days Left Indicator**: Urgency-based countdown with color coding
- **Duration Display**: Human-readable task duration
- **Tag Pills**: Visual tag representation
- **Completion State**: Visual styling for completed tasks

**Urgency Classes:**

- `overdue`: Red styling for overdue tasks
- `due-today`: Orange styling for tasks due today
- `due-soon`: Yellow styling for tasks due within 3 days
- `due-normal`: Blue styling for tasks due within a week
- `due-later`: Gray styling for tasks due later

## Adding New UI Components

When adding new UI components to this directory:

1. Create the Vue component file
2. Add the export to `index.js`
3. Update this README with component documentation
4. Follow the established design system and color schemes
5. Ensure responsive design and accessibility
6. Use consistent hover and interaction patterns
