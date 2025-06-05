# Forms Components

This directory contains form components for user input and data entry in the SchoolGantt application.

## Components

### TaskForm.vue

Comprehensive form component for creating and editing tasks.

**Features:**

- Create new tasks or edit existing ones
- Form validation with real-time feedback
- Dependency management interface
- Support for all task properties (title, description, dates, priority, etc.)
- Tag input with comma-separated values
- Complexity scoring (1-10 scale)

**Props:**

- `task` (Object, optional): Task object for editing mode
- `allTasks` (Array): Array of all tasks for dependency selection

**Events:**

- `submit`: Emitted when form is submitted with task data
- `cancel`: Emitted when form is cancelled

**Usage:**

```vue
<template>
  <TaskForm
    :task="editingTask"
    :allTasks="tasks"
    @submit="handleTaskSubmit"
    @cancel="closeTaskModal"
  />
</template>

<script>
import { TaskForm } from '@/components/forms'

export default {
  components: { TaskForm }
}
</script>
```

**Form Fields:**

- **Title** (required): Task name
- **Description**: Detailed task description
- **Start Date** (required): Task start date
- **End Date** (required): Task end date
- **Priority**: Low, Medium, High, Critical
- **Status**: To Do, In Progress, Completed, On Hold, Cancelled
- **Estimated Time**: Human-readable time estimate
- **Complexity**: Numeric complexity score (1-10)
- **Tags**: Comma-separated tags
- **Dependencies**: Task dependency relationships

## Adding New Form Components

When adding new form components to this directory:

1. Create the Vue component file
2. Add the export to `index.js`
3. Update this README with component documentation
4. Follow form validation patterns established in TaskForm
5. Use consistent styling and UX patterns
