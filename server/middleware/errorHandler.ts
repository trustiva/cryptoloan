import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  error: AppError | ZodError | Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error for monitoring
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}:`, error);

  // Zod validation errors
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid input data',
      details: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    });
  }

  // Operational errors (known errors)
  if ('isOperational' in error && error.isOperational) {
    return res.status(error.statusCode || 500).json({
      error: 'Application Error',
      message: error.message
    });
  }

  // Database errors
  if (error.message.includes('relation') && error.message.includes('does not exist')) {
    return res.status(500).json({
      error: 'Database Error',
      message: 'Database table not found. Please ensure database is properly initialized.'
    });
  }

  // Authentication errors
  if (error.message.includes('Unauthorized') || error.message.includes('jwt')) {
    return res.status(401).json({
      error: 'Authentication Error',
      message: 'Authentication required or token invalid'
    });
  }

  // Rate limiting errors
  if (error.message.includes('Too many requests')) {
    return res.status(429).json({
      error: 'Rate Limit Exceeded',
      message: 'Too many requests. Please try again later.'
    });
  }

  // Default server error
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' 
      ? error.message 
      : 'Something went wrong. Please try again later.',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
};

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}