// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',  
  devtools: { enabled: true },

  server: {
    port: 3000,
    host: '0.0.0.0',
  },

  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    '@vueuse/nuxt',
  ],

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    dbPath: process.env.DB_PATH || './data/life-recorder.db',
    uploadDir: process.env.UPLOAD_DIR || './uploads',
  },

  nitro: {
    externals: {
      inline: ['drizzle-orm'],
    },
    esbuild: {
      options: {
        target: 'esnext',
      },
    },
  },
})
