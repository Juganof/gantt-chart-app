/**
 * Workflow Validation Module
 * Handles task and project status transition validation
 */

import { ProjectStatus, TaskStatus } from '../constants.js'

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
    errors.push(`Cannot transition from ${currentStatus} to ${newStatus}`)
  }

  // Additional business rules
  if (newStatus === TaskStatus.COMPLETED && task) {
    // Check if all subtasks are completed
    if (task.subtasks && task.subtasks.length > 0) {
      // This would require access to all tasks to check subtask status
      // Will be validated at the store level
    }
  }

  return { isValid, errors }
}

/**
 * Validate project workflow transitions
 */
export function validateProjectStatusTransition(currentStatus, newStatus) {
  const validTransitions = {
    [ProjectStatus.ACTIVE]: [
      ProjectStatus.ON_HOLD,
      ProjectStatus.COMPLETED,
      ProjectStatus.CANCELLED
    ],
    [ProjectStatus.ON_HOLD]: [ProjectStatus.ACTIVE, ProjectStatus.CANCELLED],
    [ProjectStatus.COMPLETED]: [ProjectStatus.ACTIVE], // Allow reopening
    [ProjectStatus.CANCELLED]: [ProjectStatus.ACTIVE] // Allow reactivation
  }

  const allowedNext = validTransitions[currentStatus] || []
  const isValid = allowedNext.includes(newStatus)

  return {
    isValid,
    errors: isValid ? [] : [`Cannot transition project from ${currentStatus} to ${newStatus}`]
  }
}
