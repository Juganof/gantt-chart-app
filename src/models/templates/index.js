/**
 * Project Templates and Multi-Project Support Module
 * Handles project templates, project list management, and storage utilities
 */

import { calculateProjectStats } from '../calculations/index.js'
import { ProjectPriority, ProjectTemplate, SubmissionType } from '../constants.js'
import { createProject } from '../project.js'

/**
 * Create a new project list entry for project management
 */
export function createProjectListItem(project) {
  const tasks = [] // Will be populated when loading tasks
  const stats = calculateProjectStats(project, tasks)

  return {
    id: project.id,
    name: project.name,
    description: project.description,
    status: project.status,
    priority: project.priority,
    color: project.color,
    created: project.created,
    updated: project.updated,
    dueDate: project.dueDate,
    completionPercentage: project.completionPercentage,
    taskCount: 0,
    lastAccessed: new Date().toISOString(),
    stats
  }
}

/**
 * Generate localStorage key for project-specific data
 */
export function getProjectStorageKey(projectId, dataType = 'tasks') {
  return `schoolgantt-${dataType}-${projectId}`
}

/**
 * Generate localStorage key for project metadata
 */
export function getProjectsListKey() {
  return 'schoolgantt-projects-list'
}

/**
 * Generate localStorage key for current project ID
 */
export function getCurrentProjectKey() {
  return 'schoolgantt-current-project'
}

/**
 * Create project from template
 */
export function createProjectFromTemplate(template, projectData = {}) {
  const baseProject = createProject(projectData)

  switch (template) {
    case ProjectTemplate.ACADEMIC:
      return {
        ...baseProject,
        name: projectData.name || 'Academic Project',
        description: 'Academic coursework project',
        submissionType: SubmissionType.DIGITAL,
        settings: {
          ...baseProject.settings,
          defaultView: 'week',
          showWeekends: false,
          dueDateReminders: true
        }
      }

    case ProjectTemplate.RESEARCH:
      return {
        ...baseProject,
        name: projectData.name || 'Research Project',
        description: 'Research and analysis project',
        priority: ProjectPriority.HIGH,
        settings: {
          ...baseProject.settings,
          defaultView: 'month',
          showWeekends: true
        }
      }

    case ProjectTemplate.SOFTWARE_DEV:
      return {
        ...baseProject,
        name: projectData.name || 'Software Development',
        description: 'Software development project',
        tags: ['development', 'software'],
        settings: {
          ...baseProject.settings,
          defaultView: 'week',
          enableDragDrop: true,
          showDependencyArrows: true
        }
      }

    case ProjectTemplate.PERSONAL:
      return {
        ...baseProject,
        name: projectData.name || 'Personal Project',
        description: 'Personal goals and tasks',
        priority: ProjectPriority.MEDIUM,
        settings: {
          ...baseProject.settings,
          defaultView: 'week',
          showWeekends: true
        }
      }

    case ProjectTemplate.BUSINESS:
      return {
        ...baseProject,
        name: projectData.name || 'Business Project',
        description: 'Business or professional project',
        priority: ProjectPriority.HIGH,
        settings: {
          ...baseProject.settings,
          defaultView: 'month',
          showWeekends: false,
          workingHours: {
            start: '09:00',
            end: '17:00'
          }
        }
      }

    default:
    case ProjectTemplate.BLANK:
      return baseProject
  }
}

/**
 * Create default multi-project app state
 */
export function createDefaultMultiProjectState() {
  const defaultProject = createProject({
    name: 'My First Project',
    description: 'Welcome to your project management system'
  })

  return {
    projects: [createProjectListItem(defaultProject)],
    currentProjectId: defaultProject.id,
    currentProject: defaultProject,
    tasks: [],
    settings: {
      defaultProjectTemplate: ProjectTemplate.BLANK,
      autoSwitchToNewProject: true,
      showProjectSelector: true,
      recentProjectsLimit: 5
    }
  }
}
