import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.biblecrown.app',
  appName: 'Bible Crown',
  webDir: 'out',
  server: {
    url: 'http://localhost:3000',
    cleartext: true
  }
};

export default config;
