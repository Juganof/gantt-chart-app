/**
 * Field Validation Module
 * Handles real-time form field validation and user action validation
 */

import { TaskPriority, TaskStatus } from '../constants.js'

/**
 * Real-time field validation
 */
export function validateField(fieldName, value, context = {}) {
  const errors = []

  switch (fieldName) {
    case 'title':
      if (!value || value.trim().length === 0) {
        errors.push('Title is required')
      } else if (value.trim().length > 255) {
        errors.push('Title must be 255 characters or less')
      }
      break

    case 'description':
      if (value && value.length > 2000) {
        errors.push('Description must be 2000 characters or less')
      }
      break

    case 'startDate':
      if (value) {
        const date = new Date(value)
        if (isNaN(date.getTime())) {
          errors.push('Invalid start date')
        } else if (context.endDate && date >= new Date(context.endDate)) {
          errors.push('Start date must be before end date')
        }
      }
      break

    case 'endDate':
      if (value) {
        const date = new Date(value)
        if (isNaN(date.getTime())) {
          errors.push('Invalid end date')
        } else if (context.startDate && date <= new Date(context.startDate)) {
          errors.push('End date must be after start date')
        }
      }
      break

    case 'priority':
      if (value && !Object.values(TaskPriority).includes(value)) {
        errors.push('Invalid priority value')
      }
      break

    case 'status':
      if (value && !Object.values(TaskStatus).includes(value)) {
        errors.push('Invalid status value')
      }
      break

    case 'complexity':
      if (value !== null && value !== undefined) {
        const num = Number(value)
        if (isNaN(num) || num < 1 || num > 10) {
          errors.push('Complexity must be between 1 and 10')
        }
      }
      break

    case 'gradeWeight':
      if (value !== null && value !== undefined) {
        const num = Number(value)
        if (isNaN(num) || num < 0 || num > 100) {
          errors.push('Grade weight must be between 0 and 100')
        }
      }
      break
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validate user actions
 */
export function validateUserAction(action, target, context = {}) {
  const errors = []

  switch (action) {
    case 'delete-task':
      if (target.subtasks && target.subtasks.length > 0) {
        errors.push(
          'Cannot delete task with subtasks. Delete subtasks first or convert them to standalone tasks.'
        )
      }

      // Check if other tasks depend on this one
      if (context.allTasks && context.getTaskDependents) {
        const dependents = context.getTaskDependents(target.id, context.allTasks)
        if (dependents.length > 0) {
          const dependentTitles = dependents.map(t => `"${t.title}"`).join(', ')
          errors.push(`Cannot delete task. The following tasks depend on it: ${dependentTitles}`)
        }
      }
      break

    case 'delete-project':
      if (context.allTasks && context.allTasks.length > 0) {
        errors.push('Cannot delete project with tasks. Delete all tasks first.')
      }
      break

    case 'change-task-status':
      if (context.currentStatus && context.newStatus && context.validateTaskStatusTransition) {
        const transition = context.validateTaskStatusTransition(
          context.currentStatus,
          context.newStatus,
          target
        )
        if (!transition.isValid) {
          errors.push(...transition.errors)
        }
      }
      break

    case 'add-dependency':
      if (context.dependencyTaskId) {
        if (target.id === context.dependencyTaskId) {
          errors.push('Task cannot depend on itself')
        }

        if (
          context.allTasks &&
          context.hasCircularDependency &&
          context.hasCircularDependency(target.id, context.dependencyTaskId, context.allTasks)
        ) {
          errors.push('Adding this dependency would create a circular reference')
        }
      }
      break
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}
