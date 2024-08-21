import { local } from './WebStorage';

const IS_DEVELOPMENT = 'IS_DEVELOPMENT';

/**
 * Checks if the current environment is development.
 */
const isDevelopment = () => local.boolean(IS_DEVELOPMENT);

export const storage = {
  local: {
    isDevelopment
  },
};
