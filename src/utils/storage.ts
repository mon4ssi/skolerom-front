import { local } from './WebStorage';

const ENV = process.env.REACT_APP_ENV as string;
const IS_DEVELOPMENT = 'IS_DEVELOPMENT';

/**
 * Checks if the current environment is local.
 */
const isLocal = () => ENV === 'local';

/**
 * Checks if the current environment is development.
 */
const isDevelopment = () => isLocal() || local.boolean(IS_DEVELOPMENT);

export const storage = {
  local: {
    isDevelopment
  },
};
