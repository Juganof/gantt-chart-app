// Vue.js type shims for TypeScript support

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $store: import('vuex').Store<import('./index').RootState>
  }
}

// Global Vue properties
declare global {
  interface Window {
    // Add any global window properties here
    __VUE_DEVTOOLS_GLOBAL_HOOK__?: any
  }
}

// Module declarations for assets
declare module '*.svg' {
  const content: string
  export default content
}

declare module '*.png' {
  const content: string
  export default content
}

declare module '*.jpg' {
  const content: string
  export default content
}

declare module '*.jpeg' {
  const content: string
  export default content
}

declare module '*.gif' {
  const content: string
  export default content
}

declare module '*.webp' {
  const content: string
  export default content
}

declare module '*.css' {
  const content: Record<string, string>
  export default content
}

declare module '*.scss' {
  const content: Record<string, string>
  export default content
}

declare module '*.sass' {
  const content: Record<string, string>
  export default content
}

declare module '*.less' {
  const content: Record<string, string>
  export default content
}

declare module '*.styl' {
  const content: Record<string, string>
  export default content
}

declare module '*.stylus' {
  const content: Record<string, string>
  export default content
}

export {}
