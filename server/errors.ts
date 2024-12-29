// This file exists to maintain backward compatibility with existing imports
// Export error classes from their proper locations
export { ServerError } from './errors/types';
export { 
  EnvironmentConfigError,
  PortConfigError,
  DatabaseConfigError 
} from './errors/environment';