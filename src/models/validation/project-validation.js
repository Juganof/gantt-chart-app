/**
 * Project Validation Module
 * Handles all project-related validation logic
 */

import { ProjectPriority, ProjectStatus, SubmissionType } from '../constants.js'

/**
 * Validate project data
 */
export function validateProject(project) {
  const errors = []

  if (!project.name || project.name.trim() === '') {
    errors.push('Project name is required')
  }

  if (
    project.startDate &&
    project.endDate &&
    new Date(project.startDate) > new Date(project.endDate)
  ) {
    errors.push('Project start date must be before end date')
  }

  if (
    project.dueDate &&
    project.startDate &&
    new Date(project.startDate) > new Date(project.dueDate)
  ) {
    errors.push('Project start date must be before due date')
  }

  if (project.gradeWeight && (project.gradeWeight < 0 || project.gradeWeight > 100)) {
    errors.push('Grade weight must be between 0 and 100')
  }

  if (
    project.completionPercentage &&
    (project.completionPercentage < 0 || project.completionPercentage > 100)
  ) {
    errors.push('Completion percentage must be between 0 and 100')
  }

  // Validate status
  if (project.status && !Object.values(ProjectStatus).includes(project.status)) {
    errors.push('Invalid project status')
  }

  // Validate priority
  if (project.priority && !Object.values(ProjectPriority).includes(project.priority)) {
    errors.push('Invalid project priority')
  }

  // Validate submission type
  if (project.submissionType && !Object.values(SubmissionType).includes(project.submissionType)) {
    errors.push('Invalid submission type')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
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

/**
 * Validate project list data
 */
export function validateProjectsList(projectsList) {
  const errors = []

  if (!Array.isArray(projectsList)) {
    errors.push('Projects list must be an array')
    return { isValid: false, errors }
  }

  const projectIds = new Set()

  projectsList.forEach((project, index) => {
    if (!project.id) {
      errors.push(`Project at index ${index} is missing ID`)
    } else if (projectIds.has(project.id)) {
      errors.push(`Duplicate project ID found: ${project.id}`)
    } else {
      projectIds.add(project.id)
    }

    if (!project.name || project.name.trim() === '') {
      errors.push(`Project at index ${index} is missing name`)
    }
  })

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Bulk validation for project data including tasks
 */
export function validateProjectData(project, tasks) {
  const errors = []

  // Validate project itself
  const projectValidation = validateProject(project)
  if (!projectValidation.isValid) {
    errors.push(...projectValidation.errors.map(e => `Project: ${e}`))
  }

  // Validate that all tasks belong to this project
  const orphanedTasks = tasks.filter(task => task.projectId !== project.id)
  if (orphanedTasks.length > 0) {
    errors.push(`Found ${orphanedTasks.length} tasks that don't belong to this project`)
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}
