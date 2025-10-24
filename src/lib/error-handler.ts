import { NextResponse } from 'next/server';
import { AppError } from './errors';
import mongoose from 'mongoose';

export function handleError(error: unknown) {
  console.error('API Error:', error);

  // Handle custom AppError
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: error.statusCode }
    );
  }

  // Handle Mongoose validation errors
  if (error instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(error.errors).map((err) => err.message);
    return NextResponse.json(
      {
        success: false,
        error: 'Validation error',
        details: messages,
      },
      { status: 400 }
    );
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (error instanceof mongoose.Error.CastError) {
    return NextResponse.json(
      {
        success: false,
        error: `Invalid ${error.path}: ${error.value}`,
      },
      { status: 400 }
    );
  }

  // Handle Mongoose duplicate key error
  if (error instanceof Error && 'code' in error && error.code === 11000) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const duplicateError = error as any;
    const field = Object.keys(duplicateError.keyValue)[0];
    return NextResponse.json(
      {
        success: false,
        error: `Duplicate value for field: ${field}`,
      },
      { status: 409 }
    );
  }

  // Handle generic errors
  if (error instanceof Error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal Server Error',
      },
      { status: 500 }
    );
  }

  // Fallback for unknown errors
  return NextResponse.json(
    {
      success: false,
      error: 'An unexpected error occurred',
    },
    { status: 500 }
  );
}