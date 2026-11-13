export const logger = {
  info: (message: string, meta?: any) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [WORKER-INFO] ${message}`, meta !== undefined ? meta : '');
  },
  warn: (message: string, meta?: any) => {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] [WORKER-WARN] ${message}`, meta !== undefined ? meta : '');
  },
  error: (message: string, error?: any) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [WORKER-ERROR] ${message}`, error !== undefined ? error : '');
  },
};
