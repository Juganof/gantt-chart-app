import {
  ProjectPriority,
  ProjectStatus,
  TaskStatus,
  calculateTaskProgress,
  createProject,
  createTask,
  generateId,
  getFlattenedHierarchyTasks,
  getSubtasks,
  getTaskAncestors,
  getTaskDescendants,
  getTaskHierarchyTree,
  moveTaskToParent,
  reorderTasks,
  updateAllTaskHierarchies,
  validateAllTaskHierarchies,
  validateField,
  validateProject,
  validateProjectData,
  validateProjectRelationships,
  validateProjectStatusTransition,
  validateTask,
  validateTaskHierarchy,
  validateTaskStatusTransition,
  validateTaskTimeline,
  validateUserAction
} from '@/models/index.js'
import { createStore } from 'vuex'

// Data version for migration purposes
const DATA_VERSION = '2.0'

const store = createStore({
  state: {
    tasks: [],
    currentProject: null, // Set to null initially to prevent showing default project
    // Multi-project support
    projects: [], // List of project summaries for project management
    currentProjectId: null, // ID of currently active project
    multiProjectSettings: {
      defaultProjectTemplate: 'blank',
      autoSwitchToNewProject: true,
      showProjectSelector: true,
      recentProjectsLimit: 5,
      isMultiProjectMode: false // Flag to enable/disable multi-project features
    },
    dataVersion: DATA_VERSION,
    lastSaved: null,
    isDirty: false, // Track if data has unsaved changes
    isLoading: false // Track loading state to prevent flashing
  },
  mutations: {
    ADD_TASK(state, task) {
      state.tasks.push(task)
      state.isDirty = true
    },
    UPDATE_TASK(state, { id, updates }) {
      const index = state.tasks.findIndex(task => task.id === id)
      if (index !== -1) {
        state.tasks[index] = { ...state.tasks[index], ...updates }
        state.isDirty = true
      }
    },
    DELETE_TASK(state, id) {
      // Find the task to be deleted
      const taskToDelete = state.tasks.find(task => task.id === id)
      if (!taskToDelete) return

      // Remove from parent's subtasks array if it has a parent
      if (taskToDelete.parentTask) {
        const parent = state.tasks.find(task => task.id === taskToDelete.parentTask)
        if (parent && parent.subtasks) {
          parent.subtasks = parent.subtasks.filter(subtaskId => subtaskId !== id)
        }
      }

      // Handle descendants - either promote them or delete them
      const descendants = getTaskDescendants(id, state.tasks)
      descendants.forEach(descendant => {
        // Promote direct children to parent level or make them root tasks
        if (descendant.parentTask === id) {
          descendant.parentTask = taskToDelete.parentTask
          descendant.level = Math.max(0, (descendant.level || 1) - 1)

          // Update hierarchy path
          if (taskToDelete.parentTask) {
            const newParent = state.tasks.find(t => t.id === taskToDelete.parentTask)
            if (newParent) {
              descendant.hierarchyPath = [...(newParent.hierarchyPath || []), newParent.id]
              if (!newParent.subtasks.includes(descendant.id)) {
                newParent.subtasks.push(descendant.id)
              }
            }
          } else {
            descendant.hierarchyPath = []
          }
        }
      })

      // Remove the task from the tasks array
      state.tasks = state.tasks.filter(task => task.id !== id)

      // Clean up dependencies: remove any dependencies that reference the deleted task
      state.tasks.forEach(task => {
        if (task.dependencies && Array.isArray(task.dependencies)) {
          task.dependencies = task.dependencies.filter(dep => dep.fromTaskId !== id)
        }
      })

      state.isDirty = true
    },
    SET_TASKS(state, tasks) {
      state.tasks = tasks
      state.isDirty = true
    },
    UPDATE_PROJECT(state, project) {
      state.currentProject = { ...state.currentProject, ...project }
      state.isDirty = true
    },
    SET_DATA_VERSION(state, version) {
      state.dataVersion = version
    },
    SET_LAST_SAVED(state, timestamp) {
      state.lastSaved = timestamp
      state.isDirty = false
    },
    SET_DIRTY_STATE(state, isDirty) {
      state.isDirty = isDirty
    },
    SET_LOADING_STATE(state, isLoading) {
      state.isLoading = isLoading
    },
    SET_CURRENT_PROJECT(state, project) {
      state.currentProject = project
      state.isDirty = true
    },

    // Multi-project mutations
    SET_PROJECTS_LIST(state, projects) {
      state.projects = projects
      state.isDirty = true
    },

    ADD_PROJECT_TO_LIST(state, project) {
      // Check if project already exists
      const existingIndex = state.projects.findIndex(p => p.id === project.id)
      if (existingIndex !== -1) {
        // Update existing project
        state.projects[existingIndex] = { ...state.projects[existingIndex], ...project }
      } else {
        // Add new project
        state.projects.push(project)
      }
      state.isDirty = true
    },

    REMOVE_PROJECT_FROM_LIST(state, projectId) {
      state.projects = state.projects.filter(p => p.id !== projectId)
      state.isDirty = true
    },

    UPDATE_PROJECT_IN_LIST(state, { projectId, updates }) {
      const index = state.projects.findIndex(p => p.id === projectId)
      if (index !== -1) {
        state.projects[index] = { ...state.projects[index], ...updates }
        state.isDirty = true
      }
    },

    SET_CURRENT_PROJECT_ID(state, projectId) {
      state.currentProjectId = projectId
      state.isDirty = true
    },

    SET_MULTI_PROJECT_SETTINGS(state, settings) {
      state.multiProjectSettings = { ...state.multiProjectSettings, ...settings }
      state.isDirty = true
    },

    ENABLE_MULTI_PROJECT_MODE(state) {
      state.multiProjectSettings.isMultiProjectMode = true
      state.isDirty = true
    },

    DISABLE_MULTI_PROJECT_MODE(state) {
      state.multiProjectSettings.isMultiProjectMode = false
      state.isDirty = true
    },

    // Enhanced subtask mutations
    ADD_SUBTASK(state, { parentId, subtask }) {
      const parent = state.tasks.find(task => task.id === parentId)
      if (!parent) return

      // Initialize parent's subtasks array if it doesn't exist
      if (!parent.subtasks) {
        parent.subtasks = []
      }

      // Set basic hierarchy properties on subtask without circular reference
      subtask.parentTask = parentId
      subtask.level = (parent.level || 0) + 1
      subtask.hierarchyPath = [...(parent.hierarchyPath || []), parentId]
      subtask.order = parent.subtasks.length // Position at end

      state.tasks.push(subtask)

      // Update parent's subtasks array
      if (!parent.subtasks.includes(subtask.id)) {
        parent.subtasks.push(subtask.id)
      }

      state.isDirty = true
    },

    MOVE_TASK_TO_PARENT(state, { taskId, newParentId, newOrder }) {
      const result = moveTaskToParent(taskId, newParentId, state.tasks, newOrder)
      if (!result.success) {
        throw new Error(result.error)
      }
      state.isDirty = true
    },

    REORDER_TASKS(state, { taskIds, parentId }) {
      const result = reorderTasks(taskIds, parentId, state.tasks)
      if (!result.success) {
        throw new Error(result.error)
      }
      state.isDirty = true
    },

    TOGGLE_TASK_EXPANSION(state, taskId) {
      const task = state.tasks.find(t => t.id === taskId)
      if (task) {
        task.isExpanded = !task.isExpanded
        state.isDirty = true
      }
    },

    UPDATE_TASK_PROGRESS_MODE(state, { taskId, mode, manualProgress }) {
      const task = state.tasks.find(t => t.id === taskId)
      if (task) {
        task.progressMode = mode
        if (mode === 'manual' && manualProgress !== undefined) {
          task.manualProgress = Math.max(0, Math.min(100, manualProgress))
        }
        state.isDirty = true
      }
    },

    UPDATE_ALL_TASK_HIERARCHIES(state) {
      if (state.currentProject) {
        updateAllTaskHierarchies(state.currentProject.id, state.tasks)
        state.isDirty = true
      }
    }
  },
  actions: {
    addTask({ commit, state }, task) {
      // Create task with enhanced structure
      const newTask = createTask({
        projectId: state.currentProject.id,
        ...task
      })

      // Validate task before adding
      const validation = validateTask(newTask)
      if (!validation.isValid) {
        throw new Error(`Invalid task data: ${validation.errors.join(', ')}`)
      }

      commit('ADD_TASK', newTask)
      // Use multi-project save method
      if (state.multiProjectSettings.isMultiProjectMode && state.currentProject) {
        this.dispatch('saveProjectData', {
          project: state.currentProject,
          tasks: state.tasks
        })
      } else {
        this.dispatch('saveToLocalStorage')
      }
      return newTask
    },
    updateTask({ commit, state }, { id, updates }) {
      const existingTask = state.tasks.find(task => task.id === id)
      if (!existingTask) {
        throw new Error(`Task with ID ${id} not found`)
      }

      const updatedData = {
        ...updates,
        updated: new Date().toISOString()
      }

      // Validate status transitions if status is being changed
      if (updates.status && updates.status !== existingTask.status) {
        const statusValidation = validateTaskStatusTransition(
          existingTask.status,
          updates.status,
          existingTask
        )
        if (!statusValidation.isValid) {
          throw new Error(
            `Status transition validation failed: ${statusValidation.errors.join(', ')}`
          )
        }

        // Additional business rule: cannot complete task if subtasks are incomplete
        if (
          updates.status === TaskStatus.COMPLETED &&
          existingTask.subtasks &&
          existingTask.subtasks.length > 0
        ) {
          const subtasks = existingTask.subtasks
            .map(sid => state.tasks.find(t => t.id === sid))
            .filter(Boolean)
          const incompleteSubtasks = subtasks.filter(st => st.status !== TaskStatus.COMPLETED)
          if (incompleteSubtasks.length > 0) {
            throw new Error('Cannot complete task with incomplete subtasks')
          }
        }
      }

      // Create a temporary task object for validation
      const tempTask = { ...existingTask, ...updatedData }
      const validation = validateTask(tempTask)
      if (!validation.isValid) {
        throw new Error(`Invalid task update: ${validation.errors.join(', ')}`)
      }

      // Validate timeline if dates are being changed
      if (updates.startDate || updates.endDate) {
        const timelineValidation = validateTaskTimeline(tempTask, state.tasks)
        if (!timelineValidation.isValid) {
          console.warn('Timeline validation warnings:', timelineValidation.errors)
          // Don't throw error for timeline issues, just warn
        }
      }

      commit('UPDATE_TASK', { id, updates: updatedData })
      // Use multi-project save method
      if (state.multiProjectSettings.isMultiProjectMode && state.currentProject) {
        this.dispatch('saveProjectData', {
          project: state.currentProject,
          tasks: state.tasks
        })
      } else {
        this.dispatch('saveToLocalStorage')
      }
      return tempTask
    },
    deleteTask({ commit, state }, id) {
      commit('DELETE_TASK', id)
      // Use multi-project save method
      if (state.multiProjectSettings.isMultiProjectMode && state.currentProject) {
        this.dispatch('saveProjectData', {
          project: state.currentProject,
          tasks: state.tasks
        })
      } else {
        this.dispatch('saveToLocalStorage')
      }
    },
    loadFromLocalStorage({ commit, state }) {
      try {
        const storedTasks = localStorage.getItem('schoolgantt-tasks')
        const storedProject = localStorage.getItem('schoolgantt-project')
        const storedVersion = localStorage.getItem('schoolgantt-version') || '1.0'

        let tasks = storedTasks ? JSON.parse(storedTasks) : []
        let project = storedProject ? JSON.parse(storedProject) : {}

        // Data migration based on version
        if (storedVersion !== DATA_VERSION) {
          console.log(`Migrating data from version ${storedVersion} to ${DATA_VERSION}`)
          const migrationResult = this.dispatch('migrateData', {
            tasks,
            project,
            fromVersion: storedVersion
          })
          tasks = migrationResult.tasks
          project = migrationResult.project
        }

        // Validate and enhance project data
        if (Object.keys(project).length > 0) {
          // Merge with default project structure to add missing fields
          project = createProject(project)
          const projectValidation = validateProject(project)
          if (!projectValidation.isValid) {
            console.warn('Project validation failed:', projectValidation.errors)
            // Use default project if validation fails
            project = createProject({
              name: project.name || 'My School Project',
              description: project.description || 'Migrated project'
            })
          }
        } else {
          project = createProject()
        }

        // Validate and clean tasks data
        let validTasks = []
        if (Array.isArray(tasks) && tasks.length > 0) {
          validTasks = tasks
            .filter(task => task && task.id && task.title) // Basic structure check
            .map(task => {
              // Ensure task has projectId
              if (!task.projectId) {
                task.projectId = project.id
              }

              // Merge with default task structure for missing fields
              const enhancedTask = createTask(task)

              // Validate enhanced task
              const taskValidation = validateTask(enhancedTask)
              if (!taskValidation.isValid) {
                console.warn(`Task "${task.title}" validation failed:`, taskValidation.errors)
                // Try to fix common issues
                if (!enhancedTask.startDate)
                  enhancedTask.startDate = new Date().toISOString().split('T')[0]
                if (!enhancedTask.endDate) {
                  const endDate = new Date()
                  endDate.setDate(endDate.getDate() + 7) // Default to 1 week
                  enhancedTask.endDate = endDate.toISOString().split('T')[0]
                }
              }

              return enhancedTask
            })

          // Validate all relationships
          const relationshipValidation = validateProjectRelationships(project, validTasks)
          if (!relationshipValidation.isValid) {
            console.warn('Relationship validation issues found:', relationshipValidation.errors)
            // Could implement automatic fixes here if needed
          }
        }

        console.log('Load: Final tasks count before setting state:', validTasks.length)

        // Update state
        commit('SET_TASKS', validTasks)
        commit('UPDATE_PROJECT', project)
        commit('SET_DATA_VERSION', DATA_VERSION)
        commit('SET_DIRTY_STATE', false)

        // Save version for future loads
        localStorage.setItem('schoolgantt-version', DATA_VERSION)

        console.log(`Loaded ${validTasks.length} tasks and project "${project.name}"`)
      } catch (error) {
        console.error('Error loading from localStorage:', error)
        // Clear corrupted data and reset to defaults
        localStorage.removeItem('schoolgantt-tasks')
        localStorage.removeItem('schoolgantt-project')
        localStorage.removeItem('schoolgantt-version')

        // Reset to defaults
        commit('SET_TASKS', [])
        commit('UPDATE_PROJECT', createProject())
        commit('SET_DATA_VERSION', DATA_VERSION)
      }
    },
    migrateData({ commit }, { tasks, project, fromVersion }) {
      console.log(`Migrating data from version ${fromVersion} to ${DATA_VERSION}`)

      let migratedTasks = [...tasks]
      let migratedProject = { ...project }

      // Migration from version 1.0 to 2.0
      if (fromVersion === '1.0') {
        // Migrate project structure
        migratedProject = createProject({
          ...project,
          // Set default values for new fields
          subject: '',
          semester: '',
          priority: ProjectPriority.MEDIUM,
          status: ProjectStatus.ACTIVE,
          tags: [],
          milestones: [],
          completionPercentage: 0,
          gradeWeight: null,
          instructor: '',
          dueDate: null,
          submissionType: 'digital'
        })

        // Migrate tasks structure
        migratedTasks = tasks.map(task => {
          // Convert legacy dependency format to new format
          let dependencies = []
          if (task.dependencies && Array.isArray(task.dependencies)) {
            dependencies = task.dependencies.map(dep => {
              if (typeof dep === 'string') {
                // Legacy format: just task ID
                return {
                  id: generateId(),
                  fromTaskId: dep,
                  toTaskId: task.id,
                  type: 'finish-to-start',
                  lag: 0
                }
              } else if (typeof dep === 'object' && dep.fromTaskId) {
                // Already in new format but may be missing fields
                return {
                  id: dep.id || generateId(),
                  fromTaskId: dep.fromTaskId,
                  toTaskId: dep.toTaskId || task.id,
                  type: dep.type || 'finish-to-start',
                  lag: dep.lag || 0
                }
              }
              return dep
            })
          }

          return createTask({
            ...task,
            projectId: migratedProject.id,
            dependencies,
            // Ensure other new fields have defaults
            actualTime: task.actualTime || null,
            color: task.color || null,
            position: task.position || null
          })
        })
      }

      return { tasks: migratedTasks, project: migratedProject }
    },
    saveToLocalStorage({ state, commit }) {
      try {
        // Validate data before saving
        const projectValidation = validateProject(state.currentProject)
        if (!projectValidation.isValid) {
          console.warn('Project validation failed before save:', projectValidation.errors)
        }

        const relationshipValidation = validateProjectRelationships(
          state.currentProject,
          state.tasks
        )
        if (!relationshipValidation.isValid) {
          console.warn('Relationship validation failed before save:', relationshipValidation.errors)
        }

        // Save data with version
        const saveData = {
          tasks: state.tasks,
          project: state.currentProject,
          version: DATA_VERSION,
          savedAt: new Date().toISOString()
        }

        localStorage.setItem('schoolgantt-tasks', JSON.stringify(state.tasks))
        localStorage.setItem('schoolgantt-project', JSON.stringify(state.currentProject))
        localStorage.setItem('schoolgantt-version', DATA_VERSION)
        localStorage.setItem(
          'schoolgantt-metadata',
          JSON.stringify({
            version: DATA_VERSION,
            savedAt: saveData.savedAt,
            taskCount: state.tasks.length
          })
        )

        commit('SET_LAST_SAVED', saveData.savedAt)
      } catch (error) {
        console.error('Error saving to localStorage:', error)

        // Check if it's a quota exceeded error
        if (error.name === 'QuotaExceededError') {
          throw new Error('Storage quota exceeded. Please export your data and clear some space.')
        }

        throw error
      }
    },
    exportProject({ state }) {
      const projectData = {
        project: state.currentProject,
        tasks: state.tasks,
        exportedAt: new Date().toISOString(),
        version: DATA_VERSION,
        metadata: {
          taskCount: state.tasks.length,
          completedTasks: state.tasks.filter(task => task.status === TaskStatus.COMPLETED).length,
          projectStatus: state.currentProject.status
        }
      }

      return projectData
    },
    exportProjectAsFile({ state }) {
      const projectData = {
        project: state.currentProject,
        tasks: state.tasks,
        exportedAt: new Date().toISOString(),
        version: DATA_VERSION,
        metadata: {
          taskCount: state.tasks.length,
          completedTasks: state.tasks.filter(task => task.status === TaskStatus.COMPLETED).length,
          projectStatus: state.currentProject.status
        }
      }

      const dataStr = JSON.stringify(projectData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })

      const link = document.createElement('a')
      link.href = URL.createObjectURL(dataBlob)
      link.download = `gantt-project-${state.currentProject.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`
      link.click()

      URL.revokeObjectURL(link.href)
    },
    importProject({ commit, dispatch }, projectData) {
      try {
        // Validate imported data structure
        if (!projectData.project || !Array.isArray(projectData.tasks)) {
          throw new Error('Invalid project data format')
        }

        // Handle version differences
        let importedProject = projectData.project
        let importedTasks = projectData.tasks

        if (projectData.version && projectData.version !== DATA_VERSION) {
          console.log(`Importing data from version ${projectData.version}`)
          const migrationResult = dispatch('migrateData', {
            tasks: importedTasks,
            project: importedProject,
            fromVersion: projectData.version
          })
          importedTasks = migrationResult.tasks
          importedProject = migrationResult.project
        }

        // Validate imported project
        const projectValidation = validateProject(importedProject)
        if (!projectValidation.isValid) {
          console.warn('Imported project validation failed:', projectValidation.errors)
          // Try to fix by merging with default structure
          importedProject = createProject(importedProject)
        }

        // Validate imported tasks
        const validTasks = importedTasks
          .map(task => createTask({ ...task, projectId: importedProject.id }))
          .filter(task => {
            const validation = validateTask(task)
            if (!validation.isValid) {
              console.warn(`Skipping invalid task "${task.title}":`, validation.errors)
              return false
            }
            return true
          })

        // Clear existing data
        commit('SET_TASKS', [])

        // Import project info
        commit('UPDATE_PROJECT', importedProject)

        // Import tasks
        commit('SET_TASKS', validTasks)

        // Save to localStorage
        dispatch('saveToLocalStorage')

        return {
          success: true,
          message: `Project "${importedProject.name}" imported successfully with ${validTasks.length} tasks`
        }
      } catch (error) {
        console.error('Import error:', error)
        return { success: false, message: error.message || 'Failed to import project' }
      }
    },
    importProjectFromFile({ dispatch }, file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = function (e) {
          try {
            const projectData = JSON.parse(e.target.result)
            const result = dispatch('importProject', projectData)
            resolve(result)
          } catch (error) {
            reject({ success: false, message: 'Invalid JSON file format' })
          }
        }

        reader.onerror = function () {
          reject({ success: false, message: 'Failed to read file' })
        }

        reader.readAsText(file)
      })
    },

    // Validation Actions
    validateTaskAction({ state }, { taskId, action, context = {} }) {
      const task = state.tasks.find(t => t.id === taskId)
      if (!task) {
        return { isValid: false, errors: ['Task not found'] }
      }

      return validateUserAction(action, task, {
        ...context,
        allTasks: state.tasks
      })
    },

    validateProjectAction({ state }, { action, context = {} }) {
      return validateUserAction(action, state.currentProject, {
        ...context,
        allTasks: state.tasks
      })
    },

    validateFieldInput({ state }, { fieldName, value, context = {} }) {
      return validateField(fieldName, value, context)
    },

    validateStatusTransition({ state }, { taskId, newStatus }) {
      const task = state.tasks.find(t => t.id === taskId)
      if (!task) {
        return { isValid: false, errors: ['Task not found'] }
      }

      return validateTaskStatusTransition(task.status, newStatus, task)
    },

    validateProjectStatusTransition({ state }, { newStatus }) {
      return validateProjectStatusTransition(state.currentProject.status, newStatus)
    },

    validateTaskHierarchyDepth({ state }, { taskId }) {
      const task = state.tasks.find(t => t.id === taskId)
      if (!task) {
        return { isValid: false, errors: ['Task not found'] }
      }

      return validateTaskHierarchy(task, state.tasks)
    },

    validateCompleteProjectData({ state }) {
      return validateProjectData(state.currentProject, state.tasks)
    },

    // Enhanced delete action with validation
    deleteTaskSafe({ commit, state }, taskId) {
      const task = state.tasks.find(t => t.id === taskId)
      if (!task) {
        throw new Error('Task not found')
      }

      // Validate deletion
      const validation = validateUserAction('delete-task', task, { allTasks: state.tasks })
      if (!validation.isValid) {
        throw new Error(`Cannot delete task: ${validation.errors.join(', ')}`)
      }

      commit('DELETE_TASK', taskId)
      // Use multi-project save method
      if (state.multiProjectSettings.isMultiProjectMode && state.currentProject) {
        this.dispatch('saveProjectData', {
          project: state.currentProject,
          tasks: state.tasks
        })
      } else {
        this.dispatch('saveToLocalStorage')
      }
    },

    // Enhanced project update with validation
    updateProjectSafe({ commit, state }, updates) {
      // Validate status transition if status is being changed
      if (updates.status && updates.status !== state.currentProject.status) {
        const statusValidation = validateProjectStatusTransition(
          state.currentProject.status,
          updates.status
        )
        if (!statusValidation.isValid) {
          throw new Error(
            `Project status transition validation failed: ${statusValidation.errors.join(', ')}`
          )
        }
      }

      const updatedProject = { ...state.currentProject, ...updates }
      const validation = validateProject(updatedProject)
      if (!validation.isValid) {
        throw new Error(`Invalid project update: ${validation.errors.join(', ')}`)
      }

      commit('UPDATE_PROJECT', updates)
      this.dispatch('saveToLocalStorage')
      return updatedProject
    },

    // === Multi-Project Actions ===

    // Create a new project
    async createProject(
      { commit, state },
      { projectData, template = 'blank', switchToProject = true }
    ) {
      try {
        // Import the template function
        const { createProjectFromTemplate, createProjectListItem } = await import(
          '@/models/index.js'
        )

        // Create project from template
        const newProject = createProjectFromTemplate(template, projectData)

        // Validate project
        const validation = validateProject(newProject)
        if (!validation.isValid) {
          throw new Error(`Invalid project data: ${validation.errors.join(', ')}`)
        }

        // Add to projects list
        const projectListItem = createProjectListItem(newProject)
        commit('ADD_PROJECT_TO_LIST', projectListItem)

        // Save project data
        await this.dispatch('saveProjectData', { project: newProject, tasks: [] })

        // Switch to new project if requested
        if (switchToProject && state.multiProjectSettings.autoSwitchToNewProject) {
          await this.dispatch('switchToProject', newProject.id)
        }

        // Save projects list
        await this.dispatch('saveProjectsList')

        return newProject
      } catch (error) {
        console.error('Error creating project:', error)
        throw error
      }
    },

    // Switch to a different project
    async switchToProject({ commit, state }, projectId) {
      try {
        commit('SET_LOADING_STATE', true)

        if (state.currentProjectId === projectId) {
          commit('SET_LOADING_STATE', false)
          return // Already on this project
        }

        // Save current project state before switching
        if (state.currentProject && state.currentProject.id) {
          await this.dispatch('saveProjectData', {
            project: state.currentProject,
            tasks: state.tasks
          })
        }

        // Load new project data
        const projectData = await this.dispatch('loadProjectData', projectId)

        if (!projectData.project) {
          throw new Error(`Project with ID ${projectId} not found`)
        }

        // Update state
        commit('SET_CURRENT_PROJECT_ID', projectId)
        commit('SET_CURRENT_PROJECT', projectData.project)
        commit('SET_TASKS', projectData.tasks || [])

        // Update last accessed time
        commit('UPDATE_PROJECT_IN_LIST', {
          projectId,
          updates: { lastAccessed: new Date().toISOString() }
        })

        // Save projects list with updated access time
        await this.dispatch('saveProjectsList')

        commit('SET_LOADING_STATE', false)
        console.log(`Switched to project: ${projectData.project.name}`)
        return projectData.project
      } catch (error) {
        commit('SET_LOADING_STATE', false)
        console.error('Error switching project:', error)
        throw error
      }
    },

    // Delete a project and all its data
    async deleteProject({ commit, state }, projectId) {
      try {
        // Remove project data from localStorage
        const { getProjectStorageKey } = await import('@/models/index.js')
        localStorage.removeItem(getProjectStorageKey(projectId, 'tasks'))
        localStorage.removeItem(getProjectStorageKey(projectId, 'project'))

        // Remove from projects list
        commit('REMOVE_PROJECT_FROM_LIST', projectId)

        // Handle case when deleting current project
        if (state.currentProjectId === projectId) {
          const remainingProjects = state.projects.filter(p => p.id !== projectId)

          if (remainingProjects.length > 0) {
            // Switch to the first remaining project
            await this.dispatch('switchToProject', remainingProjects[0].id)
          } else {
            // No projects left - clear state and clean up all localStorage
            console.log('No projects remaining, clearing all state and localStorage...')
            commit('SET_CURRENT_PROJECT', null)
            commit('SET_TASKS', [])
            commit('SET_CURRENT_PROJECT_ID', null)
            commit('SET_LOADING_STATE', false)

            // Clear current project from localStorage
            const { getCurrentProjectKey } = await import('@/models/index.js')
            localStorage.removeItem(getCurrentProjectKey())

            // IMPORTANT: Clean up ALL old localStorage keys to prevent migration triggers
            // This prevents "My School Project" from reappearing on refresh
            localStorage.removeItem('schoolgantt-tasks')
            localStorage.removeItem('schoolgantt-project')
            localStorage.removeItem('schoolgantt-version')
            localStorage.removeItem('schoolgantt-metadata')

            // Also clear any other related keys that might exist
            const keysToRemove = []
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i)
              if (key && key.startsWith('schoolgantt-')) {
                keysToRemove.push(key)
              }
            }

            // Remove all found keys
            keysToRemove.forEach(key => {
              console.log(`Cleaning up localStorage key: ${key}`)
              localStorage.removeItem(key)
            })

            console.log('All localStorage data cleaned up')
          }
        }

        // Save updated projects list (even if empty)
        await this.dispatch('saveProjectsList')

        console.log(`Deleted project: ${projectId}`)

        // Return information about remaining projects
        return {
          remainingProjects: state.projects.length,
          wasLastProject: state.projects.length === 0
        }
      } catch (error) {
        console.error('Error deleting project:', error)
        throw error
      }
    },

    // Save project-specific data to localStorage
    async saveProjectData({ state }, { project, tasks }) {
      try {
        const { getProjectStorageKey } = await import('@/models/index.js')

        const projectKey = getProjectStorageKey(project.id, 'project')
        const tasksKey = getProjectStorageKey(project.id, 'tasks')

        localStorage.setItem(projectKey, JSON.stringify(project))
        localStorage.setItem(tasksKey, JSON.stringify(tasks))
      } catch (error) {
        console.error('Error saving project data:', error)
        throw error
      }
    },

    // Load project-specific data from localStorage
    async loadProjectData({ state }, projectId) {
      try {
        const { getProjectStorageKey } = await import('@/models/index.js')

        const projectKey = getProjectStorageKey(projectId, 'project')
        const tasksKey = getProjectStorageKey(projectId, 'tasks')

        const storedProject = localStorage.getItem(projectKey)
        const storedTasks = localStorage.getItem(tasksKey)

        const project = storedProject ? JSON.parse(storedProject) : null
        const tasks = storedTasks ? JSON.parse(storedTasks) : []

        return { project, tasks }
      } catch (error) {
        console.error('Error loading project data:', error)
        return { project: null, tasks: [] }
      }
    },

    // Save projects list to localStorage
    async saveProjectsList({ state }) {
      try {
        const { getProjectsListKey } = await import('@/models/index.js')
        const key = getProjectsListKey()
        localStorage.setItem(key, JSON.stringify(state.projects))
      } catch (error) {
        console.error('Error saving projects list:', error)
        throw error
      }
    },

    // Load projects list from localStorage
    async loadProjectsList({ commit }) {
      try {
        const { getProjectsListKey, validateProjectsList } = await import('@/models/index.js')
        const key = getProjectsListKey()
        const stored = localStorage.getItem(key)

        if (!stored) {
          return []
        }

        const projects = JSON.parse(stored)
        const validation = validateProjectsList(projects)

        if (!validation.isValid) {
          console.warn('Projects list validation failed:', validation.errors)
          return []
        }

        commit('SET_PROJECTS_LIST', projects)
        return projects
      } catch (error) {
        console.error('Error loading projects list:', error)
        return []
      }
    },

    // Initialize multi-project mode
    async initializeMultiProject({ commit, state, dispatch }) {
      try {
        commit('SET_LOADING_STATE', true)

        // Debug: Log current localStorage state
        console.log('Initializing multi-project mode...')
        console.log(
          'Current localStorage keys:',
          Object.keys(localStorage).filter(key => key.startsWith('schoolgantt'))
        )

        // First, check for old single-project data that needs migration
        const oldTasks = localStorage.getItem('schoolgantt-tasks')
        const oldProject = localStorage.getItem('schoolgantt-project')

        // Load existing projects list
        const projects = await dispatch('loadProjectsList')
        console.log(
          'Loaded projects:',
          projects.length,
          projects.map(p => ({ id: p.id, name: p.name }))
        )

        if (projects.length === 0) {
          // Check if we have old single-project data to migrate
          if (oldTasks && oldProject) {
            console.log('Migrating old single-project data to multi-project format')

            try {
              const parsedTasks = JSON.parse(oldTasks)
              const parsedProject = JSON.parse(oldProject)

              // Additional safeguard: Check if this data looks like real user data
              // Don't migrate if it's just default/empty data
              const hasRealData =
                parsedTasks.length > 0 ||
                (parsedProject.name &&
                  parsedProject.name !== 'My School Project' &&
                  parsedProject.name !== 'My First Project') ||
                (parsedProject.description &&
                  parsedProject.description.trim() &&
                  parsedProject.description !== 'Getting started with project management')

              if (!hasRealData) {
                console.log('Old data appears to be default/empty, skipping migration')
                // Clean up the old keys since they're not real user data
                localStorage.removeItem('schoolgantt-tasks')
                localStorage.removeItem('schoolgantt-project')
                localStorage.removeItem('schoolgantt-version')
                localStorage.removeItem('schoolgantt-metadata')
                commit('SET_LOADING_STATE', false)
                return
              }

              // Ensure the project has a valid ID
              if (!parsedProject.id) {
                const { generateId } = await import('@/models/index.js')
                parsedProject.id = generateId()
              }

              console.log(
                'Migrating project:',
                parsedProject.name,
                'with',
                parsedTasks.length,
                'tasks'
              )

              // Set the migrated project as current
              commit('SET_CURRENT_PROJECT', parsedProject)
              commit('SET_TASKS', parsedTasks)
              commit('SET_CURRENT_PROJECT_ID', parsedProject.id)

              // Create project list item
              const { createProjectListItem } = await import('@/models/index.js')
              const projectListItem = createProjectListItem(parsedProject)
              commit('ADD_PROJECT_TO_LIST', projectListItem)

              // Save the migrated data in new format
              await dispatch('saveProjectData', {
                project: parsedProject,
                tasks: parsedTasks
              })
              await dispatch('saveProjectsList')
              await dispatch('updateCurrentProjectId')

              // Clean up old storage keys
              localStorage.removeItem('schoolgantt-tasks')
              localStorage.removeItem('schoolgantt-project')
              localStorage.removeItem('schoolgantt-version')
              localStorage.removeItem('schoolgantt-metadata')

              console.log('Migration completed successfully')
            } catch (migrationError) {
              console.error('Failed to migrate old project data:', migrationError)
              // If migration fails, clean up the old keys and don't create a default project
              localStorage.removeItem('schoolgantt-tasks')
              localStorage.removeItem('schoolgantt-project')
              localStorage.removeItem('schoolgantt-version')
              localStorage.removeItem('schoolgantt-metadata')
              console.log('Cleaned up old data after migration failure')
            }
          } else {
            // No old data and no projects - this is intentional (user deleted all projects)
            console.log('No existing projects or old data found - user has deleted all projects')
          }
        } else {
          // Projects exist - load the current/most recent project
          console.log('Projects exist, loading current project...')
          const { getCurrentProjectKey } = await import('@/models/index.js')
          let currentProjectId = localStorage.getItem(getCurrentProjectKey())

          console.log('Saved current project ID:', currentProjectId)

          // If no saved current project or the saved project doesn't exist, use the first project
          if (!currentProjectId || !projects.find(p => p.id === currentProjectId)) {
            currentProjectId = projects[0].id
            console.log('Using first project as current:', currentProjectId)
          }

          try {
            await dispatch('switchToProject', currentProjectId)
            console.log('Successfully switched to project:', currentProjectId)
          } catch (error) {
            console.error('Failed to switch to project:', currentProjectId, error)
            // If switching fails, try the first project
            if (currentProjectId !== projects[0].id) {
              console.log('Retrying with first project:', projects[0].id)
              await dispatch('switchToProject', projects[0].id)
            }
          }
        }

        commit('ENABLE_MULTI_PROJECT_MODE')
        commit('SET_LOADING_STATE', false)
        console.log('Multi-project mode initialized successfully')
      } catch (error) {
        commit('SET_LOADING_STATE', false)
        console.error('Error initializing multi-project mode:', error)
        throw error
      }
    },

    // Helper action to create a default project
    async createDefaultProject({ commit, dispatch, state }) {
      const { createProject, ProjectStatus, ProjectPriority, createProjectListItem } = await import(
        '@/models/index.js'
      )

      const defaultProject = createProject({
        name: 'My First Project',
        description: 'Getting started with project management',
        status: ProjectStatus.ACTIVE,
        priority: ProjectPriority.MEDIUM
      })

      commit('SET_CURRENT_PROJECT', defaultProject)
      commit('SET_TASKS', [])
      commit('SET_CURRENT_PROJECT_ID', defaultProject.id)

      // Create project list item
      const projectListItem = createProjectListItem(defaultProject)
      commit('ADD_PROJECT_TO_LIST', projectListItem)

      // Save the new project
      await dispatch('saveProjectData', {
        project: defaultProject,
        tasks: []
      })
      await dispatch('saveProjectsList')
      await dispatch('updateCurrentProjectId')

      console.log('Created default project:', defaultProject.name)
    },

    // Update current project in localStorage
    async updateCurrentProjectId({ state }) {
      try {
        const { getCurrentProjectKey } = await import('@/models/index.js')
        const key = getCurrentProjectKey()
        localStorage.setItem(key, state.currentProjectId || '')
      } catch (error) {
        console.error('Error updating current project ID:', error)
      }
    },

    // Enhanced subtask actions
    addSubtask({ commit, state }, { parentId, subtaskData }) {
      const parent = state.tasks.find(task => task.id === parentId)
      if (!parent) {
        throw new Error(`Parent task with ID ${parentId} not found`)
      }

      // Create the subtask with proper hierarchy
      const subtask = createTask({
        ...subtaskData,
        parentTask: parentId,
        projectId: parent.projectId,
        order: getSubtasks(parentId, state.tasks).length // Add at the end
      })

      // Validate subtask
      const validation = validateTask(subtask)
      if (!validation.isValid) {
        throw new Error(`Invalid subtask data: ${validation.errors.join(', ')}`)
      }

      commit('ADD_SUBTASK', { parentId, subtask })
      // Use multi-project save method
      if (state.multiProjectSettings.isMultiProjectMode && state.currentProject) {
        this.dispatch('saveProjectData', {
          project: state.currentProject,
          tasks: state.tasks
        })
      } else {
        this.dispatch('saveToLocalStorage')
      }
      return subtask
    },

    moveTaskToParent({ commit, state }, { taskId, newParentId, newOrder = null }) {
      const task = state.tasks.find(t => t.id === taskId)
      if (!task) {
        throw new Error(`Task with ID ${taskId} not found`)
      }

      // Validate the move operation
      if (newParentId) {
        const newParent = state.tasks.find(t => t.id === newParentId)
        if (!newParent) {
          throw new Error(`Parent task with ID ${newParentId} not found`)
        }

        // Check if task would become its own descendant (circular reference)
        const descendants = getTaskDescendants(taskId, state.tasks)
        if (descendants.some(d => d.id === newParentId)) {
          throw new Error(
            'Cannot move task to its own descendant (would create circular reference)'
          )
        }
      }

      commit('MOVE_TASK_TO_PARENT', { taskId, newParentId, newOrder })
      // Use multi-project save method
      if (state.multiProjectSettings.isMultiProjectMode && state.currentProject) {
        this.dispatch('saveProjectData', {
          project: state.currentProject,
          tasks: state.tasks
        })
      } else {
        this.dispatch('saveToLocalStorage')
      }
      return { success: true }
    },

    reorderTasks({ commit, state }, { taskIds, parentId = null }) {
      // Validate that all tasks exist and have the same parent
      const tasks = taskIds.map(id => state.tasks.find(t => t.id === id)).filter(Boolean)
      if (tasks.length !== taskIds.length) {
        throw new Error('Some tasks in the reorder list were not found')
      }

      if (!tasks.every(task => task.parentTask === parentId)) {
        throw new Error('All tasks must have the same parent for reordering')
      }

      commit('REORDER_TASKS', { taskIds, parentId })
      // Use multi-project save method
      if (state.multiProjectSettings.isMultiProjectMode && state.currentProject) {
        this.dispatch('saveProjectData', {
          project: state.currentProject,
          tasks: state.tasks
        })
      } else {
        this.dispatch('saveToLocalStorage')
      }
      return { success: true }
    },

    toggleTaskExpansion({ commit }, taskId) {
      commit('TOGGLE_TASK_EXPANSION', taskId)
      // Note: Don't save to localStorage for UI state changes
    },

    updateTaskProgressMode({ commit, state }, { taskId, mode, manualProgress }) {
      const task = state.tasks.find(t => t.id === taskId)
      if (!task) {
        throw new Error(`Task with ID ${taskId} not found`)
      }

      if (!['auto', 'manual'].includes(mode)) {
        throw new Error('Progress mode must be either "auto" or "manual"')
      }

      if (mode === 'manual' && (manualProgress < 0 || manualProgress > 100)) {
        throw new Error('Manual progress must be between 0 and 100')
      }

      commit('UPDATE_TASK_PROGRESS_MODE', { taskId, mode, manualProgress })
      // Use multi-project save method
      if (state.multiProjectSettings.isMultiProjectMode && state.currentProject) {
        this.dispatch('saveProjectData', {
          project: state.currentProject,
          tasks: state.tasks
        })
      } else {
        this.dispatch('saveToLocalStorage')
      }
      return { success: true }
    },

    getTaskProgress({ state }, taskId) {
      const task = state.tasks.find(t => t.id === taskId)
      if (!task) {
        throw new Error(`Task with ID ${taskId} not found`)
      }

      return calculateTaskProgress(task, state.tasks)
    },

    getTaskHierarchy({ state }, projectId = null) {
      const projId = projectId || state.currentProject?.id
      if (!projId) {
        throw new Error('No project ID provided and no current project')
      }

      return getTaskHierarchyTree(projId, state.tasks)
    },

    getFlattenedTasks({ state }, { projectId = null, expandedTaskIds = [] }) {
      const projId = projectId || state.currentProject?.id
      if (!projId) {
        throw new Error('No project ID provided and no current project')
      }

      const expandedTasks = new Set(expandedTaskIds)
      return getFlattenedHierarchyTasks(projId, state.tasks, expandedTasks)
    },

    validateTaskHierarchies({ state }) {
      return validateAllTaskHierarchies(state.tasks)
    },

    repairTaskHierarchies({ commit, state }) {
      // Update all hierarchy metadata
      commit('UPDATE_ALL_TASK_HIERARCHIES')

      // Validate and log results
      const validation = validateAllTaskHierarchies(state.tasks)
      if (!validation.isValid) {
        console.warn('Hierarchy repair completed but some issues remain:', validation.errors)
      }

      // Use multi-project save method
      if (state.multiProjectSettings.isMultiProjectMode && state.currentProject) {
        this.dispatch('saveProjectData', {
          project: state.currentProject,
          tasks: state.tasks
        })
      } else {
        this.dispatch('saveToLocalStorage')
      }
      return validation
    }
  },
  getters: {
    // Basic task getters
    allTasks: state => state.tasks,
    taskById: state => id => state.tasks.find(task => task.id === id),
    tasksByStatus: state => status => state.tasks.filter(task => task.status === status),
    incompleteTasks: state => state.tasks.filter(task => task.status !== TaskStatus.COMPLETED),
    completedTasks: state => state.tasks.filter(task => task.status === TaskStatus.COMPLETED),

    // Enhanced filtering
    tasksByPriority: state => priority => state.tasks.filter(task => task.priority === priority),
    tasksByTag: state => tag => state.tasks.filter(task => task.tags && task.tags.includes(tag)),

    // Relationship getters
    rootTasks: state => state.tasks.filter(task => !task.parentTask),
    subtasksOf: state => parentId => state.tasks.filter(task => task.parentTask === parentId),

    // Enhanced hierarchy getters
    taskHierarchyTree: state => {
      if (!state.currentProject) return []
      return getTaskHierarchyTree(state.currentProject.id, state.tasks)
    },

    flattenedTasks:
      state =>
      (expandedTaskIds = []) => {
        if (!state.currentProject) return []
        const expandedTasks = new Set(expandedTaskIds)
        return getFlattenedHierarchyTasks(state.currentProject.id, state.tasks, expandedTasks)
      },

    taskProgress: state => taskId => {
      const task = state.tasks.find(t => t.id === taskId)
      if (!task) return 0
      return calculateTaskProgress(task, state.tasks)
    },

    taskDescendants: state => taskId => getTaskDescendants(taskId, state.tasks),
    taskAncestors: state => taskId => getTaskAncestors(taskId, state.tasks),

    taskLevel: state => taskId => {
      const task = state.tasks.find(t => t.id === taskId)
      return task ? task.level || 0 : 0
    },

    taskHierarchyPath: state => taskId => {
      const task = state.tasks.find(t => t.id === taskId)
      return task ? task.hierarchyPath || [] : []
    },

    hasSubtasks: state => taskId => {
      return state.tasks.some(task => task.parentTask === taskId)
    },

    isTaskExpanded: state => taskId => {
      const task = state.tasks.find(t => t.id === taskId)
      return task ? task.isExpanded !== false : true // Default to expanded
    },

    tasksByLevel: state => level => {
      return state.tasks.filter(task => (task.level || 0) === level)
    },

    maxHierarchyDepth: state => {
      return Math.max(0, ...state.tasks.map(task => task.level || 0))
    },

    hierarchyValidation: state => {
      return validateAllTaskHierarchies(state.tasks)
    },

    // Progress rollup getters
    parentTaskProgress: state => parentId => {
      const parent = state.tasks.find(t => t.id === parentId)
      if (!parent) return 0
      return calculateTaskProgress(parent, state.tasks)
    },

    subtaskProgressSummary: state => parentId => {
      const subtasks = state.tasks.filter(task => task.parentTask === parentId)
      if (subtasks.length === 0) return { total: 0, completed: 0, percentage: 0 }

      const completed = subtasks.filter(task => task.status === TaskStatus.COMPLETED).length
      const percentage = Math.round((completed / subtasks.length) * 100)

      return {
        total: subtasks.length,
        completed,
        percentage,
        remaining: subtasks.length - completed
      }
    },

    // Dependency-related getters
    taskDependencies: state => taskId => {
      const task = state.tasks.find(t => t.id === taskId)
      if (!task || !task.dependencies) return []
      return task.dependencies
        .map(dep => state.tasks.find(t => t.id === dep.fromTaskId))
        .filter(Boolean)
    },

    taskDependents: state => taskId => {
      return state.tasks.filter(
        task => task.dependencies && task.dependencies.some(dep => dep.fromTaskId === taskId)
      )
    },

    // Project statistics
    projectStats: state => {
      const tasks = state.tasks
      const totalTasks = tasks.length
      const completedTasks = tasks.filter(task => task.status === TaskStatus.COMPLETED).length
      const inProgressTasks = tasks.filter(task => task.status === TaskStatus.IN_PROGRESS).length
      const todoTasks = tasks.filter(task => task.status === TaskStatus.TODO).length

      return {
        totalTasks,
        completedTasks,
        inProgressTasks,
        todoTasks,
        completionPercentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        overdueTasks: tasks.filter(task => {
          if (task.status === TaskStatus.COMPLETED) return false
          const endDate = new Date(task.endDate)
          return endDate < new Date()
        }).length
      }
    },

    // State tracking
    hasUnsavedChanges: state => state.isDirty,
    lastSaveTime: state => state.lastSaved,

    // Available tags and priorities for filtering
    allTags: state => {
      const tagSet = new Set()
      state.tasks.forEach(task => {
        if (task.tags) {
          task.tags.forEach(tag => tagSet.add(tag))
        }
      })
      return Array.from(tagSet).sort()
    },

    // Timeline helpers
    projectDateRange: state => {
      const tasks = state.tasks.filter(task => task.startDate && task.endDate)
      if (tasks.length === 0) return null

      const startDates = tasks.map(task => new Date(task.startDate))
      const endDates = tasks.map(task => new Date(task.endDate))

      return {
        start: new Date(Math.min(...startDates)),
        end: new Date(Math.max(...endDates))
      }
    },

    // === Multi-Project Getters ===

    // Projects list and management
    allProjects: state => state.projects,
    currentProjectId: state => state.currentProjectId,
    isMultiProjectMode: state => state.multiProjectSettings.isMultiProjectMode,
    multiProjectSettings: state => state.multiProjectSettings,

    // Get project by ID from projects list
    projectById: state => id => state.projects.find(project => project.id === id),

    // Get recent projects (sorted by lastAccessed)
    recentProjects: state => {
      const limit = state.multiProjectSettings.recentProjectsLimit
      return [...state.projects]
        .sort(
          (a, b) =>
            new Date(b.lastAccessed || b.updated || b.created) -
            new Date(a.lastAccessed || a.updated || a.created)
        )
        .slice(0, limit)
    },

    // Get projects by status
    projectsByStatus: state => status =>
      state.projects.filter(project => project.status === status),

    // Get projects by priority
    projectsByPriority: state => priority =>
      state.projects.filter(project => project.priority === priority),

    // Check if there are multiple projects
    hasMultipleProjects: state => state.projects.length > 1,

    // Get project statistics
    allProjectsStats: state => {
      return {
        totalProjects: state.projects.length,
        activeProjects: state.projects.filter(p => p.status === 'active').length,
        completedProjects: state.projects.filter(p => p.status === 'completed').length,
        overdueLater: state.projects.filter(p => {
          return p.dueDate && new Date(p.dueDate) < new Date() && p.status !== 'completed'
        }).length
      }
    }
  }
})

export default store
