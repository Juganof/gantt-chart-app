/**
 * Business Logic Calculations Module
 * Handles progress calculations, statistics, and project metrics
 */

import { ProjectStatus, TaskStatus } from '../constants.js'

/**
 * Get subtasks of a parent task
 */
function getSubtasks(parentTaskId, allTasks) {
  return allTasks.filter(task => task.parentTask === parentTaskId)
}

/**
 * Calculate task progress based on subtask completion
 */
export function calculateTaskProgress(task, allTasks) {
  if (task.progressMode === 'manual') {
    return task.manualProgress || 0
  }

  const subtasks = getSubtasks(task.id, allTasks)
  if (subtasks.length === 0) {
    // Leaf task - progress based on status
    switch (task.status) {
      case TaskStatus.COMPLETED:
        return 100
      case TaskStatus.IN_PROGRESS:
        return task.manualProgress || 50 // Default to 50% for in-progress
      default:
        return 0
    }
  }

  // Calculate weighted average of subtask progress
  const totalWeight = subtasks.reduce((sum, st) => sum + (st.progressWeight || 1), 0)
  const weightedProgress = subtasks.reduce((sum, subtask) => {
    const subtaskProgress = calculateTaskProgress(subtask, allTasks)
    const weight = subtask.progressWeight || 1
    return sum + subtaskProgress * weight
  }, 0)

  return totalWeight > 0 ? Math.round(weightedProgress / totalWeight) : 0
}

/**
 * Calculate project statistics
 */
export function calculateProjectStats(project, tasks = []) {
  const projectTasks = tasks.filter(task => task.projectId === project.id)

  const totalTasks = projectTasks.length
  const completedTasks = projectTasks.filter(task => task.status === TaskStatus.COMPLETED).length
  const inProgressTasks = projectTasks.filter(task => task.status === TaskStatus.IN_PROGRESS).length
  const todoTasks = projectTasks.filter(task => task.status === TaskStatus.TODO).length

  // Calculate overdue tasks
  const now = new Date()
  const overdueTasks = projectTasks.filter(task => {
    if (task.status === TaskStatus.COMPLETED) return false
    return task.endDate && new Date(task.endDate) < now
  }).length

  return {
    totalTasks,
    completedTasks,
    inProgressTasks,
    todoTasks,
    overdueTasks,
    completionPercentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    isOverdue:
      project.dueDate &&
      new Date(project.dueDate) < now &&
      project.status !== ProjectStatus.COMPLETED
  }
}

/**
 * Sort projects by various criteria
 */
export function sortProjects(projects, criteria = 'updated', direction = 'desc') {
  const sorted = [...projects]

  sorted.sort((a, b) => {
    let aValue, bValue

    switch (criteria) {
      case 'name':
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
        break
      case 'created':
        aValue = new Date(a.created)
        bValue = new Date(b.created)
        break
      case 'updated':
        aValue = new Date(a.updated || a.created)
        bValue = new Date(b.updated || b.created)
        break
      case 'lastAccessed':
        aValue = new Date(a.lastAccessed || a.updated || a.created)
        bValue = new Date(b.lastAccessed || b.updated || b.created)
        break
      case 'dueDate':
        aValue = a.dueDate ? new Date(a.dueDate) : new Date('9999-12-31')
        bValue = b.dueDate ? new Date(b.dueDate) : new Date('9999-12-31')
        break
      case 'priority':
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
        aValue = priorityOrder[a.priority] ?? 4
        bValue = priorityOrder[b.priority] ?? 4
        break
      case 'completion':
        aValue = a.completionPercentage || 0
        bValue = b.completionPercentage || 0
        break
      default:
        aValue = a.updated || a.created
        bValue = b.updated || b.created
    }

    if (direction === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  return sorted
}

/**
 * Filter projects by various criteria
 */
export function filterProjects(projects, filters = {}) {
  return projects.filter(project => {
    // Filter by status
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(project.status)) {
        return false
      }
    }

    // Filter by priority
    if (filters.priority && filters.priority.length > 0) {
      if (!filters.priority.includes(project.priority)) {
        return false
      }
    }

    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some(tag => project.tags && project.tags.includes(tag))
      if (!hasMatchingTag) {
        return false
      }
    }

    // Filter by search term
    if (filters.search && filters.search.trim() !== '') {
      const searchTerm = filters.search.toLowerCase()
      const searchableText = [
        project.name,
        project.description,
        project.subject,
        project.instructor,
        ...(project.tags || [])
      ]
        .join(' ')
        .toLowerCase()

      if (!searchableText.includes(searchTerm)) {
        return false
      }
    }

    // Filter by date range
    if (filters.dateRange) {
      const projectDate = new Date(project.created)
      if (filters.dateRange.start && projectDate < new Date(filters.dateRange.start)) {
        return false
      }
      if (filters.dateRange.end && projectDate > new Date(filters.dateRange.end)) {
        return false
      }
    }    return true
  })
}
