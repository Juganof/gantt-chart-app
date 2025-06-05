/**
 * Unit Tests for Models Module
 * 
 * Tests the core data models and utility functions used throughout the application.
 */

import {
    DateUtils,
    DependencyType,
    ProjectStatus,
    TaskPriority,
    TaskStatus,
    addTaskDependency,
    createProject,
    createTask,
    generateId,
    removeTaskDependency,
    validateTask
} from '@/models/index.js'
import { beforeEach, describe, expect, it } from 'vitest'

describe('Models Module', () => {
  describe('generateId()', () => {
    it('should generate a UUID-like string', () => {
      const id = generateId()
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
    })

    it('should generate unique IDs', () => {
      const id1 = generateId()
      const id2 = generateId()
      expect(id1).not.toBe(id2)
    })
  })

  describe('DateUtils', () => {
    describe('toISOString()', () => {
      it('should convert Date object to ISO string', () => {
        const date = new Date('2024-01-01T12:00:00Z')
        const result = DateUtils.toISOString(date)
        expect(result).toBe('2024-01-01T12:00:00.000Z')
      })

      it('should convert date string to ISO string', () => {
        const result = DateUtils.toISOString('2024-01-01')
        expect(result).toMatch(/2024-01-01T\d{2}:\d{2}:\d{2}\.\d{3}Z/)
      })
    })

    describe('addDays()', () => {
      it('should add days to a date', () => {
        const date = new Date('2024-01-01')
        const result = DateUtils.addDays(date, 5)
        expect(result.toISOString().split('T')[0]).toBe('2024-01-06')
      })

      it('should handle negative days', () => {
        const date = new Date('2024-01-10')
        const result = DateUtils.addDays(date, -5)
        expect(result.toISOString().split('T')[0]).toBe('2024-01-05')
      })
    })

    describe('diffInDays()', () => {
      it('should calculate difference between dates', () => {
        const date1 = '2024-01-01'
        const date2 = '2024-01-06'
        const result = DateUtils.diffInDays(date1, date2)
        expect(result).toBe(5)
      })

      it('should handle negative differences', () => {
        const date1 = '2024-01-06'
        const date2 = '2024-01-01'
        const result = DateUtils.diffInDays(date1, date2)
        expect(result).toBe(-5)
      })
    })

    describe('isWeekend()', () => {
      it('should identify Saturday as weekend', () => {
        const saturday = new Date('2024-01-06') // Saturday
        expect(DateUtils.isWeekend(saturday)).toBe(true)
      })

      it('should identify Sunday as weekend', () => {
        const sunday = new Date('2024-01-07') // Sunday
        expect(DateUtils.isWeekend(sunday)).toBe(true)
      })

      it('should identify weekdays as not weekend', () => {
        const monday = new Date('2024-01-08') // Monday
        expect(DateUtils.isWeekend(monday)).toBe(false)
      })
    })
  })

  describe('Constants', () => {
    it('should have correct TaskStatus values', () => {
      expect(TaskStatus.TODO).toBe('todo')
      expect(TaskStatus.IN_PROGRESS).toBe('in-progress')
      expect(TaskStatus.COMPLETED).toBe('completed')
      expect(TaskStatus.ON_HOLD).toBe('on-hold')
      expect(TaskStatus.CANCELLED).toBe('cancelled')
    })

    it('should have correct TaskPriority values', () => {
      expect(TaskPriority.LOW).toBe('low')
      expect(TaskPriority.MEDIUM).toBe('medium')
      expect(TaskPriority.HIGH).toBe('high')
      expect(TaskPriority.CRITICAL).toBe('critical')
    })

    it('should have correct ProjectStatus values', () => {
      expect(ProjectStatus.ACTIVE).toBe('active')
      expect(ProjectStatus.COMPLETED).toBe('completed')
      expect(ProjectStatus.ON_HOLD).toBe('on-hold')
      expect(ProjectStatus.CANCELLED).toBe('cancelled')
    })
  })

  describe('createTask()', () => {
    it('should create a task with default values', () => {
      const task = createTask()
      
      expect(task).toHaveProperty('id')
      expect(task.title).toBe('')
      expect(task.status).toBe(TaskStatus.TODO)
      expect(task.priority).toBe(TaskPriority.MEDIUM)
      expect(task.dependencies).toEqual([])
      expect(task.subtasks).toEqual([])
      expect(task.complexity).toBe(5)
      expect(task.aiGenerated).toBe(false)
    })

    it('should override default values with provided data', () => {
      const taskData = {
        title: 'Test Task',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH
      }
      
      const task = createTask(taskData)
      
      expect(task.title).toBe('Test Task')
      expect(task.status).toBe(TaskStatus.IN_PROGRESS)
      expect(task.priority).toBe(TaskPriority.HIGH)
    })

    it('should generate unique IDs for each task', () => {
      const task1 = createTask()
      const task2 = createTask()
      
      expect(task1.id).not.toBe(task2.id)
    })
  })

  describe('createProject()', () => {
    it('should create a project with default values', () => {
      const project = createProject()
      
      expect(project).toHaveProperty('id')
      expect(project.name).toBe('My School Project')
      expect(project.status).toBe('active')
      expect(project.priority).toBe('medium')
      expect(project.completionPercentage).toBe(0)
      expect(project.settings).toHaveProperty('defaultView')
      expect(project.settings.autoSave).toBe(true)
    })

    it('should override default values with provided data', () => {
      const projectData = {
        name: 'Custom Project',
        subject: 'Computer Science',
        priority: 'high'
      }
      
      const project = createProject(projectData)
      
      expect(project.name).toBe('Custom Project')
      expect(project.subject).toBe('Computer Science')
      expect(project.priority).toBe('high')
    })
  })

  describe('validateTask()', () => {
    it('should return no errors for valid task', () => {
      const task = createTask({
        title: 'Valid Task',
        startDate: '2024-01-01',
        endDate: '2024-01-07'
      })
      
      const result = validateTask(task)
      
      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should return errors for invalid task', () => {
      const task = createTask({
        title: '', // Invalid: empty title
        startDate: '2024-01-07',
        endDate: '2024-01-01' // Invalid: end date before start date
      })
      
      const result = validateTask(task)
      
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })

  describe('Task Dependencies', () => {
    let task1, task2

    beforeEach(() => {
      task1 = createTask({ title: 'Task 1' })
      task2 = createTask({ title: 'Task 2' })
    })

    describe('addTaskDependency()', () => {
      it('should add a dependency to a task', () => {
        const result = addTaskDependency(task1, task2.id)
        
        expect(result).toBe(task1) // Returns the task object
        expect(task1.dependencies).toHaveLength(1)
        expect(task1.dependencies[0].fromTaskId).toBe(task2.id)
        expect(task1.dependencies[0].type).toBe(DependencyType.FINISH_TO_START)
      })

      it('should update existing dependency instead of creating duplicate', () => {
        addTaskDependency(task1, task2.id, DependencyType.FINISH_TO_START)
        addTaskDependency(task1, task2.id, DependencyType.START_TO_START)
        
        expect(task1.dependencies).toHaveLength(1)
        expect(task1.dependencies[0].type).toBe(DependencyType.START_TO_START)
      })
    })

    describe('removeTaskDependency()', () => {
      it('should remove a dependency from a task', () => {
        addTaskDependency(task1, task2.id)
        expect(task1.dependencies).toHaveLength(1)
        
        const result = removeTaskDependency(task1, task2.id)
        
        expect(result).toBe(task1) // Returns the task object
        expect(task1.dependencies).toHaveLength(0)
      })

      it('should handle removing non-existent dependency gracefully', () => {
        const result = removeTaskDependency(task1, 'non-existent-id')
        
        expect(result).toBe(task1) // Returns the task object
        expect(task1.dependencies).toHaveLength(0)
      })
    })
  })
}) 