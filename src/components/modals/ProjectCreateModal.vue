<template>
  <div v-if="isVisible" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
          Create New Project
        </h3>
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

      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <!-- Project Template Selection -->
          <div class="form-section">
            <h4 class="section-title">Choose Project Template</h4>
            <div class="template-grid">
              <div
                v-for="template in templates"
                :key="template.id"
                class="template-card"
                :class="{ selected: formData.template === template.id }"
                @click="formData.template = template.id"
              >
                <div class="template-icon">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <template v-if="template.id === 'blank'">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14,2 14,8 20,8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10,9 9,9 8,9"></polyline>
                    </template>
                    <template v-else-if="template.id === 'academic'">
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                    </template>
                    <template v-else-if="template.id === 'software'">
                      <polyline points="16,18 22,12 16,6"></polyline>
                      <polyline points="8,6 2,12 8,18"></polyline>
                    </template>
                    <template v-else-if="template.id === 'research'">
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="M21 21l-4.35-4.35"></path>
                    </template>
                  </svg>
                </div>
                <h5 class="template-name">{{ template.name }}</h5>
                <p class="template-description">{{ template.description }}</p>
              </div>
            </div>
          </div>

          <!-- Basic Project Information -->
          <div class="form-section">
            <h4 class="section-title">Project Details</h4>

            <div class="form-group">
              <label for="projectName" class="form-label required">Project Name</label>
              <input
                id="projectName"
                v-model="formData.name"
                type="text"
                class="form-input"
                placeholder="Enter project name"
                :class="{ error: errors.name }"
                required
              />
              <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
            </div>

            <div class="form-group">
              <label for="projectDescription" class="form-label">Description</label>
              <textarea
                id="projectDescription"
                v-model="formData.description"
                class="form-input textarea"
                placeholder="Describe your project (optional)"
                rows="3"
              ></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="projectColor" class="form-label">Project Color</label>
                <div class="color-picker">
                  <input
                    id="projectColor"
                    v-model="formData.color"
                    type="color"
                    class="color-input"
                  />
                  <span class="color-preview" :style="{ backgroundColor: formData.color }"></span>
                </div>
              </div>

              <div class="form-group">
                <label for="projectPriority" class="form-label">Priority</label>
                <select id="projectPriority" v-model="formData.priority" class="form-input">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="projectStartDate" class="form-label">Start Date</label>
                <input
                  id="projectStartDate"
                  v-model="formData.startDate"
                  type="date"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label for="projectDueDate" class="form-label">Due Date</label>
                <input
                  id="projectDueDate"
                  v-model="formData.dueDate"
                  type="date"
                  class="form-input"
                  :class="{ error: errors.dueDate }"
                />
                <span v-if="errors.dueDate" class="error-message">{{ errors.dueDate }}</span>
              </div>
            </div>
          </div>

          <!-- Academic Information (conditional) -->
          <div v-if="showAcademicFields" class="form-section">
            <h4 class="section-title">
              Academic Information
              <button
                type="button"
                @click="showAcademicFields = false"
                class="remove-section-btn"
                title="Remove academic fields"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </h4>

            <div class="form-row">
              <div class="form-group">
                <label for="subject" class="form-label">Subject/Course</label>
                <input
                  id="subject"
                  v-model="formData.subject"
                  type="text"
                  class="form-input"
                  placeholder="e.g., Computer Science"
                />
              </div>

              <div class="form-group">
                <label for="semester" class="form-label">Semester</label>
                <input
                  id="semester"
                  v-model="formData.semester"
                  type="text"
                  class="form-input"
                  placeholder="e.g., Fall 2024"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="instructor" class="form-label">Instructor</label>
                <input
                  id="instructor"
                  v-model="formData.instructor"
                  type="text"
                  class="form-input"
                  placeholder="Professor name"
                />
              </div>

              <div class="form-group">
                <label for="gradeWeight" class="form-label">Grade Weight (%)</label>
                <input
                  id="gradeWeight"
                  v-model.number="formData.gradeWeight"
                  type="number"
                  class="form-input"
                  placeholder="0-100"
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>

          <!-- Add Academic Fields Button -->
          <div v-if="!showAcademicFields" class="form-section">
            <button type="button" @click="showAcademicFields = true" class="add-section-btn">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
              </svg>
              Add Academic Information
            </button>
          </div>

          <!-- Project Options -->
          <div class="form-section">
            <h4 class="section-title">Options</h4>

            <div class="checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="formData.switchToProject" class="checkbox-input" />
                <span class="checkbox-custom"></span>
                Switch to this project after creation
              </label>
            </div>

            <div class="checkbox-group">
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  v-model="formData.createDefaultTasks"
                  class="checkbox-input"
                />
                <span class="checkbox-custom"></span>
                Create default tasks from template
              </label>
            </div>
          </div>
        </form>
      </div>

      <div class="modal-footer">
        <button type="button" @click="$emit('cancel')" class="btn-cancel">Cancel</button>
        <button
          type="button"
          @click="handleSubmit"
          class="btn-create"
          :disabled="!isFormValid || isCreating"
        >
          <svg v-if="isCreating" width="16" height="16" class="spinner" viewBox="0 0 24 24">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
              fill="none"
              opacity="0.25"
            />
            <path fill="currentColor" d="M12 2v4a8 8 0 018 8h4a12 12 0 00-12-12z" opacity="0.75" />
          </svg>
          <svg
            v-else
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
          {{ isCreating ? 'Creating...' : 'Create Project' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProjectCreateModal',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['create', 'cancel'],
  data() {
    return {
      isCreating: false,
      showAcademicFields: false,
      formData: {
        template: 'blank',
        name: '',
        description: '',
        color: '#007bff',
        priority: 'medium',
        startDate: '',
        dueDate: '',
        subject: '',
        semester: '',
        instructor: '',
        gradeWeight: null,
        switchToProject: true,
        createDefaultTasks: true
      },
      errors: {},
      templates: [
        {
          id: 'blank',
          name: 'Blank Project',
          description: 'Start with an empty project'
        },
        {
          id: 'academic',
          name: 'Academic Project',
          description: 'Project with academic tasks and milestones'
        },
        {
          id: 'software',
          name: 'Software Development',
          description: 'Development project with coding phases'
        },
        {
          id: 'research',
          name: 'Research Project',
          description: 'Research project with methodology phases'
        }
      ]
    }
  },
  computed: {
    isFormValid() {
      return this.formData.name.trim().length > 0 && Object.keys(this.errors).length === 0
    }
  },
  watch: {
    isVisible(newVal) {
      if (newVal) {
        this.resetForm()
      }
    },
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
  methods: {
    handleOverlayClick() {
      this.$emit('cancel')
    },

    resetForm() {
      this.formData = {
        template: 'blank',
        name: '',
        description: '',
        color: '#007bff',
        priority: 'medium',
        startDate: '',
        dueDate: '',
        subject: '',
        semester: '',
        instructor: '',
        gradeWeight: null,
        switchToProject: true,
        createDefaultTasks: true
      }
      this.errors = {}
      this.showAcademicFields = false
      this.isCreating = false
    },

    resetCreatingState() {
      this.isCreating = false
    },

    validateName() {
      if (!this.formData.name.trim()) {
        this.$set(this.errors, 'name', 'Project name is required')
      } else if (this.formData.name.length > 100) {
        this.$set(this.errors, 'name', 'Project name must be less than 100 characters')
      } else {
        this.$delete(this.errors, 'name')
      }
    },

    validateDates() {
      if (this.formData.startDate && this.formData.dueDate) {
        const startDate = new Date(this.formData.startDate)
        const dueDate = new Date(this.formData.dueDate)

        if (dueDate <= startDate) {
          this.$set(this.errors, 'dueDate', 'Due date must be after start date')
        } else {
          this.$delete(this.errors, 'dueDate')
        }
      } else {
        this.$delete(this.errors, 'dueDate')
      }
    },

    async handleSubmit() {
      if (!this.isFormValid || this.isCreating) return

      this.isCreating = true

      try {
        // Clean up form data
        const projectData = {
          ...this.formData,
          name: this.formData.name.trim(),
          description: this.formData.description.trim(),
          gradeWeight: this.formData.gradeWeight || undefined
        }

        // Remove empty optional fields
        Object.keys(projectData).forEach(key => {
          if (projectData[key] === '' || projectData[key] === null) {
            delete projectData[key]
          }
        })

        this.$emit('create', projectData)
      } catch (error) {
        console.error('Error creating project:', error)
        this.isCreating = false
      }
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  background: white;
  border-radius: 8px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
}

.modal-title {
  margin: 0;
  color: #495057;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
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

.modal-body {
  padding: 2rem;
  max-height: calc(90vh - 140px);
  overflow-y: auto;
}

.form-section {
  margin-bottom: 2rem;
}

.form-section:last-child {
  margin-bottom: 0;
}

.section-title {
  margin: 0 0 1rem 0;
  color: #495057;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.remove-section-btn {
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.remove-section-btn:hover {
  background: #f8d7da;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.template-card {
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.template-card:hover {
  border-color: #007bff;
  background: #f8f9ff;
}

.template-card.selected {
  border-color: #007bff;
  background: #e7f1ff;
}

.template-icon {
  margin-bottom: 0.5rem;
  color: #6c757d;
}

.template-card.selected .template-icon {
  color: #007bff;
}

.template-name {
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #495057;
}

.template-description {
  margin: 0;
  font-size: 0.75rem;
  color: #6c757d;
  line-height: 1.3;
}

.form-group {
  margin-bottom: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-label {
  display: block;
  font-weight: 500;
  color: #495057;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.form-label.required::after {
  content: '*';
  color: #dc3545;
  margin-left: 0.25rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.form-input.error {
  border-color: #dc3545;
}

.textarea {
  resize: vertical;
  min-height: 80px;
}

.color-picker {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.color-input {
  width: 50px;
  height: 38px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  cursor: pointer;
}

.color-preview {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px #ced4da;
}

.error-message {
  display: block;
  color: #dc3545;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.checkbox-group {
  margin-bottom: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: #495057;
}

.checkbox-input {
  display: none;
}

.checkbox-custom {
  width: 18px;
  height: 18px;
  border: 2px solid #ced4da;
  border-radius: 3px;
  position: relative;
  transition: all 0.2s;
}

.checkbox-input:checked + .checkbox-custom {
  background: #007bff;
  border-color: #007bff;
}

.checkbox-input:checked + .checkbox-custom::after {
  content: '';
  position: absolute;
  top: 1px;
  left: 5px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.add-section-btn {
  background: none;
  border: 1px dashed #007bff;
  color: #007bff;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  width: 100%;
  justify-content: center;
}

.add-section-btn:hover {
  background: #f8f9ff;
  border-style: solid;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
}

.btn-cancel,
.btn-create {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-cancel {
  background: #6c757d;
  color: white;
}

.btn-cancel:hover {
  background: #545b62;
}

.btn-create {
  background: #007bff;
  color: white;
}

.btn-create:hover:not(:disabled) {
  background: #0056b3;
}

.btn-create:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .modal-container {
    margin: 0.5rem;
    max-width: calc(100vw - 1rem);
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .template-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .modal-footer {
    flex-direction: column;
  }
}
</style>
