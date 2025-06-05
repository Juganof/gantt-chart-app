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
            <circle cx="12" cy="12" r="3"></circle>
            <path
              d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
            ></path>
          </svg>
          Project Settings
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
        <form @submit.prevent="handleSave">
          <!-- View and Display Settings -->
          <div class="settings-section">
            <h4 class="section-title">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="9" x2="15" y2="15"></line>
                <line x1="15" y1="9" x2="9" y2="15"></line>
              </svg>
              View & Display
            </h4>

            <div class="setting-group">
              <label for="defaultView" class="setting-label">Default View</label>
              <select id="defaultView" v-model="localSettings.defaultView" class="setting-input">
                <option value="week">Week View</option>
                <option value="month">Month View</option>
                <option value="list">List View</option>
                <option value="calendar">Calendar View</option>
              </select>
              <p class="setting-help">Choose the default view when opening this project</p>
            </div>

            <div class="setting-group">
              <label class="setting-label checkbox-label">
                <input
                  type="checkbox"
                  v-model="localSettings.showWeekends"
                  class="setting-checkbox"
                />
                <span class="checkbox-custom"></span>
                Show Weekends
              </label>
              <p class="setting-help">Display Saturday and Sunday in calendar views</p>
            </div>

            <div class="setting-group">
              <label class="setting-label checkbox-label">
                <input
                  type="checkbox"
                  v-model="localSettings.showDependencyArrows"
                  class="setting-checkbox"
                />
                <span class="checkbox-custom"></span>
                Show Dependency Arrows
              </label>
              <p class="setting-help">Display visual connections between dependent tasks</p>
            </div>

            <div class="setting-group">
              <label class="setting-label checkbox-label">
                <input
                  type="checkbox"
                  v-model="localSettings.overdueHighlight"
                  class="setting-checkbox"
                />
                <span class="checkbox-custom"></span>
                Highlight Overdue Tasks
              </label>
              <p class="setting-help">Visually emphasize tasks past their due date</p>
            </div>
          </div>

          <!-- Working Hours Settings -->
          <div class="settings-section">
            <h4 class="section-title">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12,6 12,12 16,14"></polyline>
              </svg>
              Working Hours
            </h4>

            <div class="time-range-group">
              <div class="setting-group">
                <label for="workingStart" class="setting-label">Start Time</label>
                <input
                  id="workingStart"
                  type="time"
                  v-model="localSettings.workingHours.start"
                  class="setting-input time-input"
                />
              </div>

              <div class="setting-group">
                <label for="workingEnd" class="setting-label">End Time</label>
                <input
                  id="workingEnd"
                  type="time"
                  v-model="localSettings.workingHours.end"
                  class="setting-input time-input"
                />
              </div>
            </div>

            <p class="setting-help">Define your typical working hours for time calculations</p>
          </div>

          <!-- Notifications and Reminders -->
          <div class="settings-section">
            <h4 class="section-title">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              Notifications & Reminders
            </h4>

            <div class="setting-group">
              <label class="setting-label checkbox-label">
                <input
                  type="checkbox"
                  v-model="localSettings.dueDateReminders"
                  class="setting-checkbox"
                />
                <span class="checkbox-custom"></span>
                Due Date Reminders
              </label>
              <p class="setting-help">Get notified before tasks are due</p>
            </div>

            <div class="setting-group">
              <label for="timeFormat" class="setting-label">Time Format</label>
              <select id="timeFormat" v-model="localSettings.timeFormat" class="setting-input">
                <option value="12h">12-hour (AM/PM)</option>
                <option value="24h">24-hour</option>
              </select>
              <p class="setting-help">Choose how times are displayed</p>
            </div>
          </div>

          <!-- Data and Export Settings -->
          <div class="settings-section">
            <h4 class="section-title">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14,2 14,8 20,8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10,9 9,9 8,9"></polyline>
              </svg>
              Data & Export
            </h4>

            <div class="setting-group">
              <label class="setting-label checkbox-label">
                <input type="checkbox" v-model="localSettings.autoSave" class="setting-checkbox" />
                <span class="checkbox-custom"></span>
                Auto-save Changes
              </label>
              <p class="setting-help">Automatically save changes as you work</p>
            </div>

            <div class="setting-group">
              <label for="exportFormat" class="setting-label">Default Export Format</label>
              <select id="exportFormat" v-model="localSettings.exportFormat" class="setting-input">
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
                <option value="pdf">PDF</option>
              </select>
              <p class="setting-help">Default format for project exports</p>
            </div>

            <div class="setting-group">
              <label class="setting-label checkbox-label">
                <input
                  type="checkbox"
                  v-model="localSettings.includeCompletedTasks"
                  class="setting-checkbox"
                />
                <span class="checkbox-custom"></span>
                Include Completed Tasks in Exports
              </label>
              <p class="setting-help">Whether to include completed tasks when exporting</p>
            </div>
          </div>

          <!-- Advanced Settings -->
          <div class="settings-section">
            <h4 class="section-title">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
              Advanced
            </h4>

            <div class="setting-group">
              <label class="setting-label checkbox-label">
                <input
                  type="checkbox"
                  v-model="localSettings.enableDragDrop"
                  class="setting-checkbox"
                />
                <span class="checkbox-custom"></span>
                Enable Drag & Drop
              </label>
              <p class="setting-help">Allow dragging tasks to change dates and order</p>
            </div>
          </div>

          <!-- Reset Options -->
          <div class="settings-section danger-section">
            <h4 class="section-title danger">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                ></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              Reset Options
            </h4>

            <div class="danger-actions">
              <button type="button" @click="resetToDefaults" class="danger-btn">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                </svg>
                Reset to Defaults
              </button>
              <p class="danger-help">Reset all settings to their default values</p>
            </div>
          </div>
        </form>
      </div>

      <div class="modal-footer">
        <button type="button" @click="$emit('cancel')" class="btn-cancel">Cancel</button>
        <button type="button" @click="handleSave" class="btn-save">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
          </svg>
          Save Settings
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProjectSettingsModal',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    project: {
      type: Object,
      required: true
    }
  },
  emits: ['save', 'cancel'],
  data() {
    return {
      localSettings: {
        defaultView: 'week',
        showWeekends: false,
        workingHours: {
          start: '09:00',
          end: '17:00'
        },
        autoSave: true,
        showDependencyArrows: true,
        enableDragDrop: true,
        dueDateReminders: true,
        overdueHighlight: true,
        exportFormat: 'json',
        includeCompletedTasks: true,
        timeFormat: '24h'
      }
    }
  },
  watch: {
    isVisible(newVal) {
      if (newVal) {
        this.loadSettings()
      }
    },
    project: {
      handler() {
        if (this.isVisible) {
          this.loadSettings()
        }
      },
      immediate: true
    }
  },
  methods: {
    handleOverlayClick() {
      this.$emit('cancel')
    },
    loadSettings() {
      if (this.project && this.project.settings) {
        this.localSettings = {
          ...this.localSettings,
          ...this.project.settings
        }
      }
    },
    handleSave() {
      // Validate working hours
      if (this.localSettings.workingHours.start >= this.localSettings.workingHours.end) {
        alert('Start time must be before end time')
        return
      }

      const updatedProject = {
        ...this.project,
        settings: {
          ...this.localSettings
        },
        updated: new Date().toISOString()
      }

      this.$emit('save', updatedProject)
    },
    resetToDefaults() {
      if (confirm('Are you sure you want to reset all settings to their default values?')) {
        this.localSettings = {
          defaultView: 'week',
          showWeekends: false,
          workingHours: {
            start: '09:00',
            end: '17:00'
          },
          autoSave: true,
          showDependencyArrows: true,
          enableDragDrop: true,
          dueDateReminders: true,
          overdueHighlight: true,
          exportFormat: 'json',
          includeCompletedTasks: true,
          timeFormat: '24h'
        }
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

.settings-section {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.settings-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.section-title {
  margin: 0 0 1.5rem 0;
  color: #495057;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #007bff;
}

.section-title.danger {
  color: #dc3545;
  border-bottom-color: #dc3545;
}

.setting-group {
  margin-bottom: 1.5rem;
}

.setting-group:last-child {
  margin-bottom: 0;
}

.setting-label {
  display: block;
  font-weight: 500;
  color: #495057;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.setting-checkbox {
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

.setting-checkbox:checked + .checkbox-custom {
  background: #007bff;
  border-color: #007bff;
}

.setting-checkbox:checked + .checkbox-custom::after {
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

.setting-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.setting-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.time-input {
  max-width: 150px;
}

.time-range-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.setting-help {
  margin: 0.5rem 0 0 0;
  font-size: 0.75rem;
  color: #6c757d;
  line-height: 1.4;
}

.danger-section {
  background: #fff5f5;
  padding: 1.5rem;
  border-radius: 6px;
  border: 1px solid #fecaca;
}

.danger-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.danger-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s;
  align-self: flex-start;
}

.danger-btn:hover {
  background: #c82333;
}

.danger-help {
  margin: 0;
  font-size: 0.75rem;
  color: #721c24;
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
.btn-save {
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

.btn-save {
  background: #007bff;
  color: white;
}

.btn-save:hover {
  background: #0056b3;
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

  .time-range-group {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .modal-footer {
    flex-direction: column;
  }

  .danger-actions {
    align-items: stretch;
  }

  .danger-btn {
    align-self: stretch;
    justify-content: center;
  }
}
</style>
