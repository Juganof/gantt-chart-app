<template>
  <div class="data-manager">
    <div class="data-manager-header">
      <h3>Project Data Management</h3>
      <p>Export your project for backup or import an existing project</p>
    </div>

    <div class="data-manager-content">
      <!-- Export Section -->
      <div class="section export-section">
        <div class="section-header">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7,10 12,15 17,10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          <h4>Export Project</h4>
        </div>
        <p class="section-description">
          Download your project data as a JSON file for backup or sharing
        </p>
        <div class="export-controls">
          <div class="export-info">
            <div class="info-item">
              <span class="info-label">Tasks:</span>
              <span class="info-value">{{ taskCount }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Project:</span>
              <span class="info-value">{{ projectName }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Last Updated:</span>
              <span class="info-value">{{ lastUpdated }}</span>
            </div>
          </div>
          <button @click="exportProject" class="btn btn-export" :disabled="taskCount === 0">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7,10 12,15 17,10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Export Project
          </button>
        </div>
      </div>

      <!-- Import Section -->
      <div class="section import-section">
        <div class="section-header">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17,8 12,3 7,8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          <h4>Import Project</h4>
        </div>
        <p class="section-description">
          Load a previously exported project file. This will replace your current project.
        </p>

        <div class="import-controls">
          <div class="file-input-wrapper">
            <input
              ref="fileInput"
              type="file"
              accept=".json"
              @change="handleFileSelect"
              class="file-input"
              id="project-file"
            />
            <label for="project-file" class="file-label">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17,8 12,3 7,8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              {{ selectedFile ? selectedFile.name : 'Choose Project File' }}
            </label>
          </div>

          <button
            @click="importProject"
            :disabled="!selectedFile || isImporting"
            class="btn btn-import"
          >
            <svg
              v-if="isImporting"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              class="spinner"
            >
              <circle cx="12" cy="12" r="3"></circle>
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
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17,8 12,3 7,8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            {{ isImporting ? 'Importing...' : 'Import Project' }}
          </button>
        </div>

        <!-- Import Warning -->
        <div v-if="selectedFile" class="import-warning">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"
            ></path>
            <path d="M12 9v4"></path>
            <path d="m12 17 .01 0"></path>
          </svg>
          <span>Warning: Importing will replace all current tasks and project data.</span>
        </div>
      </div>

      <!-- Success/Error Messages -->
      <div v-if="message" :class="['message', messageType]">
        <svg
          v-if="messageType === 'success'"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22,4 12,14.01 9,11.01"></polyline>
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
          <path d="m15 9-6 6"></path>
          <path d="m9 9 6 6"></path>
        </svg>
        <span>{{ message }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'DataManager',
  data() {
    return {
      selectedFile: null,
      isImporting: false,
      message: '',
      messageType: 'success'
    }
  },
  computed: {
    ...mapState(['tasks', 'currentProject']),
    taskCount() {
      return this.tasks.length
    },
    projectName() {
      return this.currentProject.name || 'Untitled Project'
    },
    lastUpdated() {
      if (this.tasks.length === 0) return 'Never'

      const latestUpdate = Math.max(
        ...this.tasks.map(task => new Date(task.updated || task.created))
      )
      return new Date(latestUpdate).toLocaleDateString()
    }
  },
  methods: {
    async exportProject() {
      try {
        await this.$store.dispatch('exportProjectAsFile')
        this.showMessage('Project exported successfully!', 'success')
      } catch (error) {
        console.error('Export error:', error)
        this.showMessage('Failed to export project', 'error')
      }
    },

    handleFileSelect(event) {
      const file = event.target.files[0]
      if (file) {
        if (file.type === 'application/json' || file.name.endsWith('.json')) {
          this.selectedFile = file
          this.clearMessage()
        } else {
          this.showMessage('Please select a valid JSON file', 'error')
          event.target.value = ''
        }
      }
    },

    async importProject() {
      if (!this.selectedFile) return

      // Confirm before importing
      if (
        !confirm(
          'Are you sure you want to import this project? This will replace all current data.'
        )
      ) {
        return
      }

      this.isImporting = true
      this.clearMessage()

      try {
        const result = await this.$store.dispatch('importProjectFromFile', this.selectedFile)

        if (result.success) {
          this.showMessage(result.message, 'success')
          this.selectedFile = null
          this.$refs.fileInput.value = ''
          this.$emit('import-success')
        } else {
          this.showMessage(result.message, 'error')
        }
      } catch (error) {
        console.error('Import error:', error)
        this.showMessage(error.message || 'Failed to import project', 'error')
      } finally {
        this.isImporting = false
      }
    },

    showMessage(text, type = 'success') {
      this.message = text
      this.messageType = type

      // Auto-clear success messages
      if (type === 'success') {
        setTimeout(() => {
          this.clearMessage()
        }, 3000)
      }
    },

    clearMessage() {
      this.message = ''
    }
  }
}
</script>

<style scoped>
.data-manager {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.data-manager-header {
  padding: 1.5rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.data-manager-header h3 {
  margin: 0 0 0.5rem 0;
  color: #495057;
  font-size: 1.25rem;
}

.data-manager-header p {
  margin: 0;
  color: #6c757d;
  font-size: 0.875rem;
}

.data-manager-content {
  padding: 1.5rem;
}

.section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  border: 1px solid #e9ecef;
  border-radius: 6px;
}

.section:last-child {
  margin-bottom: 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.section-header h4 {
  margin: 0;
  color: #495057;
  font-size: 1.1rem;
}

.section-header svg {
  color: #007bff;
}

.section-description {
  margin: 0 0 1.5rem 0;
  color: #6c757d;
  font-size: 0.875rem;
  line-height: 1.4;
}

/* Export Section */
.export-section {
  border-left: 4px solid #28a745;
}

.export-controls {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1rem;
}

.export-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item {
  display: flex;
  gap: 0.5rem;
}

.info-label {
  font-weight: 500;
  color: #495057;
  min-width: 100px;
}

.info-value {
  color: #6c757d;
}

/* Import Section */
.import-section {
  border-left: 4px solid #007bff;
}

.import-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.file-input-wrapper {
  flex: 1;
}

.file-input {
  display: none;
}

.file-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #f8f9fa;
  border: 2px dashed #ced4da;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
  color: #495057;
}

.file-label:hover {
  background: #e9ecef;
  border-color: #007bff;
}

.import-warning {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.75rem;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 4px;
  color: #856404;
  font-size: 0.875rem;
}

/* Buttons */
.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-export {
  background: #28a745;
  color: white;
}

.btn-export:hover:not(:disabled) {
  background: #218838;
}

.btn-import {
  background: #007bff;
  color: white;
}

.btn-import:hover:not(:disabled) {
  background: #0056b3;
}

/* Messages */
.message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  margin-top: 1rem;
  font-size: 0.875rem;
}

.message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

/* Spinner animation */
.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .export-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .import-controls {
    flex-direction: column;
  }

  .data-manager-content {
    padding: 1rem;
  }

  .section {
    padding: 1rem;
  }
}
</style>
