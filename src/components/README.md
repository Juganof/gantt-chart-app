# Components Directory

This directory contains all Vue.js components for the SchoolGantt application, organized by functionality and purpose.

## Directory Structure

```
components/
├── charts/          # Visualization components
│   ├── GanttChart.vue
│   ├── index.js
│   └── README.md
├── forms/           # Input and form components
│   ├── TaskForm.vue
│   ├── index.js
│   └── README.md
├── ui/              # User interface display components
│   ├── TaskCard.vue
│   ├── index.js
│   └── README.md
├── management/      # Data management and admin components
│   ├── DataManager.vue
│   ├── index.js
│   └── README.md
├── index.js         # Main barrel export
└── README.md        # This file
```

## Component Categories

### 📊 Charts (`./charts/`)

Components for data visualization and interactive displays.

- **GanttChart.vue**: Interactive timeline visualization with drag-and-drop functionality

### 📝 Forms (`./forms/`)

Components for user input, data entry, and form handling.

- **TaskForm.vue**: Comprehensive task creation and editing form

### 🎨 UI (`./ui/`)

Components for displaying information and providing user interactions.

- **TaskCard.vue**: Card-based task display with status indicators

### ⚙️ Management (`./management/`)

Components for system administration and data management.

- **DataManager.vue**: Project data import/export and backup management

## Usage Patterns

### Importing Components

**Individual Import:**

```javascript
import { GanttChart } from '@/components/charts'
import { TaskForm } from '@/components/forms'
import { TaskCard } from '@/components/ui'
import { DataManager } from '@/components/management'
```

**Bulk Import:**

```javascript
import { GanttChart, TaskForm, TaskCard, DataManager } from '@/components'
```

### Component Registration

```javascript
export default {
  components: {
    GanttChart,
    TaskForm,
    TaskCard,
    DataManager
  }
}
```

## Development Guidelines

### Adding New Components

1. **Choose the appropriate directory** based on component purpose:

   - `charts/` for visualization components
   - `forms/` for input/form components
   - `ui/` for display/interaction components
   - `management/` for admin/system components

2. **Create the component file** following Vue.js best practices:

   - Use PascalCase for component names
   - Include comprehensive prop validation
   - Document events and slots
   - Follow the established styling patterns

3. **Update the barrel exports**:

   - Add export to the directory's `index.js`
   - Update the main `components/index.js` if needed

4. **Update documentation**:
   - Add component documentation to the directory's README
   - Include usage examples and API documentation
   - Update this main README if adding new categories

### Naming Conventions

- **Components**: PascalCase (e.g., `TaskCard.vue`, `GanttChart.vue`)
- **Files**: PascalCase for components, camelCase for utilities
- **Exports**: Named exports using PascalCase
- **Props**: camelCase
- **Events**: kebab-case

### Code Standards

- Use Vue 3 Composition API or Options API consistently
- Include prop validation with types and defaults
- Document all props, events, and slots
- Follow the established CSS/SCSS patterns
- Ensure responsive design
- Include accessibility attributes where appropriate

## Architecture Notes

### Barrel Exports

Each directory includes an `index.js` file that exports all components from that directory. This enables clean imports and better organization.

### Component Communication

- **Props down**: Pass data to child components via props
- **Events up**: Emit events to parent components for actions
- **Vuex store**: Use for global state management
- **Provide/Inject**: Use sparingly for deeply nested component communication

### Styling Approach

- Scoped CSS in component files
- Global styles in `src/styles/`
- CSS custom properties for theming
- Responsive design with mobile-first approach

## Testing

Each component should include:

- Unit tests for component logic
- Integration tests for component interactions
- Visual regression tests for UI components
- Accessibility tests for interactive components

Test files should be placed alongside components or in a `__tests__` directory within each category.

## Performance Considerations

- Use `v-show` vs `v-if` appropriately
- Implement lazy loading for heavy components
- Use computed properties for expensive calculations
- Consider component splitting for large components
- Implement proper key attributes for list rendering
