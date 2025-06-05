/**
 * Task Hierarchy Management Module
 * Handles all task hierarchy operations, relationships, and structure management
 */

import { createTask } from '../task.js'

/**
 * Get subtasks of a parent task
 */
export function getSubtasks(parentTaskId, allTasks) {
  return allTasks.filter(task => task.parentTask === parentTaskId)
}

/**
 * Get the root tasks (tasks without parent) for a project
 */
export function getRootTasks(projectId, allTasks) {
  return allTasks.filter(task => task.projectId === projectId && !task.parentTask)
}

/**
 * Calculate and update hierarchy metadata for a task
 */
export function calculateTaskHierarchy(task, allTasks) {
  const updates = {}

  if (task.parentTask) {
    const parent = allTasks.find(t => t.id === task.parentTask)
    if (parent) {
      updates.level = (parent.level || 0) + 1
      updates.hierarchyPath = [...(parent.hierarchyPath || []), parent.id]
    } else {
      updates.level = 0
      updates.hierarchyPath = []
    }
  } else {
    updates.level = 0
    updates.hierarchyPath = []
  }

  return updates
}

/**
 * Get all descendants (subtasks and their subtasks) of a task
 */
export function getTaskDescendants(taskId, allTasks) {
  const descendants = []
  const directSubtasks = getSubtasks(taskId, allTasks)

  directSubtasks.forEach(subtask => {
    descendants.push(subtask)
    descendants.push(...getTaskDescendants(subtask.id, allTasks))
  })

  return descendants
}

/**
 * Get all ancestors (parent, grandparent, etc.) of a task
 */
export function getTaskAncestors(taskId, allTasks) {
  const ancestors = []
  const task = allTasks.find(t => t.id === taskId)

  if (task && task.parentTask) {
    const parent = allTasks.find(t => t.id === task.parentTask)
    if (parent) {
      ancestors.push(parent)
      ancestors.push(...getTaskAncestors(parent.id, allTasks))
    }
  }

  return ancestors
}

/**
 * Get task hierarchy tree structure for a project
 */
export function getTaskHierarchyTree(projectId, allTasks) {
  const rootTasks = getRootTasks(projectId, allTasks)

  function buildTree(parentTasks) {
    return parentTasks.map(task => ({
      ...task,
      children: buildTree(getSubtasks(task.id, allTasks))
    }))
  }

  return buildTree(rootTasks)
}

/**
 * Get flattened task list with proper hierarchy ordering
 */
export function getFlattenedHierarchyTasks(projectId, allTasks, expandedTasks = new Set()) {
  const flattened = []
  const rootTasks = getRootTasks(projectId, allTasks).sort(
    (a, b) => (a.order || 0) - (b.order || 0)
  )

  function addTaskAndChildren(task, level = 0) {
    flattened.push({ ...task, displayLevel: level })

    if (task.isExpanded !== false && expandedTasks.has(task.id)) {
      const subtasks = getSubtasks(task.id, allTasks).sort(
        (a, b) => (a.order || 0) - (b.order || 0)
      )

      subtasks.forEach(subtask => {
        addTaskAndChildren(subtask, level + 1)
      })
    }
  }

  rootTasks.forEach(task => addTaskAndChildren(task))
  return flattened
}

/**
 * Add a subtask to a parent task with proper hierarchy setup
 */
export function addSubtaskToParent(parentTask, subtaskData, allTasks) {
  const subtask = createTask({
    ...subtaskData,
    parentTask: parentTask.id,
    projectId: parentTask.projectId,
    order: getSubtasks(parentTask.id, allTasks).length, // Add at the end
    ...calculateTaskHierarchy({ parentTask: parentTask.id }, allTasks)
  })

  // Update parent's subtasks array
  if (!parentTask.subtasks.includes(subtask.id)) {
    parentTask.subtasks.push(subtask.id)
  }

  return subtask
}

/**
 * Remove a subtask and update parent references
 */
export function removeSubtaskFromParent(subtaskId, allTasks) {
  const subtask = allTasks.find(t => t.id === subtaskId)
  if (!subtask || !subtask.parentTask) {
    return { success: false, error: 'Subtask not found or has no parent' }
  }

  const parent = allTasks.find(t => t.id === subtask.parentTask)
  if (parent) {
    parent.subtasks = parent.subtasks.filter(id => id !== subtaskId)
  }

  // Update order of remaining subtasks
  const remainingSubtasks = getSubtasks(subtask.parentTask, allTasks).filter(
    t => t.id !== subtaskId
  )

  remainingSubtasks.forEach((task, index) => {
    task.order = index
  })

  return { success: true }
}

/**
 * Move a task to a new parent (or make it a root task)
 */
export function moveTaskToParent(taskId, newParentId, allTasks, newOrder = null) {
  const task = allTasks.find(t => t.id === taskId)
  if (!task) {
    return { success: false, error: 'Task not found' }
  }

  // Remove from old parent
  if (task.parentTask) {
    removeSubtaskFromParent(taskId, allTasks)
  }

  // Add to new parent
  if (newParentId) {
    const newParent = allTasks.find(t => t.id === newParentId)
    if (!newParent) {
      return { success: false, error: 'New parent not found' }
    }

    // Check for circular reference
    if (getTaskDescendants(taskId, allTasks).some(d => d.id === newParentId)) {
      return { success: false, error: 'Cannot move task to its own descendant' }
    }

    task.parentTask = newParentId
    task.projectId = newParent.projectId
    Object.assign(task, calculateTaskHierarchy(task, allTasks))

    if (!newParent.subtasks.includes(taskId)) {
      newParent.subtasks.push(taskId)
    }

    // Set order
    if (newOrder !== null) {
      task.order = newOrder
      // Reorder other subtasks
      const siblings = getSubtasks(newParentId, allTasks).filter(t => t.id !== taskId)
      siblings.forEach((sibling, index) => {
        sibling.order = index >= newOrder ? index + 1 : index
      })
    } else {
      task.order = getSubtasks(newParentId, allTasks).length - 1
    }
  } else {
    // Make it a root task
    task.parentTask = null
    task.level = 0
    task.hierarchyPath = []
    if (newOrder !== null) {
      task.order = newOrder
    }
  }

  // Update hierarchy for all descendants
  const descendants = getTaskDescendants(taskId, allTasks)
  descendants.forEach(descendant => {
    Object.assign(descendant, calculateTaskHierarchy(descendant, allTasks))
  })

  return { success: true }
}

/**
 * Reorder tasks within the same parent
 */
export function reorderTasks(taskIds, parentId, allTasks) {
  const tasks = taskIds.map(id => allTasks.find(t => t.id === id)).filter(Boolean)

  // Validate all tasks have the same parent
  if (!tasks.every(task => task.parentTask === parentId)) {
    return { success: false, error: 'All tasks must have the same parent' }
  }

  // Update order
  tasks.forEach((task, index) => {
    task.order = index
  })

  return { success: true }
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

/**
 * Update hierarchy metadata for all tasks in a project
 */
export function updateAllTaskHierarchies(projectId, allTasks) {
  const projectTasks = getTasksByProject(projectId, allTasks)

  projectTasks.forEach(task => {
    Object.assign(task, calculateTaskHierarchy(task, allTasks))
  })

  return projectTasks
}

/**
 * Validate hierarchy consistency for all tasks
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
          errors.push(`Subtask "${subtask.title}" parent mismatch`)
        }
      })
    }

    // Check hierarchy metadata consistency
    const expectedHierarchy = calculateTaskHierarchy(task, allTasks)
    if (task.level !== expectedHierarchy.level) {
      errors.push(
        `Task "${task.title}" has incorrect level: ${task.level}, expected: ${expectedHierarchy.level}`
      )
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

// Helper function
function getTasksByProject(projectId, allTasks) {
  return allTasks.filter(task => task.projectId === projectId)
}

/**
 * Validate task hierarchy depth
 */
export function validateTaskHierarchy(task, allTasks, maxDepth = 5) {
  const errors = []

  function getDepth(taskId, visited = new Set()) {
    if (visited.has(taskId)) {
      errors.push('Circular reference detected in task hierarchy')
      return 0
    }

    visited.add(taskId)
    const currentTask = allTasks.find(t => t.id === taskId)

    if (!currentTask || !currentTask.parentTask) {
      return 0
    }

    return 1 + getDepth(currentTask.parentTask, new Set(visited))
  }

  const depth = getDepth(task.id)

  if (depth > maxDepth) {
    errors.push(`Task hierarchy depth (${depth}) exceeds maximum allowed depth (${maxDepth})`)
  }

  return {
    isValid: errors.length === 0,
    errors,
    depth
  }
}
