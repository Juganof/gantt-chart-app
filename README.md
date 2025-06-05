# SchoolGantt - Personal Project Timeline Manager

A Vue.js-based Gantt chart application for managing school project tasks with an intuitive interface and local storage persistence.

## Features Implemented

### ✅ Task 1: Vue.js Project Setup
- Vue.js 3 with Composition API
- Vuex for state management
- Vite build system
- Modern project structure

### ✅ Task 2: UI Design System
- Clean, minimalist interface
- Responsive design
- Modern component styling
- Consistent color scheme and typography

### ✅ Task 3: CRUD Operations (Current Implementation)
- **Create Tasks**: Full task creation form with validation
- **Read Tasks**: Display tasks in organized card layout
- **Update Tasks**: Edit existing tasks with pre-populated forms
- **Delete Tasks**: Confirmation dialog for safe task deletion

#### Task Management Features:
- **Task Properties**:
  - Title and description
  - Start and end dates with validation
  - Priority levels (Low, Medium, High, Critical)
  - Status tracking (To Do, In Progress, Completed, On Hold, Cancelled)
  - Estimated time and complexity scoring
  - Tags for categorization

- **Smart Sorting**: Tasks automatically sorted by:
  1. Status priority (In Progress → To Do → On Hold → Completed → Cancelled)
  2. Priority level (Critical → High → Medium → Low)
  3. Start date

- **Task Statistics**: Header shows total, completed, and in-progress task counts

- **Local Storage**: All data persists automatically in browser storage

### ✅ Task 4: Gantt Chart Visualization
- **Timeline View**: Interactive Gantt chart with horizontal task bars
- **Multiple View Modes**: Day, Week, and Month timeline views
- **Visual Task Representation**: Color-coded bars based on priority and status
- **Progress Tracking**: Visual progress indicators for in-progress tasks
- **Today Indicator**: Red line showing current date on timeline
- **Task Selection**: Click tasks to select and highlight them
- **Responsive Design**: Horizontal scrolling for large timelines
- **Overdue Detection**: Pulsing animation for overdue tasks

### ✅ Task 5: Drag-and-Drop Functionality (Current Implementation)
- **Task Bar Dragging**: Click and drag task bars to move them along the timeline
- **Duration Resizing**: Drag the left or right edges of task bars to adjust start/end dates
- **Visual Feedback**: Real-time preview of changes during drag operations
- **Grid Snapping**: Automatic alignment to daily columns for precise positioning
- **Drag States**: Visual indicators showing dragging, moving, and resizing states
- **Keyboard Support**: Press Escape key to cancel drag operations
- **Smart Constraints**: Prevents dragging completed tasks to maintain data integrity
- **Live Updates**: Task dates update in real-time with automatic persistence

#### Gantt Chart Features:
- **Timeline Navigation**: Previous/Next period and "Go to Today" buttons
- **View Toggle**: Switch between Cards view and Timeline view
- **Interactive Task Bars**: 
  - Color-coded by priority (Green=Low, Yellow=Medium, Orange=High, Red=Critical)
  - Status indicators (Completed tasks are grayed out)
  - Progress overlay for in-progress tasks
  - Hover effects and tooltips
  - **Drag-and-Drop**: Move and resize tasks directly on the timeline
  - **Resize Handles**: Visual indicators on left/right edges for duration adjustment
- **Date Management**: Automatic timeline range calculation based on task dates
- **Weekend Highlighting**: Visual distinction for weekend days
- **Task Information**: Task title, duration, and status displayed in sidebar
- **Real-time Updates**: Changes are immediately saved and reflected across the interface

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd gant-chart-app

# Install dependencies
npm install

# Start development server
npm run dev
```

### Usage

1. **Creating Tasks**:
   - Click "Add Task" button
   - Fill in required fields (title, start date, end date)
   - Set priority, status, and other optional fields
   - Click "Create Task"

2. **Editing Tasks**:
   - Click the edit icon (pencil) on any task card
   - Modify fields as needed
   - Click "Update Task"

3. **Deleting Tasks**:
   - Click the delete icon (trash) on any task card
   - Confirm deletion in the popup dialog

4. **Viewing Timeline**:
   - Switch to "Timeline" view to see the Gantt chart
   - Use view controls (Day/Week/Month) to change timeline granularity
   - Navigate using Previous/Next buttons or "Go to Today"

5. **Drag-and-Drop Operations**:
   - **Moving Tasks**: Click and drag any task bar to move it to a new date
   - **Resizing Duration**: Drag the left edge to change start date, right edge to change end date
   - **Visual Feedback**: See real-time preview of changes while dragging
   - **Canceling**: Press Escape key to cancel any drag operation
   - **Constraints**: Completed tasks cannot be moved to prevent data corruption

## Project Structure

```
src/
├── components/           # Vue.js components organized by functionality
│   ├── charts/          # Visualization components
│   │   ├── GanttChart.vue    # Interactive Gantt chart with drag-and-drop
│   │   ├── index.js          # Barrel export
│   │   └── README.md         # Component documentation
│   ├── forms/           # Input and form components
│   │   ├── TaskForm.vue      # Task creation/editing form
│   │   ├── index.js          # Barrel export
│   │   └── README.md         # Component documentation
│   ├── ui/              # User interface display components
│   │   ├── TaskCard.vue      # Individual task display
│   │   ├── index.js          # Barrel export
│   │   └── README.md         # Component documentation
│   ├── management/      # Data management components
│   │   ├── DataManager.vue   # Import/export functionality
│   │   ├── index.js          # Barrel export
│   │   └── README.md         # Component documentation
│   ├── index.js         # Main component barrel export
│   └── README.md        # Component directory documentation
├── views/
│   └── GanttView.vue    # Main application view with task management
├── store/
│   └── index.js         # Vuex store for state management
├── models/
│   └── index.js         # Data models and utilities
├── styles/              # Global styles and themes
├── assets/              # Static assets (images, fonts)
└── App.vue              # Root component
```

### Component Organization

The components are organized into logical categories:

- **📊 Charts**: Visualization and interactive display components
- **📝 Forms**: Input forms and data entry components  
- **🎨 UI**: User interface and display components
- **⚙️ Management**: Data management and administrative components

Each component directory includes:
- Component files (`.vue`)
- Barrel export file (`index.js`)
- Documentation (`README.md`)

This structure provides:
- **Clear separation of concerns** by component type
- **Easy navigation** and component discovery
- **Scalable architecture** for future component additions
- **Better IDE/AI understanding** of project structure
- **Consistent import patterns** using barrel exports

## Data Model

Tasks include the following properties:
- `id`: Unique identifier (UUID)
- `title`: Task name (required)
- `description`: Detailed description
- `startDate`: Start date (required)
- `endDate`: End date (required)
- `priority`: Priority level (low/medium/high/critical)
- `status`: Current status (todo/in-progress/completed/on-hold/cancelled)
- `estimatedTime`: Human-readable duration estimate
- `complexity`: Complexity score (1-10)
- `tags`: Array of categorization tags
- `created`: Creation timestamp
- `updated`: Last modification timestamp

## Next Steps

The following features are planned for future implementation:
- **Task 6**: Task dependencies and relationships
- **Task 7**: Data export/import capabilities
- **Task 8**: Performance optimization and caching

## Technology Stack

- **Frontend**: Vue.js 3, Vuex
- **Build Tool**: Vite
- **Styling**: CSS3 with scoped components
- **Storage**: Browser LocalStorage
- **Icons**: Inline SVG icons

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is for educational purposes. 