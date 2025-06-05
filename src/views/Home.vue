<template>
  <div class="home">
    <!-- Enhanced Hero Section with better performance and accessibility -->
    <section class="hero-section" role="banner" aria-labelledby="hero-title">
      <div class="hero-content">
        <h1 id="hero-title" class="hero-title">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
            role="img"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="9" y1="9" x2="15" y2="9" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
          SchoolGantt
        </h1>
        <p class="hero-subtitle">
          Organize your academic projects with powerful Gantt chart visualization
        </p>
      </div>
    </section>

    <!-- Current Project Section -->
    <div class="current-project-section" v-if="currentProject">
      <div class="section-header">
        <h2>Current Project</h2>
        <router-link :to="{ name: 'Gantt' }" class="btn btn-primary">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="9" y1="9" x2="15" y2="9" />
            <line x1="9" y1="15" x2="15" y2="15" />
            <line x1="9" y1="12" x2="12" y2="12" />
          </svg>
          Open Gantt Chart
        </router-link>
      </div>

      <div class="project-card current">
        <div class="project-header">
          <div class="project-info">
            <h3>{{ currentProject.name }}</h3>
            <p v-if="currentProject.description">{{ currentProject.description }}</p>
          </div>
          <div class="project-color" :style="{ backgroundColor: currentProject.color }"></div>
        </div>

        <div class="project-stats">
          <div class="stat">
            <span class="stat-label">Tasks</span>
            <span class="stat-value">{{ projectStats.totalTasks }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Completed</span>
            <span class="stat-value">{{ projectStats.completedTasks }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Progress</span>
            <span class="stat-value">{{ projectStats.progress }}%</span>
          </div>
          <div class="stat">
            <span class="stat-label">Priority</span>
            <span class="stat-value" :class="`priority-${currentProject.priority}`">
              {{ currentProject.priority }}
            </span>
          </div>
        </div>

        <div class="project-dates" v-if="currentProject.startDate || currentProject.dueDate">
          <div v-if="currentProject.startDate" class="date-info">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12,6 12,12 16,14" />
            </svg>
            Started: {{ formatDate(currentProject.startDate) }}
          </div>
          <div v-if="currentProject.dueDate" class="date-info">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Due: {{ formatDate(currentProject.dueDate) }}
          </div>
        </div>

        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: projectStats.progress + '%' }"></div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions-section">
      <h2>Quick Actions</h2>
      <div class="actions-grid">
        <div class="action-card" @click="$emit('create-project')">
          <div class="action-icon">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          </div>
          <h3>Create New Project</h3>
          <p>Start a new project with custom templates and settings</p>
        </div>

        <router-link :to="{ name: 'Projects' }" class="action-card">
          <div class="action-icon">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <folder fill="none" />
              <path
                d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
              />
            </svg>
          </div>
          <h3>Manage Projects</h3>
          <p>View, edit, and organize all your projects</p>
        </router-link>

        <div class="action-card" @click="goToGantt" v-if="currentProject">
          <div class="action-icon">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="9" y1="9" x2="15" y2="9" />
              <line x1="9" y1="15" x2="15" y2="15" />
              <line x1="9" y1="12" x2="12" y2="12" />
            </svg>
          </div>
          <h3>Continue Working</h3>
          <p>Open the Gantt chart for your current project</p>
        </div>

        <div class="action-card" @click="showGetStarted = true" v-else>
          <div class="action-icon">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <h3>Get Started</h3>
          <p>Learn how to use SchoolGantt effectively</p>
        </div>
      </div>
    </div>

    <!-- Recent Projects -->
    <div class="recent-projects-section" v-if="recentProjects.length > 0">
      <h2>Recent Projects</h2>
      <div class="projects-grid">
        <div
          v-for="project in recentProjects"
          :key="project.id"
          class="project-card"
          @click="switchToProject(project.id)"
        >
          <div class="project-header">
            <div class="project-info">
              <h3>{{ project.name }}</h3>
              <p v-if="project.description">{{ project.description }}</p>
            </div>
            <div class="project-color" :style="{ backgroundColor: project.color }"></div>
          </div>

          <div class="project-meta">
            <span class="project-priority" :class="`priority-${project.priority}`">
              {{ project.priority }}
            </span>
            <span v-if="project.dueDate" class="project-due">
              Due {{ formatDate(project.dueDate) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Getting Started Guide -->
    <div v-if="showGetStarted" class="getting-started-overlay" @click="showGetStarted = false">
      <div class="getting-started-modal" @click.stop>
        <div class="modal-header">
          <h3>Getting Started with SchoolGantt</h3>
          <button @click="showGetStarted = false" class="close-btn">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="step">
            <div class="step-number">1</div>
            <div class="step-content">
              <h4>Create Your First Project</h4>
              <p>Start by creating a new project. Choose from templates or start blank.</p>
            </div>
          </div>
          <div class="step">
            <div class="step-number">2</div>
            <div class="step-content">
              <h4>Add Tasks</h4>
              <p>Break down your project into manageable tasks with deadlines and dependencies.</p>
            </div>
          </div>
          <div class="step">
            <div class="step-number">3</div>
            <div class="step-content">
              <h4>Track Progress</h4>
              <p>Use the Gantt chart to visualize timelines and track your project progress.</p>
            </div>
          </div>
          <div class="step">
            <div class="step-number">4</div>
            <div class="step-content">
              <h4>Stay Organized</h4>
              <p>Manage multiple projects and switch between them easily.</p>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button
            @click="
              showGetStarted = false;
              $emit('create-project')
            "
            class="btn btn-primary"
          >
            Create Your First Project
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'

export default {
  name: 'Home',
  emits: ['create-project'],
  data() {
    return {
      showGetStarted: false
    }
  },
  computed: {
    ...mapState(['currentProject', 'projects', 'tasks']),

    projectStats() {
      if (!this.currentProject || !this.tasks) {
        return { totalTasks: 0, completedTasks: 0, progress: 0 }
      }

      const totalTasks = this.tasks.length
      const completedTasks = this.tasks.filter(task => task.status === 'completed').length
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

      return { totalTasks, completedTasks, progress }
    },

    recentProjects() {
      return this.projects.filter(project => project.id !== this.currentProject?.id).slice(0, 4)
    }
  },
  mounted() {
    // Check if user was redirected here from a project-specific route
    const redirectPath = this.$route.query.redirect
    if (redirectPath) {
      // Show a message about needing to select a project
      this.$nextTick(() => {
        // If there are projects available but no current project, show project selector
        if (this.projects.length > 0 && !this.currentProject) {
          console.log('User redirected from Gantt view - projects available but none selected')
          // Could show a notification or auto-redirect to projects page
        } else if (this.projects.length === 0) {
          console.log('User redirected from Gantt view - no projects available')
          // Show getting started guide
          this.showGetStarted = true
        } else if (this.currentProject) {
          // Project is available now, redirect back
          console.log('Project available, redirecting back to:', redirectPath)
          this.$router.push(redirectPath)
        }
      })
    }
  },
  watch: {
    // Watch for current project changes to handle auto-redirect
    currentProject: {
      handler(newProject) {
        const redirectPath = this.$route.query.redirect
        if (newProject && redirectPath) {
          // Project became available, redirect back
          console.log('Project loaded, redirecting back to:', redirectPath)
          // Remove the redirect query parameter and navigate
          this.$router.replace(redirectPath)
        }
      }
    }
  },
  methods: {
    ...mapActions(['switchToProject']),

    goToGantt() {
      this.$router.push({ name: 'Gantt' })
    },

    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    }
  }
}
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.hero-section {
  text-align: center;
  padding: 3rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  margin: -2rem -1rem 3rem -1rem;
  border-radius: 0 0 20px 20px;
  color: white;
}

.hero-content {
  max-width: 600px;
  margin: 0 auto;
  padding: 0 1rem;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.hero-subtitle {
  font-size: 1.125rem;
  opacity: 0.9;
  line-height: 1.6;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  font-size: 1.5rem;
  color: #495057;
  margin: 0;
}

.current-project-section,
.quick-actions-section,
.recent-projects-section {
  margin-bottom: 3rem;
}

.project-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
  transition: all 0.2s;
  cursor: pointer;
}

.project-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.project-card.current {
  border-color: #007bff;
  box-shadow: 0 4px 20px rgba(0, 123, 255, 0.15);
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.project-info h3 {
  margin: 0 0 0.25rem 0;
  color: #495057;
  font-size: 1.25rem;
}

.project-info p {
  margin: 0;
  color: #6c757d;
  font-size: 0.875rem;
  line-height: 1.4;
}

.project-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.project-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.75rem;
  color: #6c757d;
  margin-bottom: 0.25rem;
}

.stat-value {
  display: block;
  font-size: 1.125rem;
  font-weight: 600;
  color: #495057;
}

.priority-high {
  color: #dc3545;
}
.priority-medium {
  color: #ffc107;
}
.priority-low {
  color: #28a745;
}
.priority-critical {
  color: #6f42c1;
}

.project-dates {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: #6c757d;
}

.date-info {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.progress-bar {
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007bff, #0056b3);
  transition: width 0.3s ease;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.action-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
  transition: all 0.2s;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  text-decoration: none;
  color: inherit;
}

.action-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem auto;
  color: white;
}

.action-card h3 {
  margin: 0 0 0.5rem 0;
  color: #495057;
  font-size: 1.125rem;
}

.action-card p {
  margin: 0;
  color: #6c757d;
  font-size: 0.875rem;
  line-height: 1.4;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.project-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.project-priority {
  font-weight: 500;
  text-transform: capitalize;
}

.project-due {
  color: #6c757d;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
  text-decoration: none;
  color: white;
}

/* Getting Started Modal */
.getting-started-overlay {
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

.getting-started-modal {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
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
}

.close-btn:hover {
  background: #f8f9fa;
}

.modal-body {
  padding: 2rem;
}

.step {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.step:last-child {
  margin-bottom: 0;
}

.step-number {
  width: 32px;
  height: 32px;
  background: #007bff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.step-content h4 {
  margin: 0 0 0.5rem 0;
  color: #495057;
}

.step-content p {
  margin: 0;
  color: #6c757d;
  font-size: 0.875rem;
  line-height: 1.4;
}

.modal-footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid #e9ecef;
  text-align: center;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }

  .actions-grid,
  .projects-grid {
    grid-template-columns: 1fr;
  }

  .project-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .project-dates {
    flex-direction: column;
    gap: 0.5rem;
  }

  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
}
</style>
