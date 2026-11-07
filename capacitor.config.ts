export interface CapacitorConfig {
  appId: string;
  appName: string;
  webDir: string;
  server?: {
    androidScheme?: string;
  };
}

const config: CapacitorConfig = {
  appId: 'com.seiranacademy.schoolchronicles',
  appName: 'The School Chronicles',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
