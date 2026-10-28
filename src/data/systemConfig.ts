export interface SystemConfig {
  hiddenModules: string[];
  updatedAt?: string;
  updatedBy?: string;
}

export const DEFAULT_SYSTEM_CONFIG: SystemConfig = {
  hiddenModules: [],
  updatedAt: new Date().toISOString(),
  updatedBy: 'admin'
};
