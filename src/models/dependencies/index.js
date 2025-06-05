/**
 * Task Dependency Management Module
 * Handles task dependencies, relationships, and validation
 */

import { DependencyType } from '../constants.js'
import { generateId } from '../utils/id-generator.js'

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
 * Add a dependency between two tasks
 */
export function addTaskDependency(
  task,
  dependencyTaskId,
  type = DependencyType.FINISH_TO_START,
  lag = 0
) {
  if (!task.dependencies) {
    task.dependencies = []
  }

  // Check if dependency already exists
  const existingDep = task.dependencies.find(dep => dep.fromTaskId === dependencyTaskId)
  if (existingDep) {
    // Update existing dependency
    existingDep.type = type
    existingDep.lag = lag
  } else {
    // Add new dependency
    task.dependencies.push(
      createTaskDependency({
        fromTaskId: dependencyTaskId,
        toTaskId: task.id,
        type,
        lag
      })
    )
  }

  task.updated = new Date().toISOString()
  return task
}

/**
 * Remove a dependency from a task
 */
export function removeTaskDependency(task, dependencyTaskId) {
  if (!task.dependencies) {
    return task
  }

  task.dependencies = task.dependencies.filter(dep => dep.fromTaskId !== dependencyTaskId)
  task.updated = new Date().toISOString()
  return task
}

/**
 * Get all tasks that depend on a given task
 */
export function getTaskDependents(taskId, allTasks) {
  return allTasks.filter(
    task => task.dependencies && task.dependencies.some(dep => dep.fromTaskId === taskId)
  )
}

/**
 * Get all tasks that a given task depends on
 */
export function getTaskDependencies(task) {
  if (!task.dependencies) {
    return []
  }
  return task.dependencies.map(dep => dep.fromTaskId)
}

/**
 * Check for circular dependencies
 */
export function hasCircularDependency(taskId, dependencyTaskId, allTasks) {
  const visited = new Set()

  function checkCircular(currentTaskId) {
    if (visited.has(currentTaskId)) {
      return currentTaskId === taskId
    }

    visited.add(currentTaskId)

    const currentTask = allTasks.find(task => task.id === currentTaskId)
    if (!currentTask || !currentTask.dependencies) {
      return false
    }

    for (const dep of currentTask.dependencies) {
      if (checkCircular(dep.fromTaskId)) {
        return true
      }
    }

    return false
  }

  return checkCircular(dependencyTaskId)
}

/**
 * Validate task timeline consistency based on dependencies
 */
export function validateTaskTimeline(task, allTasks = []) {
  const errors = []

  if (!task.startDate || !task.endDate) {
    return { isValid: true, errors } // Skip if dates not set
  }

  const startDate = new Date(task.startDate)
  const endDate = new Date(task.endDate)

  // Basic date validation
  if (startDate >= endDate) {
    errors.push('Start date must be before end date')
  }

  // Validate against dependencies
  if (task.dependencies && task.dependencies.length > 0) {
    task.dependencies.forEach(dep => {
      const dependencyTask = allTasks.find(t => t.id === dep.fromTaskId)
      if (dependencyTask && dependencyTask.endDate) {
        const depEndDate = new Date(dependencyTask.endDate)

        switch (dep.type) {
          case DependencyType.FINISH_TO_START:
            const minStartDate = new Date(depEndDate)
            minStartDate.setDate(minStartDate.getDate() + (dep.lag || 0))
            if (startDate < minStartDate) {
              errors.push(`Task cannot start before dependency "${dependencyTask.title}" finishes`)
            }
            break

          case DependencyType.START_TO_START:
            const depStartDate = new Date(dependencyTask.startDate)
            const minStartDateSS = new Date(depStartDate)
            minStartDateSS.setDate(minStartDateSS.getDate() + (dep.lag || 0))
            if (startDate < minStartDateSS) {
              errors.push(`Task cannot start before dependency "${dependencyTask.title}" starts`)
            }
            break
        }
      }
    })
  }

  // Validate against parent task dates
  if (task.parentTask) {
    const parentTask = allTasks.find(t => t.id === task.parentTask)
    if (parentTask && parentTask.startDate && parentTask.endDate) {
      const parentStart = new Date(parentTask.startDate)
      const parentEnd = new Date(parentTask.endDate)

      if (startDate < parentStart || endDate > parentEnd) {
        errors.push('Task dates must be within parent task date range')
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validate all relationships in a project
 */
export function validateProjectRelationships(project, tasks) {
  const errors = []
  const projectTasks = getTasksByProject(project.id, tasks)

  // Check for orphaned task references
  projectTasks.forEach(task => {
    // Check dependencies
    if (task.dependencies) {
      task.dependencies.forEach(dep => {
        const dependencyTask = tasks.find(t => t.id === dep.fromTaskId)
        if (!dependencyTask) {
          errors.push(`Task "${task.title}" has dependency on non-existent task ${dep.fromTaskId}`)
        }
      })
    }

    // Check parent task references
    if (task.parentTask) {
      const parentTask = tasks.find(t => t.id === task.parentTask)
      if (!parentTask) {
        errors.push(`Task "${task.title}" has non-existent parent task ${task.parentTask}`)
      } else if (parentTask.projectId !== task.projectId) {
        errors.push(`Task "${task.title}" and its parent are in different projects`)
      }
    }

    // Check subtask consistency
    if (task.subtasks && task.subtasks.length > 0) {
      task.subtasks.forEach(subtaskId => {
        const subtask = tasks.find(t => t.id === subtaskId)
        if (!subtask) {
          errors.push(`Task "${task.title}" references non-existent subtask ${subtaskId}`)
        } else if (subtask.parentTask !== task.id) {
          errors.push(
            `Subtask "${subtask.title}" parent reference doesn't match parent's subtask list`
          )
        }
      })
    }
  })

  // Check for circular dependencies
  projectTasks.forEach(task => {
    if (task.dependencies) {
      task.dependencies.forEach(dep => {
        if (hasCircularDependency(task.id, dep.fromTaskId, tasks)) {
          errors.push(`Circular dependency detected involving task "${task.title}"`)
        }
      })
    }
  })

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Helper function
function getTasksByProject(projectId, allTasks) {
  return allTasks.filter(task => task.projectId === projectId)
}
