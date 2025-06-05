// Project model factory and related functions
// Extracted from models/index.js for better organization

import { generateId } from './utils/id-generator.js'
import { ProjectStatus, ProjectPriority, SubmissionType, ExportFormat, ViewMode, Defaults } from './constants.js'
import { formatDate, isOverdue, getRelativeTime } from './utils/date-utils.js'

/**
 * Create a new project object with default values
 */
export function createProject(projectData = {}) {
  return {
    id: generateId(),
    name: 'My School Project',
    description: '',
    subject: '', // Course/subject name (e.g., "Computer Science", "History")
    semester: '', // Academic period (e.g., "Fall 2024", "Spring 2025")
    priority: Defaults.PROJECT_PRIORITY,
    status: Defaults.PROJECT_STATUS,
    color: null, // Color theme for visual organization
    tags: [], // Categorization tags (e.g., ["final-project", "group-work"])
    startDate: new Date().toISOString(),
    endDate: null,
    estimatedDuration: null, // Estimated project duration in hours/days
    actualDuration: null, // Actual time spent on completion
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    // Progress tracking
    milestones: [], // Key project milestones with dates
    completionPercentage: 0,
    // Student-specific metadata
    gradeWeight: null, // How much this project counts toward grade (percentage)
    instructor: '', // Teacher/professor name
    dueDate: null, // Final due date for the project
    submissionType: Defaults.SUBMISSION_TYPE,
    // Application settings
    settings: {
      defaultView: Defaults.VIEW_MODE,
      showWeekends: Defaults.SHOW_WEEKENDS,
      workingHours: {
        start: '09:00',
        end: '17:00'
      },
      autoSave: Defaults.AUTO_SAVE,
      showDependencyArrows: Defaults.SHOW_DEPENDENCY_ARROWS,
      enableDragDrop: Defaults.ENABLE_DRAG_DROP,
      dueDateReminders: Defaults.DUE_DATE_REMINDERS,
      overdueHighlight: Defaults.OVERDUE_HIGHLIGHT,
      // Export/sharing preferences
      exportFormat: Defaults.EXPORT_FORMAT,
      includeCompletedTasks: Defaults.INCLUDE_COMPLETED_TASKS,
      timeFormat: '24h' // 12h or 24h
    },
    ...projectData
  }
}

/**
 * Create a milestone object
 */
export function createMilestone(milestoneData = {}) {
  return {
    id: generateId(),
    title: '',
    description: '',
    date: new Date().toISOString(),
    completed: false,
    ...milestoneData
  }
}

/**
 * Clone a project with a new ID
 */
export function cloneProject(originalProject, overrides = {}) {
  const cloned = createProject({
    ...originalProject,
    id: generateId(),
    name: `${originalProject.name} (Copy)`,
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    completionPercentage: 0,
    milestones: originalProject.milestones.map(milestone => ({
      ...milestone,
      id: generateId(),
      completed: false
    })),
    ...overrides
  })
  
  return cloned
}

/**
 * Update project with new data and timestamp
 */
export function updateProject(project, updates) {
  return {
    ...project,
    ...updates,
    updated: new Date().toISOString()
  }
}

/**
 * Calculate project duration in days
 */
export function getProjectDuration(project) {
  if (!project.startDate || !project.endDate) return 0
  
  const start = new Date(project.startDate)
  const end = new Date(project.endDate)
  const diffTime = Math.abs(end - start)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays
}

/**
 * Check if project is overdue
 */
export function isProjectOverdue(project) {
  if (!project.dueDate || project.status === ProjectStatus.COMPLETED) return false
  return isOverdue(project.dueDate)
}

/**
 * Check if project is active
 */
export function isProjectActive(project) {
  return project.status === ProjectStatus.ACTIVE
}

/**
 * Check if project is completed
 */
export function isProjectCompleted(project) {
  return project.status === ProjectStatus.COMPLETED
}

/**
 * Get project color based on priority or custom color
 */
export function getProjectColor(project) {
  if (project.color) return project.color
  
  // Default colors based on priority
  const priorityColors = {
    [ProjectPriority.LOW]: '#28a745',      // Green
    [ProjectPriority.MEDIUM]: '#17a2b8',   // Blue
    [ProjectPriority.HIGH]: '#fd7e14',     // Orange
    [ProjectPriority.CRITICAL]: '#dc3545' // Red
  }
  
  return priorityColors[project.priority] || priorityColors[ProjectPriority.MEDIUM]
}

/**
 * Get project status badge info
 */
export function getProjectStatusInfo(project) {
  const statusInfo = {
    [ProjectStatus.ACTIVE]: { label: 'Active', color: '#28a745', icon: '▶️' },
    [ProjectStatus.COMPLETED]: { label: 'Completed', color: '#6c757d', icon: '✅' },
    [ProjectStatus.ON_HOLD]: { label: 'On Hold', color: '#ffc107', icon: '⏸️' },
    [ProjectStatus.CANCELLED]: { label: 'Cancelled', color: '#dc3545', icon: '❌' }
  }
  
  return statusInfo[project.status] || statusInfo[ProjectStatus.ACTIVE]
}

/**
 * Calculate project progress from tasks
 */
export function calculateProjectProgress(project, tasks = []) {
  if (!tasks.length) return project.completionPercentage || 0
  
  const projectTasks = tasks.filter(task => task.projectId === project.id)
  if (!projectTasks.length) return 0
  
  const totalTasks = projectTasks.length
  const completedTasks = projectTasks.filter(task => task.status === 'completed').length
  
  return Math.round((completedTasks / totalTasks) * 100)
}

/**
 * Get project statistics
 */
export function getProjectStats(project, tasks = []) {
  const projectTasks = tasks.filter(task => task.projectId === project.id)
  
  const stats = {
    totalTasks: projectTasks.length,
    completedTasks: projectTasks.filter(task => task.status === 'completed').length,
    inProgressTasks: projectTasks.filter(task => task.status === 'in-progress').length,
    overdueTasks: projectTasks.filter(task => isOverdue(task.endDate) && task.status !== 'completed').length,
    totalMilestones: project.milestones.length,
    completedMilestones: project.milestones.filter(m => m.completed).length,
    progress: calculateProjectProgress(project, tasks),
    daysRemaining: project.dueDate ? Math.max(0, Math.ceil((new Date(project.dueDate) - new Date()) / (1000 * 60 * 60 * 24))) : null,
    isOverdue: isProjectOverdue(project)
  }
  
  return stats
}

/**
 * Get upcoming milestones
 */
export function getUpcomingMilestones(project, days = 30) {
  const now = new Date()
  const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000))
  
  return project.milestones
    .filter(milestone => !milestone.completed)
    .filter(milestone => {
      const milestoneDate = new Date(milestone.date)
      return milestoneDate >= now && milestoneDate <= futureDate
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date))
}

/**
 * Add milestone to project
 */
export function addMilestone(project, milestoneData) {
  const milestone = createMilestone(milestoneData)
  const updatedMilestones = [...project.milestones, milestone]
  
  return updateProject(project, { milestones: updatedMilestones })
}

/**
 * Update milestone in project
 */
export function updateMilestone(project, milestoneId, updates) {
  const updatedMilestones = project.milestones.map(milestone =>
    milestone.id === milestoneId ? { ...milestone, ...updates } : milestone
  )
  
  return updateProject(project, { milestones: updatedMilestones })
}

/**
 * Remove milestone from project
 */
export function removeMilestone(project, milestoneId) {
  const updatedMilestones = project.milestones.filter(milestone => milestone.id !== milestoneId)
  
  return updateProject(project, { milestones: updatedMilestones })
}

/**
 * Get project urgency score (for sorting/prioritization)
 */
export function getProjectUrgencyScore(project) {
  let score = 0
  
  // Priority weight
  const priorityWeights = {
    [ProjectPriority.LOW]: 1,
    [ProjectPriority.MEDIUM]: 2,
    [ProjectPriority.HIGH]: 3,
    [ProjectPriority.CRITICAL]: 4
  }
  score += (priorityWeights[project.priority] || 2) * 10
  
  // Due date proximity (closer = higher score)
  if (project.dueDate) {
    const now = new Date()
    const dueDate = new Date(project.dueDate)
    const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24))
    
    if (daysUntilDue < 0) score += 20 // Overdue
    else if (daysUntilDue <= 1) score += 15 // Due today/tomorrow
    else if (daysUntilDue <= 3) score += 10 // Due this week
    else if (daysUntilDue <= 7) score += 5  // Due next week
  }
  
  // Completion percentage (lower completion = higher urgency)
  score += (100 - (project.completionPercentage || 0)) / 10
  
  return score
}

/**
 * Compare projects for sorting
 */
export function compareProjects(projectA, projectB, sortBy = 'urgency') {
  switch (sortBy) {
    case 'name':
      return projectA.name.localeCompare(projectB.name)
    case 'created':
      return new Date(projectB.created) - new Date(projectA.created)
    case 'updated':
      return new Date(projectB.updated) - new Date(projectA.updated)
    case 'dueDate':
      if (!projectA.dueDate && !projectB.dueDate) return 0
      if (!projectA.dueDate) return 1
      if (!projectB.dueDate) return -1
      return new Date(projectA.dueDate) - new Date(projectB.dueDate)
    case 'priority':
      const priorityOrder = { low: 1, medium: 2, high: 3, critical: 4 }
      return (priorityOrder[projectB.priority] || 2) - (priorityOrder[projectA.priority] || 2)
    case 'progress':
      return (projectB.completionPercentage || 0) - (projectA.completionPercentage || 0)
    case 'urgency':
    default:
      return getProjectUrgencyScore(projectB) - getProjectUrgencyScore(projectA)
  }
}
