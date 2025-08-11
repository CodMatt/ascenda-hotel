import { isNumber, isDate } from 'jet-validators';
import { transform } from 'jet-validators/utils';
import { body, param, query, validationResult } from 'express-validator';
import {Request, Response, NextFunction} from 'express'


/******************************************************************************
                                Functions
******************************************************************************/

/**
 * Database relational key.
 */
export function isRelationalKey(arg: unknown): arg is number {
  return isNumber(arg) && arg >= -1;
}

/**
 * Convert to date object then check is a validate date.
 */
export const transIsDate = transform(
  arg => new Date(arg as string),
  arg => isDate(arg),
);

/**
 *  Validation middleware to handle errors
*/
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array()
        });
    }
    next();
};

/**
 * Booking validation rules
 */

export const validateBookingCreation = [
    body('dest_id').notEmpty().withMessage('Destination ID is required'),
    body('hotel_id').notEmpty().withMessage('Hotel ID is required'),
    body('start_date')
        .isISO8601()
        .withMessage('Start date must be valid ISO 8601 format')
        .custom((value) => {
            const startDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (startDate < today) {
                throw new Error('Start date cannot be in the past');
            }
            return true;
        }),
    body('end_date')
        .isISO8601()
        .withMessage('End date must be valid ISO 8601 format')
        .custom((value, { req }) => {
            const endDate = new Date(value);
            const startDate = new Date(req.body.start_date);
            if (endDate <= startDate) {
                throw new Error('End date must be after start date');
            }
            return true;
        }),
    body('nights')
        .optional()
        .isInt({ min: 1, max: 365 })
        .withMessage('Nights must be between 1 and 365'),
    body('adults')
        .optional()
        .isInt({ min: 1, max: 20 })
        .withMessage('Adults must be between 1 and 20'),
    body('children')
        .optional()
        .isInt({ min: 0, max: 10 })
        .withMessage('Children must be between 0 and 10'),
    body('price')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),
    // Guest user validation (when user_ref is null)
    body('first_name')
        .if(body('user_ref').isEmpty())
        .notEmpty()
        .withMessage('First name is required for guest bookings')
        .isLength({ min: 1, max: 50 })
        .withMessage('First name must be 1-50 characters'),
    body('last_name')
        .if(body('user_ref').isEmpty())
        .notEmpty()
        .withMessage('Last name is required for guest bookings')
        .isLength({ min: 1, max: 50 })
        .withMessage('Last name must be 1-50 characters'),
    body('email')
        .if(body('user_ref').isEmpty())
        .isEmail()
        .withMessage('Valid email is required for guest bookings'),
    body('phone_num')
        .if(body('user_ref').isEmpty())
        .matches(/^\+?[\d\s\-\(\)]{6,17}$/)
        .withMessage('Valid phone number is required for guest bookings'),
    handleValidationErrors
];

/**
 * User validation rules
 */
export const validateUserCreation = [
    body('username')
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be 3-30 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?!.*\s)/)
        .withMessage('Password must contain at least one lowercase, uppercase, and number'),
    body('email')
        .isEmail()
        .withMessage('Valid email is required')
        .normalizeEmail(),
    body('phone_num')
        .matches(/^\+?[\d\s\-\(\)]{10,15}$/)
        .withMessage('Valid phone number is required'),
    body('first_name')
        .optional()
        .isLength({ max: 50 })
        .withMessage('First name cannot exceed 50 characters'),
    body('last_name')
        .optional()
        .isLength({ max: 50 })
        .withMessage('Last name cannot exceed 50 characters'),
    handleValidationErrors
];

export const validateUserLogin = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    handleValidationErrors
];

export const validateIdParam = [
    param('id').notEmpty().withMessage('ID parameter is required'),
    handleValidationErrors
];

export const validateSearchParams = [
    query('destination_id').notEmpty().withMessage('destination_id required'),
    query('guests').notEmpty().withMessage('Number of guests required'),
    // Add validation for other query params if needed
    query('checkin').notEmpty().withMessage('Checkin date required'),
    query('checkout').notEmpty().withMessage('Checkout date required'),
    handleValidationErrors
];

export default {
  handleValidationErrors,
  validateBookingCreation,
  validateUserCreation,
  validateUserLogin,
  validateIdParam,
  validateSearchParams
} as const;