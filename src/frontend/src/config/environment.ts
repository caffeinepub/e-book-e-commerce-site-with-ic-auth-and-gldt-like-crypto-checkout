// Build-time environment configuration
// Reads VITE_APP_ENV and normalizes to 'Draft' or 'Live'

const rawEnv = import.meta.env.VITE_APP_ENV;
const mode = import.meta.env.MODE;

export type Environment = 'Draft' | 'Live';

export function getEnvironment(): Environment {
  // If explicitly set via VITE_APP_ENV, use that
  if (rawEnv) {
    const normalized = rawEnv.toLowerCase().trim();
    
    if (normalized === 'live' || normalized === 'production' || normalized === 'prod') {
      return 'Live';
    }
    
    if (normalized === 'draft' || normalized === 'dev' || normalized === 'development') {
      return 'Draft';
    }
  }
  
  // Fall back to Vite's MODE: production builds should be Live
  if (mode === 'production') {
    return 'Live';
  }
  
  // Safe default for development and unset cases
  return 'Draft';
}

export const APP_ENVIRONMENT = getEnvironment();
