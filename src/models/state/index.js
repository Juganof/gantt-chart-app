/**
 * Default State Module
 * Provides default application state creators
 */

import { ProjectPriority, ProjectStatus } from '../constants.js'
import { createProject } from '../project.js'

/**
 * Default application state
 */
export function createDefaultAppState() {
  return {
    currentProject: createProject({
      name: 'My School Project',
      description: 'A sample project to get started',
      subject: '',
      semester: '',
      priority: ProjectPriority.MEDIUM,
      status: ProjectStatus.ACTIVE
    }),
    tasks: [],
    dependencies: [],
    selectedTaskId: null,
    viewMode: 'week',
    timelineRange: {
      start: new Date().toISOString(),
      end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
    },
    filters: {
      status: [],
      priority: [],
      tags: [],
      search: ''
    },
    modals: {
      addTask: false,
      editTask: false,
      deleteConfirm: false,
      settings: false,
      projectSettings: false
    }
  }
}
