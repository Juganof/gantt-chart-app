<template>
  <div class="project-form">
    <div class="form-header">
      <h3>{{ isEditing ? 'Edit Project' : 'Create New Project' }}</h3>
      <button class="close-btn" @click="$emit('cancel')" type="button">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>

    <form @submit.prevent="handleSubmit" class="form-content">
      <!-- Template Selection (only for new projects) -->
      <div v-if="!isEditing" class="form-section">
        <label class="section-label">Choose Project Template</label>
        <div class="template-grid">
          <div
            v-for="template in projectTemplates"
            :key="template.id"
            class="template-card"
            :class="{ active: formData.template === template.id }"
            @click="selectTemplate(template.id)"
          >
            <div class="template-icon">
              <component :is="template.icon" />
            </div>
            <h4>{{ template.name }}</h4>
            <p>{{ template.description }}</p>
          </div>
        </div>
      </div>

      <!-- Basic Information -->
      <div class="form-section">
        <label class="section-label">Basic Information</label>
        <div class="form-grid">
          <div class="form-group">
            <label for="name">Project Name *</label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              required
              placeholder="Enter project name"
              :class="{ error: errors.name }"
            />
            <span v-if="errors.name" class="error-text">{{ errors.name }}</span>
          </div>

          <div class="form-group">
            <label for="priority">Priority</label>
            <select id="priority" v-model="formData.priority">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div class="form-group span-full">
            <label for="description">Description</label>
            <textarea
              id="description"
              v-model="formData.description"
              placeholder="Describe your project..."
              rows="3"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Academic Information -->
      <div class="form-section">
        <label class="section-label">Academic Details</label>
        <div class="form-grid">
          <div class="form-group">
            <label for="subject">Subject/Course</label>
            <input
              id="subject"
              v-model="formData.subject"
              type="text"
              placeholder="e.g., Computer Science"
            />
          </div>

          <div class="form-group">
            <label for="semester">Semester</label>
            <input
              id="semester"
              v-model="formData.semester"
              type="text"
              placeholder="e.g., Fall 2024"
            />
          </div>

          <div class="form-group">
            <label for="instructor">Instructor</label>
            <input
              id="instructor"
              v-model="formData.instructor"
              type="text"
              placeholder="Professor name"
            />
          </div>

          <div class="form-group">
            <label for="gradeWeight">Grade Weight (%)</label>
            <input
              id="gradeWeight"
              v-model.number="formData.gradeWeight"
              type="number"
              min="0"
              max="100"
              placeholder="0-100"
            />
          </div>

          <div class="form-group">
            <label for="submissionType">Submission Type</label>
            <select id="submissionType" v-model="formData.submissionType">
              <option value="digital">Digital</option>
              <option value="physical">Physical</option>
              <option value="presentation">Presentation</option>
              <option value="exam">Exam</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Dates and Timeline -->
      <div class="form-section">
        <label class="section-label">Timeline</label>
        <div class="form-grid">
          <div class="form-group">
            <label for="startDate">Start Date</label>
            <input id="startDate" v-model="formData.startDate" type="date" />
          </div>

          <div class="form-group">
            <label for="dueDate">Due Date</label>
            <input id="dueDate" v-model="formData.dueDate" type="date" />
          </div>

          <div class="form-group">
            <label for="estimatedDuration">Estimated Duration</label>
            <input
              id="estimatedDuration"
              v-model="formData.estimatedDuration"
              type="text"
              placeholder="e.g., 4 weeks, 40 hours"
            />
          </div>
        </div>
      </div>

      <!-- Tags and Organization -->
      <div class="form-section">
        <label class="section-label">Organization</label>
        <div class="form-grid">
          <div class="form-group">
            <label for="color">Project Color</label>
            <div class="color-picker">
              <input id="color" v-model="formData.color" type="color" class="color-input" />
              <span class="color-label">{{ formData.color || '#007bff' }}</span>
            </div>
          </div>

          <div class="form-group span-full">
            <label for="tags">Tags</label>
            <div class="tags-input">
              <div class="tags-display">
                <span v-for="(tag, index) in formData.tags" :key="index" class="tag">
                  {{ tag }}
                  <button type="button" @click="removeTag(index)" class="tag-remove">×</button>
                </span>
              </div>
              <input
                v-model="newTag"
                type="text"
                placeholder="Add tags..."
                @keydown.enter.prevent="addTag"
                @keydown.comma.prevent="addTag"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <button type="button" @click="$emit('cancel')" class="btn-secondary">Cancel</button>
        <button type="submit" class="btn-primary" :disabled="!isFormValid">
          {{ isEditing ? 'Update Project' : 'Create Project' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { ProjectTemplate } from '@/models/index.js'

// Template icons (you can use any icon library or SVG components)
const BlankIcon = {
  template:
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="9" x2="15" y2="9"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>'
}
const AcademicIcon = {
  template:
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>'
}
const ResearchIcon = {
  template:
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="M21 21l-4.35-4.35"></path></svg>'
}
const SoftwareIcon = {
  template:
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>'
}
const PersonalIcon = {
  template:
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>'
}
const BusinessIcon = {
  template:
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9h18l-2 9H5L3 9Z"></path><path d="M3 9V7a2 2 0 0 1 2-2h4l2 2h4a2 2 0 0 1 2 2v2"></path></svg>'
}

export default {
  name: 'ProjectForm',
  components: {
    BlankIcon,
    AcademicIcon,
    ResearchIcon,
    SoftwareIcon,
    PersonalIcon,
    BusinessIcon
  },
  props: {
    project: {
      type: Object,
      default: null
    }
  },
  emits: ['submit', 'cancel'],
  data() {
    return {
      formData: {
        name: '',
        description: '',
        subject: '',
        semester: '',
        instructor: '',
        priority: 'medium',
        startDate: '',
        dueDate: '',
        estimatedDuration: '',
        gradeWeight: null,
        submissionType: 'digital',
        color: '#007bff',
        tags: [],
        template: ProjectTemplate.BLANK
      },
      newTag: '',
      errors: {},
      projectTemplates: [
        {
          id: ProjectTemplate.BLANK,
          name: 'Blank Project',
          description: 'Start with a clean slate',
          icon: 'BlankIcon'
        },
        {
          id: ProjectTemplate.ACADEMIC,
          name: 'Academic Project',
          description: 'Coursework and assignments',
          icon: 'AcademicIcon'
        },
        {
          id: ProjectTemplate.RESEARCH,
          name: 'Research Project',
          description: 'Research and analysis work',
          icon: 'ResearchIcon'
        },
        {
          id: ProjectTemplate.SOFTWARE_DEV,
          name: 'Software Development',
          description: 'Coding and development projects',
          icon: 'SoftwareIcon'
        },
        {
          id: ProjectTemplate.PERSONAL,
          name: 'Personal Project',
          description: 'Personal goals and tasks',
          icon: 'PersonalIcon'
        },
        {
          id: ProjectTemplate.BUSINESS,
          name: 'Business Project',
          description: 'Professional and business work',
          icon: 'BusinessIcon'
        }
      ]
    }
  },
  computed: {
    isEditing() {
      return !!this.project
    },
    isFormValid() {
      return this.formData.name.trim().length > 0 && Object.keys(this.errors).length === 0
    }
  },
  watch: {
    'formData.name'() {
      this.validateName()
    },
    'formData.dueDate'() {
      this.validateDates()
    },
    'formData.startDate'() {
      this.validateDates()
    }
  },
  mounted() {
    if (this.isEditing) {
      this.populateForm()
    } else {
      // Set default start date to today
      this.formData.startDate = new Date().toISOString().split('T')[0]
    }
  },
  methods: {
    populateForm() {
      if (this.project) {
        this.formData = {
          name: this.project.name || '',
          description: this.project.description || '',
          subject: this.project.subject || '',
          semester: this.project.semester || '',
          instructor: this.project.instructor || '',
          priority: this.project.priority || 'medium',
          startDate: this.project.startDate ? this.project.startDate.split('T')[0] : '',
          dueDate: this.project.dueDate ? this.project.dueDate.split('T')[0] : '',
          estimatedDuration: this.project.estimatedDuration || '',
          gradeWeight: this.project.gradeWeight,
          submissionType: this.project.submissionType || 'digital',
          color: this.project.color || '#007bff',
          tags: [...(this.project.tags || [])],
          template: ProjectTemplate.BLANK // Template not applicable for editing
        }
      }
    },
    selectTemplate(templateId) {
      this.formData.template = templateId

      // Apply template-specific defaults
      switch (templateId) {
        case ProjectTemplate.ACADEMIC:
          if (!this.formData.submissionType || this.formData.submissionType === 'digital') {
            this.formData.submissionType = 'digital'
          }
          break
        case ProjectTemplate.RESEARCH:
          this.formData.priority = 'high'
          break
        case ProjectTemplate.SOFTWARE_DEV:
          this.formData.tags = ['development', 'software']
          break
        case ProjectTemplate.PERSONAL:
          this.formData.priority = 'medium'
          break
        case ProjectTemplate.BUSINESS:
          this.formData.priority = 'high'
          break
      }
    },
    addTag() {
      const tag = this.newTag.trim().toLowerCase()
      if (tag && !this.formData.tags.includes(tag)) {
        this.formData.tags.push(tag)
        this.newTag = ''
      }
    },
    removeTag(index) {
      this.formData.tags.splice(index, 1)
    },
    validateName() {
      if (!this.formData.name.trim()) {
        this.errors.name = 'Project name is required'
      } else if (this.formData.name.trim().length < 2) {
        this.errors.name = 'Project name must be at least 2 characters'
      } else {
        delete this.errors.name
      }
    },
    validateDates() {
      delete this.errors.dates

      if (this.formData.startDate && this.formData.dueDate) {
        if (new Date(this.formData.startDate) > new Date(this.formData.dueDate)) {
          this.errors.dates = 'Start date must be before due date'
        }
      }
    },
    handleSubmit() {
      this.validateName()
      this.validateDates()

      if (!this.isFormValid) {
        return
      }

      // Prepare project data
      const projectData = {
        ...this.formData,
        // Convert date strings to ISO format
        startDate: this.formData.startDate ? new Date(this.formData.startDate).toISOString() : null,
        dueDate: this.formData.dueDate ? new Date(this.formData.dueDate).toISOString() : null
      }

      // Remove template from data when editing (not needed)
      if (this.isEditing) {
        delete projectData.template
      }

      this.$emit('submit', projectData)
    }
  }
}
</script>

<style scoped>
.project-form {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
}

.form-header h3 {
  margin: 0;
  color: #495057;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #6c757d;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background: #e9ecef;
}

.form-content {
  padding: 2rem;
  overflow-y: auto;
  max-height: calc(90vh - 80px);
}

.form-section {
  margin-bottom: 2rem;
}

.section-label {
  display: block;
  font-weight: 600;
  color: #495057;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #007bff;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.template-card {
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.template-card:hover {
  border-color: #007bff;
  background: #f8f9ff;
}

.template-card.active {
  border-color: #007bff;
  background: #e7f1ff;
}

.template-icon {
  color: #007bff;
  margin-bottom: 1rem;
}

.template-card h4 {
  margin: 0 0 0.5rem 0;
  color: #495057;
  font-size: 1rem;
}

.template-card p {
  margin: 0;
  color: #6c757d;
  font-size: 0.875rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.span-full {
  grid-column: 1 / -1;
}

.form-group label {
  font-weight: 500;
  color: #495057;
  margin-bottom: 0.5rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.form-group input.error {
  border-color: #dc3545;
}

.error-text {
  color: #dc3545;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.color-picker {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.color-input {
  width: 50px;
  height: 40px;
  padding: 0;
  border: 1px solid #ced4da;
  border-radius: 4px;
  cursor: pointer;
}

.color-label {
  font-family: monospace;
  color: #6c757d;
  font-size: 0.875rem;
}

.tags-input {
  border: 1px solid #ced4da;
  border-radius: 4px;
  padding: 0.5rem;
  min-height: 40px;
}

.tags-display {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.tag {
  background: #007bff;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.tag-remove {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  padding: 0;
}

.tags-input input {
  border: none;
  outline: none;
  width: 100%;
  padding: 0.25rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.btn-secondary,
.btn-primary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-primary:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .form-content {
    padding: 1rem;
  }

  .template-grid {
    grid-template-columns: 1fr;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>
