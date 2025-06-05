# SchoolGantt UI Mockups

## Main Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│ SchoolGantt                                    [Add Task] [Settings] │
│ Personal Project Timeline Manager                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ┌─ Timeline View ──────────────────────────────────────────────────┐ │
│ │ [Month View] [Week View] [Day View]           [Today] [Export]   │ │
│ │                                                                 │ │
│ │     Task Name           │ Jan 15 │ Jan 22 │ Jan 29 │ Feb 05     │ │
│ │ ──────────────────────────────────────────────────────────────── │ │
│ │ 📚 Research Phase      │████████│        │        │             │ │
│ │ ✏️  Writing Phase       │        │████████│████████│             │ │
│ │ 🔍 Review Phase        │        │        │        │███████      │ │
│ │ 📝 Final Draft         │        │        │        │      ██████ │ │
│ │                                                                 │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ ┌─ Task Details Panel ─────────────────────────────────────────────┐ │
│ │ Selected Task: Research Phase                    [Edit] [Delete] │ │
│ │                                                                 │ │
│ │ Status: In Progress    Priority: High    Duration: 7 days       │ │
│ │ Start: Jan 15, 2025    End: Jan 22, 2025                       │ │
│ │                                                                 │ │
│ │ Description: Gather sources and conduct preliminary research    │ │
│ │ for the project topic.                                          │ │
│ │                                                                 │ │
│ │ Dependencies: None                                              │ │
│ │ Subtasks: □ Find sources □ Take notes □ Organize materials      │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

## Add/Edit Task Modal

```
         ┌─ Add New Task ──────────────────────────────────┐
         │                                    [×]         │
         │ Task Title                                      │
         │ ┌─────────────────────────────────────────────┐ │
         │ │ Research Phase                              │ │
         │ └─────────────────────────────────────────────┘ │
         │                                                 │
         │ Description                                     │
         │ ┌─────────────────────────────────────────────┐ │
         │ │ Gather sources and conduct preliminary      │ │
         │ │ research for the project topic.             │ │
         │ │                                             │ │
         │ └─────────────────────────────────────────────┘ │
         │                                                 │
         │ Start Date        End Date        Priority      │
         │ ┌─────────────┐   ┌─────────────┐ ┌───────────┐ │
         │ │ 2025-01-15  │   │ 2025-01-22  │ │ High ▼    │ │
         │ └─────────────┘   └─────────────┘ └───────────┘ │
         │                                                 │
         │ Dependencies                                    │
         │ ┌─────────────────────────────────────────────┐ │
         │ │ Select tasks this depends on...        ▼   │ │
         │ └─────────────────────────────────────────────┘ │
         │                                                 │
         │              [Cancel]    [Save Task]            │
         └─────────────────────────────────────────────────┘
```

## Mobile Layout

```
┌─────────────────────────────────┐
│ ☰ SchoolGantt           [+]     │
├─────────────────────────────────┤
│                                 │
│ ┌─ Today's Tasks ─────────────┐ │
│ │ 📚 Research Phase           │ │
│ │ ████████████████████ 80%    │ │
│ │ Due: Jan 22                 │ │
│ │                             │ │
│ │ ✏️ Writing Phase            │ │
│ │ ░░░░░░░░░░░░░░░░░░░░ 0%     │ │
│ │ Starts: Jan 23              │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─ This Week ─────────────────┐ │
│ │ Mon │ Tue │ Wed │ Thu │ Fri │ │
│ │ ────┼─────┼─────┼─────┼──── │ │
│ │ 📚  │ 📚  │ 📚  │ ✏️   │ ✏️  │ │
│ │     │     │     │     │     │ │
│ └─────────────────────────────┘ │
│                                 │
│ [Timeline] [Tasks] [Settings]   │
└─────────────────────────────────┘
```

## Color-Coded Task States

### Task Bar Colors
- **Completed**: Green (#28a745) with checkmark
- **In Progress**: Blue (#007bff) with progress indicator
- **Not Started**: Light gray (#e9ecef) with dashed border
- **Overdue**: Red (#dc3545) with warning icon
- **On Hold**: Orange (#ffc107) with pause icon

### Priority Indicators
- **High**: Red dot or border
- **Medium**: Yellow dot or border  
- **Low**: Green dot or border

### Dependency Arrows
- **Standard**: Gray curved lines connecting tasks
- **Critical Path**: Bold blue lines
- **Blocked**: Red dashed lines

## Interactive Elements

### Drag and Drop
- Tasks can be dragged horizontally to adjust dates
- Tasks can be dragged vertically to reorder
- Dependency lines update dynamically

### Hover States
- Task bars show tooltip with details
- Buttons show subtle elevation
- Interactive elements have visual feedback

### Loading States
- Skeleton loading for task list
- Progress spinners for save operations
- Smooth transitions between views

## Accessibility Features

### Color Blind Support
- All information available without color dependency
- High contrast mode available
- Pattern/texture alternatives to color coding

### Keyboard Navigation
- Tab through all interactive elements
- Arrow keys for timeline navigation
- Enter/Space for activation
- Escape to close modals

### Screen Reader Support
- Semantic HTML structure
- ARIA labels for complex elements
- Alternative text for visual information
- Announced state changes
