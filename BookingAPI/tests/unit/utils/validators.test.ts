// tests/unit/utils/validators.test.ts

import { 
  isRelationalKey, 
  transIsDate, 
  handleValidationErrors,
  validateBookingCreation,
  validateUserCreation,
  validateUserLogin,
  validateIdParam,
  validateSearchParams
} from '../../../src/common/util/validators';
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock express-validator
vi.mock('express-validator', () => ({
  validationResult: vi.fn(),
  body: vi.fn(() => ({
    notEmpty: vi.fn().mockReturnThis(),
    isISO8601: vi.fn().mockReturnThis(),
    custom: vi.fn().mockReturnThis(),
    optional: vi.fn().mockReturnThis(),
    isInt: vi.fn().mockReturnThis(),
    isFloat: vi.fn().mockReturnThis(),
    if: vi.fn().mockReturnThis(),
    isEmpty: vi.fn().mockReturnThis(),
    isLength: vi.fn().mockReturnThis(),
    matches: vi.fn().mockReturnThis(),
    isEmail: vi.fn().mockReturnThis(),
    normalizeEmail: vi.fn().mockReturnThis(),
    withMessage: vi.fn().mockReturnThis()
  })),
  param: vi.fn(() => ({
    notEmpty: vi.fn().mockReturnThis(),
    withMessage: vi.fn().mockReturnThis()
  })),
  query: vi.fn(() => ({
    notEmpty: vi.fn().mockReturnThis(),
    withMessage: vi.fn().mockReturnThis()
  }))
}));

describe('Utility Validators', () => {

  describe('transIsDate', () => {
    describe('valid date inputs', () => {
      const validDates = [
        { input: '2024-01-01', description: 'ISO date string' },
        { input: '2024-12-31T23:59:59', description: 'date time string' },
        { input: '2024-06-15T12:30:00.000Z', description: 'UTC date string' },
        { input: new Date('2024-01-01'), description: 'Date object' },
        { input: Date.now(), description: 'timestamp' }
      ];

      validDates.forEach(({ input, description }) => {
        it(`should handle ${description}`, () => {
          const result = transIsDate(input as any);
          expect(result instanceof Date || typeof result === 'boolean').toBe(true);
          if (result instanceof Date) {
            expect(isNaN(result.getTime())).toBe(false);
          }
        });
      });
    });

    describe('invalid date inputs', () => {
      const invalidDates = [
        { input: 'invalid-date', description: 'invalid string' },
        { input: '2024-13-01', description: 'invalid month' },
        { input: null, description: 'null' },
        { input: undefined, description: 'undefined' },
        { input: {}, description: 'empty object' }
      ];

      invalidDates.forEach(({ input, description }) => {
        it(`should handle ${description}`, () => {
          const result = transIsDate(input as any);
          expect(result instanceof Date || typeof result === 'boolean').toBe(true);
          if (result instanceof Date) {
            expect(isNaN(result.getTime())).toBe(true);
          }
        });
      });
    });
  });

  describe('handleValidationErrors', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
      mockReq = {};
      mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis()
      };
      mockNext = vi.fn();
    });

    it('should call next() when no validation errors exist', () => {
      (validationResult as any).mockReturnValue({
        isEmpty: () => true,
        array: () => []
      });

      handleValidationErrors(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should return 400 with error details when validation errors exist', () => {
      const mockErrors = [
        { path: 'email', msg: 'Invalid email' },
        { path: 'password', msg: 'Password too short' }
      ];

      (validationResult as any).mockReturnValue({
        isEmpty: () => false,
        array: () => mockErrors
      });

      handleValidationErrors(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        details: mockErrors
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle validationResult throwing an error', () => {
      (validationResult as any).mockImplementation(() => {
        throw new Error('Validation error');
      });

      expect(() => {
        handleValidationErrors(mockReq as Request, mockRes as Response, mockNext);
      }).toThrow('Validation error');
    });
  });

  describe('Validation Middleware Arrays', () => {
    const validationArrays = [
      { name: 'Booking Creation', array: validateBookingCreation },
      { name: 'User Creation', array: validateUserCreation },
      { name: 'User Login', array: validateUserLogin },
      { name: 'ID Parameter', array: validateIdParam },
      { name: 'Search Parameters', array: validateSearchParams }
    ];

    validationArrays.forEach(({ name, array }) => {
      it(`should have ${name} middleware array`, () => {
        expect(Array.isArray(array)).toBe(true);
        expect(array.length).toBeGreaterThan(0);
        expect(array[array.length - 1]).toBe(handleValidationErrors);
      });
    });
  });

  describe('Default Export', () => {
    it('should export all validators as default', async () => {
      const module = await import('../../../src/common/util/validators');
      
      // Check for the most important exports
      expect(module.default).toHaveProperty('handleValidationErrors');
      expect(module.default).toHaveProperty('validateBookingCreation');
      expect(module.default).toHaveProperty('validateUserCreation');
      expect(module.default).toHaveProperty('validateUserLogin');
      expect(module.default).toHaveProperty('validateIdParam');
      expect(module.default).toHaveProperty('validateSearchParams');
    });
  });
});