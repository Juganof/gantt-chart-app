// Task model factory and related functions
// Extracted from models/index.js for better organization

import { generateId } from './utils/id-generator.js'
import { TaskStatus, TaskPriority, DependencyType, Defaults, ProgressMode } from './constants.js'

/**
 * Create a new task object with default values
 */
export function createTask(taskData = {}) {
  return {
    id: generateId(),
    title: '',
    description: '',
    status: Defaults.TASK_STATUS,
    priority: Defaults.TASK_PRIORITY,
    startDate: '',
    endDate: '',
    estimatedTime: '',
    actualTime: null,
    dependencies: [], // Array of dependency objects: {fromTaskId, type, lag}
    subtasks: [], // Array of subtask IDs (maintained for backward compatibility)
    parentTask: null, // ID of parent task (for subtask relationships)
    // Enhanced hierarchy support
    level: Defaults.LEVEL, // Depth level in hierarchy (0 = root task, 1 = first level subtask, etc.)
    hierarchyPath: [], // Array of parent IDs from root to current task (excluding self)
    order: Defaults.ORDER, // Order within the same parent/level for sorting
    isExpanded: Defaults.IS_EXPANDED, // Whether subtasks are visible in UI
    // Progress tracking
    progressWeight: Defaults.PROGRESS_WEIGHT, // Weight for progress calculation (default 1, can be adjusted)
    progressMode: Defaults.PROGRESS_MODE, // 'auto' (from subtasks) or 'manual' (set explicitly)
    manualProgress: 0, // Manual progress percentage if progressMode is 'manual'
    projectId: null, // ID of the project this task belongs to
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    tags: [],
    complexity: Defaults.COMPLEXITY,
    aiGenerated: false,
    color: null,
    position: null,
    ...taskData
  }
}

/**
 * Create a new task dependency
 */
export function createTaskDependency(dependencyData = {}) {
  return {
    id: generateId(),
    fromTaskId: '',
    toTaskId: '',
    type: DependencyType.FINISH_TO_START,
    lag: 0,
    ...dependencyData
  }
}

/**
 * Create a subtask from an existing task
 */
export function createSubtask(parentTaskId, subtaskData = {}) {
  const subtask = createTask({
    parentTask: parentTaskId,
    level: 1, // Will be updated based on parent's level
    ...subtaskData
  })
  
  return subtask
}

/**
 * Clone a task with a new ID
 */
export function cloneTask(originalTask, overrides = {}) {
  const cloned = createTask({
    ...originalTask,
    id: generateId(),
    title: `${originalTask.title} (Copy)`,
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    dependencies: [], // Don't copy dependencies to avoid conflicts
    subtasks: [], // Don't copy subtasks
    parentTask: null, // Remove parent relationship
    level: 0,
    hierarchyPath: [],
    ...overrides
  })
  
  return cloned
}

/**
 * Update task with new data and timestamp
 */
export function updateTask(task, updates) {
  return {
    ...task,
    ...updates,
    updated: new Date().toISOString()
  }
}

/**
 * Calculate task duration in days
 */
export function getTaskDuration(task) {
  if (!task.startDate || !task.endDate) return 0
  
  const start = new Date(task.startDate)
  const end = new Date(task.endDate)
  const diffTime = Math.abs(end - start)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays
}

/**
 * Check if task is overdue
 */
export function isTaskOverdue(task) {
  if (!task.endDate || task.status === TaskStatus.COMPLETED) return false
  
  const now = new Date()
  const endDate = new Date(task.endDate)
  
  return now > endDate
}

/**
 * Check if task is active (in progress or todo)
 */
export function isTaskActive(task) {
  return task.status === TaskStatus.TODO || task.status === TaskStatus.IN_PROGRESS
}

/**
 * Check if task is completed
 */
export function isTaskCompleted(task) {
  return task.status === TaskStatus.COMPLETED
}

/**
 * Get task progress percentage
 */
export function getTaskProgress(task) {
  if (task.progressMode === ProgressMode.MANUAL) {
    return task.manualProgress || 0
  }
  
  // Auto mode - calculate from subtasks or status
  if (task.subtasks && task.subtasks.length > 0) {
    // Will need subtask data to calculate - placeholder for now
    return 0
  }
  
  // Base on status
  switch (task.status) {
    case TaskStatus.COMPLETED:
      return 100
    case TaskStatus.IN_PROGRESS:
      return 50
    case TaskStatus.TODO:
    case TaskStatus.ON_HOLD:
    case TaskStatus.CANCELLED:
    default:
      return 0
  }
}

/**
 * Set task progress
 */
export function setTaskProgress(task, progress, mode = ProgressMode.MANUAL) {
  return updateTask(task, {
    progressMode: mode,
    manualProgress: mode === ProgressMode.MANUAL ? Math.max(0, Math.min(100, progress)) : 0
  })
}

/**
 * Get task color based on priority or custom color
 */
export function getTaskColor(task) {
  if (task.color) return task.color
  
  // Default colors based on priority
  const priorityColors = {
    [TaskPriority.LOW]: '#28a745',      // Green
    [TaskPriority.MEDIUM]: '#17a2b8',   // Blue
    [TaskPriority.HIGH]: '#fd7e14',     // Orange
    [TaskPriority.CRITICAL]: '#dc3545' // Red
  }
  
  return priorityColors[task.priority] || priorityColors[TaskPriority.MEDIUM]
}

/**
 * Get task urgency score (for sorting/prioritization)
 */
export function getTaskUrgencyScore(task) {
  let score = 0
  
  // Priority weight
  const priorityWeights = {
    [TaskPriority.LOW]: 1,
    [TaskPriority.MEDIUM]: 2,
    [TaskPriority.HIGH]: 3,
    [TaskPriority.CRITICAL]: 4
  }
  score += (priorityWeights[task.priority] || 2) * 10
  
  // Due date proximity (closer = higher score)
  if (task.endDate) {
    const now = new Date()
    const endDate = new Date(task.endDate)
    const daysUntilDue = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24))
    
    if (daysUntilDue < 0) score += 20 // Overdue
    else if (daysUntilDue <= 1) score += 15 // Due today/tomorrow
    else if (daysUntilDue <= 3) score += 10 // Due this week
    else if (daysUntilDue <= 7) score += 5  // Due next week
  }
  
  // Complexity (higher complexity = higher score)
  score += task.complexity || 5
  
  return score
}

/**
 * Compare tasks for sorting
 */
export function compareTasks(taskA, taskB, sortBy = 'urgency') {
  switch (sortBy) {
    case 'title':
      return taskA.title.localeCompare(taskB.title)
    case 'startDate':
      return new Date(taskA.startDate) - new Date(taskB.startDate)
    case 'endDate':
      return new Date(taskA.endDate) - new Date(taskB.endDate)
    case 'priority':
      const priorityOrder = { low: 1, medium: 2, high: 3, critical: 4 }
      return (priorityOrder[taskB.priority] || 2) - (priorityOrder[taskA.priority] || 2)
    case 'status':
      const statusOrder = { todo: 1, 'in-progress': 2, completed: 3, 'on-hold': 4, cancelled: 5 }
      return (statusOrder[taskA.status] || 1) - (statusOrder[taskB.status] || 1)
    case 'urgency':
    default:
      return getTaskUrgencyScore(taskB) - getTaskUrgencyScore(taskA)
  }
}
