
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.ddbed5cfb5c3463882e2fdde25ff17ea',
  appName: 'BirdConnect',
  webDir: 'dist',
  server: {
    url: 'https://ddbed5cf-b5c3-4638-82e2-fdde25ff17ea.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#FFFFFF",
      showSpinner: true,
      androidSpinnerStyle: "large",
      spinnerColor: "#999999"
    }
  }
};

export default config;
