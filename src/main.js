import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './styles/global.css'

const app = createApp(App)
app.use(store)
app.use(router)

// Make store available to router for navigation guards
router.app = app

app.mount('#app')

// Initialize Stagewise toolbar in development mode only
if (import.meta.env.DEV) {
  console.log('Development mode detected, loading Stagewise toolbar...')
  import('@stagewise/toolbar-vue')
    .then(({ StagewiseToolbar }) => {
      console.log('Stagewise toolbar module loaded successfully')
      console.log('StagewiseToolbar:', StagewiseToolbar)
      
      // Configuration for stagewise toolbar
      const stagewiseConfig = {
        plugins: []
      }

      // Create a separate DOM element for the toolbar
      const toolbarElement = document.createElement('div')
      toolbarElement.id = 'stagewise-toolbar'
      document.body.appendChild(toolbarElement)
      console.log('Toolbar element created and added to DOM')

      // Create a separate Vue app instance for the toolbar using Vue's createApp
      const toolbarApp = createApp(StagewiseToolbar, {
        config: stagewiseConfig
      })
      
      console.log('Toolbar app created:', toolbarApp)
      toolbarApp.mount('#stagewise-toolbar')
      console.log('Stagewise toolbar mounted successfully!')
    })
    .catch(error => {
      console.error('Failed to load Stagewise toolbar:', error)
    })
} else {
  console.log('Production mode - Stagewise toolbar not loaded')
}
