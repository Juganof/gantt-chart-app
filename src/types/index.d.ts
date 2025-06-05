// Global type definitions for SchoolGantt application

export interface Task {
  id: string
  title: string
  description?: string
  startDate: string
  endDate: string
  status: TaskStatus
  priority: TaskPriority
  estimatedTime?: string
  actualTime?: string
  complexity?: number
  tags?: string[]
  dependencies?: TaskDependency[]
  subtasks?: string[] // Array of subtask IDs (maintained for backward compatibility)
  parentTask?: string
  // Enhanced hierarchy support
  level?: number // Depth level in hierarchy (0 = root task, 1 = first level subtask, etc.)
  hierarchyPath?: string[] // Array of parent IDs from root to current task (excluding self)
  order?: number // Order within the same parent/level for sorting
  isExpanded?: boolean // Whether subtasks are visible in UI
  // Progress tracking
  progressWeight?: number // Weight for progress calculation (default 1)
  progressMode?: 'auto' | 'manual' // 'auto' (from subtasks) or 'manual' (set explicitly)
  manualProgress?: number // Manual progress percentage if progressMode is 'manual'
  projectId?: string
  created: string
  updated: string
  aiGenerated?: boolean
  color?: string
  position?: number
}

export type TaskStatus = 'todo' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled'

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical'

export interface TaskDependency {
  fromTaskId: string
  toTaskId: string
  type: DependencyType
  lag?: number
}

export type DependencyType =
  | 'finish-to-start'
  | 'start-to-start'
  | 'finish-to-finish'
  | 'start-to-finish'

export interface Project {
  id: string
  name: string
  description?: string
  subject?: string
  semester?: string
  instructor?: string
  gradeWeight?: number
  dueDate?: string
  submissionType?: SubmissionType
  priority?: ProjectPriority
  status?: ProjectStatus
  color?: string
  tags?: string[]
  milestones?: Milestone[]
  completionPercentage?: number
  created: string
  updated: string
}

export type ProjectStatus = 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled'

export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical'

export type SubmissionType = 'online' | 'physical' | 'presentation' | 'exam' | 'project'

export interface Milestone {
  id: string
  title: string
  description?: string
  dueDate: string
  completed: boolean
  tasks?: string[]
}

export interface AppState {
  tasks: Task[]
  currentProject: Project
  dataVersion: string
  lastSaved?: string
  isDirty: boolean
}

export interface GanttChartProps {
  tasks: Task[]
  selectedTaskId?: string
}

export interface TaskFormProps {
  task?: Task | null
  allTasks: Task[]
}

export interface TaskCardProps {
  task: Task
}

export interface DataManagerProps {
  // No props - component manages its own state
}

// Vue component events
export interface TaskEvents {
  'task-select': (taskId: string) => void
  'task-edit': (task: Task) => void
  'task-update': (task: Task) => void
  'task-update-preview': (task: Task) => void
}

export interface FormEvents {
  submit: (task: Task) => void
  cancel: () => void
}

export interface CardEvents {
  edit: (task: Task) => void
  delete: (taskId: string) => void
}

export interface DataEvents {
  'import-success': (data: AppState) => void
}

// Utility types
export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export interface ExportData {
  version: string
  exportDate: string
  project: Project
  tasks: Task[]
  metadata: {
    taskCount: number
    completedTasks: number
    totalProjects: number
  }
}

// Vuex store types
export interface RootState extends AppState {}

export interface StoreGetters {
  allTasks: (state: RootState) => Task[]
  completedTasks: (state: RootState) => Task[]
  pendingTasks: (state: RootState) => Task[]
  taskById: (state: RootState) => (id: string) => Task | undefined
  tasksByProject: (state: RootState) => (projectId: string) => Task[]
  taskDependencies: (state: RootState) => (taskId: string) => TaskDependency[]
  projectStats: (state: RootState) => {
    totalTasks: number
    completedTasks: number
    inProgressTasks: number
    completionPercentage: number
  }
}

// Component instance types for better IDE support
export interface GanttChartInstance {
  selectTask: (taskId: string) => void
  updateTask: (task: Task) => void
  refreshTimeline: () => void
}

export interface TaskFormInstance {
  validateForm: () => ValidationResult
  resetForm: () => void
  submitForm: () => void
}

// Global constants
export const TASK_STATUSES: readonly TaskStatus[]
export const TASK_PRIORITIES: readonly TaskPriority[]
export const DEPENDENCY_TYPES: readonly DependencyType[]
export const PROJECT_STATUSES: readonly ProjectStatus[]
export const SUBMISSION_TYPES: readonly SubmissionType[]
