// Constants and Enums for SchoolGantt Models
// Extracted from models/index.js for better organization

/**
 * Task Status Constants
 */
export const TaskStatus = {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  ON_HOLD: 'on-hold',
  CANCELLED: 'cancelled'
}

/**
 * Task Priority Constants
 */
export const TaskPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
}

/**
 * Dependency Type Constants
 */
export const DependencyType = {
  FINISH_TO_START: 'finish-to-start',
  START_TO_START: 'start-to-start',
  FINISH_TO_FINISH: 'finish-to-finish',
  START_TO_FINISH: 'start-to-finish'
}

/**
 * Project Status Constants
 */
export const ProjectStatus = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ON_HOLD: 'on-hold',
  CANCELLED: 'cancelled'
}

/**
 * Project Priority Constants
 */
export const ProjectPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
}

/**
 * Submission Type Constants
 */
export const SubmissionType = {
  DIGITAL: 'digital',
  PHYSICAL: 'physical',
  PRESENTATION: 'presentation',
  EXAM: 'exam',
  MIXED: 'mixed'
}

/**
 * Export Format Constants
 */
export const ExportFormat = {
  JSON: 'json',
  CSV: 'csv',
  PDF: 'pdf',
  XML: 'xml'
}

/**
 * Project Template Constants
 */
export const ProjectTemplate = {
  BLANK: 'blank',
  ACADEMIC: 'academic',
  RESEARCH: 'research',
  SOFTWARE_DEV: 'software-dev',
  PERSONAL: 'personal',
  BUSINESS: 'business'
}

/**
 * View Mode Constants
 */
export const ViewMode = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  QUARTER: 'quarter',
  YEAR: 'year'
}

/**
 * Chart Type Constants
 */
export const ChartType = {
  GANTT: 'gantt',
  LIST: 'list',
  CALENDAR: 'calendar',
  BOARD: 'board'
}

/**
 * User Role Constants
 */
export const UserRole = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin'
}

/**
 * Notification Type Constants
 */
export const NotificationType = {
  DUE_DATE_REMINDER: 'due-date-reminder',
  OVERDUE: 'overdue',
  STATUS_CHANGE: 'status-change',
  DEPENDENCY_READY: 'dependency-ready',
  MILESTONE_REACHED: 'milestone-reached'
}

/**
 * Data Source Constants
 */
export const DataSource = {
  LOCAL_STORAGE: 'localStorage',
  API: 'api',
  FILE: 'file',
  IMPORT: 'import'
}

/**
 * Validation Error Types
 */
export const ValidationErrorType = {
  REQUIRED_FIELD: 'required-field',
  INVALID_FORMAT: 'invalid-format',
  INVALID_DATE_RANGE: 'invalid-date-range',
  CIRCULAR_DEPENDENCY: 'circular-dependency',
  INVALID_HIERARCHY: 'invalid-hierarchy',
  DUPLICATE_ID: 'duplicate-id',
  INVALID_REFERENCE: 'invalid-reference'
}

/**
 * Progress Mode Constants
 */
export const ProgressMode = {
  AUTO: 'auto',      // Calculated from subtasks
  MANUAL: 'manual'   // Set explicitly by user
}

/**
 * Default Values
 */
export const Defaults = {
  TASK_PRIORITY: TaskPriority.MEDIUM,
  TASK_STATUS: TaskStatus.TODO,
  PROJECT_PRIORITY: ProjectPriority.MEDIUM,
  PROJECT_STATUS: ProjectStatus.ACTIVE,
  SUBMISSION_TYPE: SubmissionType.DIGITAL,
  EXPORT_FORMAT: ExportFormat.JSON,
  VIEW_MODE: ViewMode.WEEK,
  CHART_TYPE: ChartType.GANTT,
  PROGRESS_MODE: ProgressMode.AUTO,
  COMPLEXITY: 5,
  PROGRESS_WEIGHT: 1,
  LEVEL: 0,
  ORDER: 0,
  IS_EXPANDED: true,
  SHOW_WEEKENDS: false,
  AUTO_SAVE: true,
  ENABLE_DRAG_DROP: true,
  SHOW_DEPENDENCY_ARROWS: true,
  DUE_DATE_REMINDERS: true,
  OVERDUE_HIGHLIGHT: true,
  INCLUDE_COMPLETED_TASKS: true
}

/**
 * Limits and Constraints
 */
export const Limits = {
  MAX_TASK_TITLE_LENGTH: 200,
  MAX_TASK_DESCRIPTION_LENGTH: 2000,
  MAX_PROJECT_NAME_LENGTH: 100,
  MAX_PROJECT_DESCRIPTION_LENGTH: 1000,
  MAX_HIERARCHY_DEPTH: 10,
  MAX_DEPENDENCIES_PER_TASK: 50,
  MAX_SUBTASKS_PER_TASK: 100,
  MAX_TAGS_PER_ITEM: 20,
  MAX_TAG_LENGTH: 50,
  MIN_COMPLEXITY: 1,
  MAX_COMPLEXITY: 10,
  MIN_PROGRESS: 0,
  MAX_PROGRESS: 100
}

/**
 * Regular Expressions for Validation
 */
export const ValidationPatterns = {
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  ISO_DATE: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/,
  TIME_FORMAT: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
  COLOR_HEX: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  GRADE_WEIGHT: /^(100|[1-9]?[0-9])$/  // 0-100
}
