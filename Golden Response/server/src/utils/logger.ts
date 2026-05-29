const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function timestamp(): string {
  return new Date().toISOString();
}

export const logger = {
  info(message: string, data?: unknown): void {
    console.log(
      `${colors.gray}[${timestamp()}]${colors.reset} ${colors.green}INFO${colors.reset}  ${message}`,
      data !== undefined ? data : ''
    );
  },

  warn(message: string, data?: unknown): void {
    console.warn(
      `${colors.gray}[${timestamp()}]${colors.reset} ${colors.yellow}WARN${colors.reset}  ${message}`,
      data !== undefined ? data : ''
    );
  },

  error(message: string, data?: unknown): void {
    console.error(
      `${colors.gray}[${timestamp()}]${colors.reset} ${colors.red}ERROR${colors.reset} ${message}`,
      data !== undefined ? data : ''
    );
  },

  debug(message: string, data?: unknown): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(
        `${colors.gray}[${timestamp()}]${colors.reset} ${colors.cyan}DEBUG${colors.reset} ${message}`,
        data !== undefined ? data : ''
      );
    }
  },
};
