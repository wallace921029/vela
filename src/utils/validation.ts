import type { ZodError } from 'zod';

export const getFirstValidationError = (error: ZodError, fallback: string) =>
  error.issues[0]?.message || fallback;
