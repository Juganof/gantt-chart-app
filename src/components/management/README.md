# Management Components

This directory contains components for data management, administration, and system operations in the SchoolGantt application.

## Components

### DataManager.vue

Component for handling project data import/export operations and backup management.

**Features:**

- Export project data as JSON files for backup
- Import previously exported project files
- Data validation and migration support
- User-friendly file selection interface
- Progress indicators and status messages
- Warning prompts for destructive operations

**Props:**
None - component manages its own state

**Events:**

- `import-success`: Emitted when data import is successful

**Usage:**

```vue
<template>
  <DataManager @import-success="handleImportSuccess" />
</template>

<script>
import { DataManager } from '@/components/management'

export default {
  components: { DataManager }
}
</script>
```

**Functionality:**

- **Export Operations**:

  - Downloads complete project data as JSON
  - Includes tasks, project metadata, and configuration
  - Preserves data relationships and structure
  - Provides export statistics (task count, last updated)

- **Import Operations**:

  - Validates JSON file format before import
  - Replaces current project data (with user confirmation)
  - Handles data migration for version compatibility
  - Provides detailed success/error feedback

- **Safety Features**:
  - Confirmation dialogs for destructive operations
  - File type validation (JSON only)
  - Error handling with user-friendly messages
  - Progress indicators for long operations

**Data Format:**
The component works with the standard SchoolGantt project data format including:

- Tasks array with full task objects
- Project metadata and configuration
- Data version information for migration
- Timestamps and audit information

## Adding New Management Components

When adding new management components to this directory:

1. Create the Vue component file
2. Add the export to `index.js`
3. Update this README with component documentation
4. Follow data safety and validation patterns
5. Implement proper error handling and user feedback
6. Consider data migration and backward compatibility
