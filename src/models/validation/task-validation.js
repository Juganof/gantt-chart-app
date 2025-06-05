/**
 * Task validation utilities
 * Provides comprehensive validation for task objects and operations
 */

import { DependencyType, TaskPriority, TaskStatus } from '../constants.js'

/**
 * Validate basic task data structure and required fields
 */
export function validateTask(task) {
  const errors = []

  if (!task.title || task.title.trim() === '') {
    errors.push('Task title is required')
  }

  if (!task.startDate) {
    errors.push('Start date is required')
  }

  if (!task.endDate) {
    errors.push('End date is required')
  }

  if (task.startDate && task.endDate && new Date(task.startDate) > new Date(task.endDate)) {
    errors.push('Start date must be before end date')
  }

  if (task.complexity && (task.complexity < 1 || task.complexity > 10)) {
    errors.push('Complexity must be between 1 and 10')
  }

  // Validate dependencies structure
  if (task.dependencies && Array.isArray(task.dependencies)) {
    task.dependencies.forEach((dep, index) => {
      if (typeof dep === 'object') {
        if (!dep.fromTaskId) {
          errors.push(`Dependency ${index + 1} is missing fromTaskId`)
        }
        if (dep.type && !Object.values(DependencyType).includes(dep.type)) {
          errors.push(`Dependency ${index + 1} has invalid type: ${dep.type}`)
        }
        if (dep.lag && typeof dep.lag !== 'number') {
          errors.push(`Dependency ${index + 1} lag must be a number`)
        }
      } else if (typeof dep === 'string') {
        // Legacy format - just task IDs
        if (!dep.trim()) {
          errors.push(`Dependency ${index + 1} cannot be empty`)
        }
      } else {
        errors.push(`Dependency ${index + 1} has invalid format`)
      }
    })
  }

  // Validate status
  if (task.status && !Object.values(TaskStatus).includes(task.status)) {
    errors.push('Invalid task status')
  }

  // Validate priority
  if (task.priority && !Object.values(TaskPriority).includes(task.priority)) {
    errors.push('Invalid task priority')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validate task workflow transitions
 */
export function validateTaskStatusTransition(currentStatus, newStatus, task = null) {
  const validTransitions = {
    [TaskStatus.TODO]: [TaskStatus.IN_PROGRESS, TaskStatus.ON_HOLD, TaskStatus.CANCELLED],
    [TaskStatus.IN_PROGRESS]: [
      TaskStatus.COMPLETED,
      TaskStatus.ON_HOLD,
      TaskStatus.TODO,
      TaskStatus.CANCELLED
    ],
    [TaskStatus.ON_HOLD]: [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.CANCELLED],
    [TaskStatus.COMPLETED]: [TaskStatus.IN_PROGRESS], // Allow reopening completed tasks
    [TaskStatus.CANCELLED]: [TaskStatus.TODO] // Allow reactivating cancelled tasks
  }

  const allowedNext = validTransitions[currentStatus] || []
  const isValid = allowedNext.includes(newStatus)

  const errors = []
  if (!isValid) {
    errors.push(`Cannot transition task from ${currentStatus} to ${newStatus}`)
  }

  // Additional business rules
  if (newStatus === TaskStatus.COMPLETED && task) {
    // Check if all required fields are filled for completion
    if (!task.title || !task.startDate || !task.endDate) {
      errors.push('Task must have title, start date, and end date to be marked as completed')
    }
  }

  return { isValid: errors.length === 0, errors }
}

/**
 * Validate task hierarchy depth
 */
export function validateTaskHierarchy(task, allTasks, maxDepth = 5) {
  const errors = []

  if (task.level > maxDepth) {
    errors.push(`Task hierarchy depth exceeds maximum of ${maxDepth} levels`)
  }

  // Validate parent-child consistency
  if (task.parentTask) {
    const parent = allTasks.find(t => t.id === task.parentTask)
    if (!parent) {
      errors.push('Parent task does not exist')
    } else if (parent.projectId !== task.projectId) {
      errors.push('Task and parent task must belong to the same project')
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validate task timeline consistency
 */
export function validateTaskTimeline(task, allTasks = []) {
  const errors = []

  // Basic date validation
  if (task.startDate && task.endDate) {
    const start = new Date(task.startDate)
    const end = new Date(task.endDate)
    
    if (start > end) {
      errors.push('Start date must be before end date')
    }
  }

  // Validate against dependencies
  if (task.dependencies && allTasks.length > 0) {
    task.dependencies.forEach(dep => {
      const dependencyTask = allTasks.find(t => t.id === dep.fromTaskId)
      if (dependencyTask) {
        const taskStart = new Date(task.startDate)
        const depEnd = new Date(dependencyTask.endDate)
        
        // For finish-to-start dependencies, task should start after dependency ends
        if (dep.type === DependencyType.FINISH_TO_START && taskStart < depEnd) {
          errors.push(`Task cannot start before dependency "${dependencyTask.title}" finishes`)
        }
      }
    })
  }

  // Validate against subtasks
  const subtasks = allTasks.filter(t => t.parentTask === task.id)
  if (subtasks.length > 0) {
    const subtaskDates = subtasks.map(st => ({
      start: new Date(st.startDate),
      end: new Date(st.endDate)
    })).filter(dates => !isNaN(dates.start) && !isNaN(dates.end))

    if (subtaskDates.length > 0) {
      const earliestSubtaskStart = new Date(Math.min(...subtaskDates.map(d => d.start)))
      const latestSubtaskEnd = new Date(Math.max(...subtaskDates.map(d => d.end)))
      const taskStart = new Date(task.startDate)
      const taskEnd = new Date(task.endDate)

      if (taskStart > earliestSubtaskStart) {
        errors.push('Parent task cannot start after its subtasks')
      }
      if (taskEnd < latestSubtaskEnd) {
        errors.push('Parent task cannot end before its subtasks')
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validate all hierarchy relationships for consistency
 */
export function validateAllTaskHierarchies(allTasks, maxDepth = 5) {
  const errors = []

  allTasks.forEach(task => {
    // Check parent-child consistency
    if (task.parentTask) {
      const parent = allTasks.find(t => t.id === task.parentTask)
      if (!parent) {
        errors.push(`Task "${task.title}" has non-existent parent ${task.parentTask}`)
      } else if (!parent.subtasks.includes(task.id)) {
        errors.push(`Parent task "${parent.title}" missing subtask reference to "${task.title}"`)
      }
    }

    // Check subtask references
    if (task.subtasks && task.subtasks.length > 0) {
      task.subtasks.forEach(subtaskId => {
        const subtask = allTasks.find(t => t.id === subtaskId)
        if (!subtask) {
          errors.push(`Task "${task.title}" references non-existent subtask ${subtaskId}`)
        } else if (subtask.parentTask !== task.id) {
          errors.push(`Subtask "${subtask.title}" parent reference doesn't match parent's subtask list`)
        }
      })
    }

    // Check for circular references
    if (hasCircularHierarchy(task.id, allTasks)) {
      errors.push(`Circular hierarchy detected for task "${task.title}"`)
    }

    // Check depth
    if ((task.level || 0) > maxDepth) {
      errors.push(`Task "${task.title}" exceeds maximum hierarchy depth of ${maxDepth}`)
    }
  })

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Check for circular hierarchy references
 */
export function hasCircularHierarchy(taskId, allTasks) {
  const visited = new Set()

  function checkCircular(currentTaskId) {
    if (visited.has(currentTaskId)) {
      return true
    }

    visited.add(currentTaskId)
    const task = allTasks.find(t => t.id === currentTaskId)

    if (task && task.parentTask) {
      return checkCircular(task.parentTask)
    }

    return false
  }

  return checkCircular(taskId)
}
