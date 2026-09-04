export const logger = {
  error: (message: string, err?: unknown, context?: Record<string, unknown>) =>
    console.error(message, err, context),
};
