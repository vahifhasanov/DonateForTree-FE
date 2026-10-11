import { defineConfig } from 'cypress'
export default defineConfig({
  e2e: {
    baseUrl: 'http://127.0.0.1:5174',
    setupNodeEvents(on) {
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.name === 'electron') {
          launchOptions.preferences.width = 2000
          launchOptions.preferences.height = 1200
        } else {
          launchOptions.args.push(
            '--window-size=2000,1200',
            '--force-device-scale-factor=1',
          )
        }
        return launchOptions
      })
    },
  },
  viewportWidth: 1920,
  viewportHeight: 1080,
  video: false,
})
