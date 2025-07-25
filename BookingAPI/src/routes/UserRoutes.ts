import express from 'express';
import * as userRepo from '../repos/UserRepo';
import { IUser } from '../models/User'; 
import { hashPassword } from '@src/common/util/auth';

import { generateToken, authenticateJWT, comparePasswords } from '@src/common/util/auth';

const router = express.Router();

// CREATE user
router.post('/', async (req, res) => {
    try {
        const {
            id,
            username,
            password,
            first_name,
            last_name,
            salutation,
            email,
            phone_num
        } = req.body;

        // Validate required fields
        if (!username || !password || !email ||!phone_num) {
            return res.status(400).json({ error: 'Username, password, email and phone number are required' });
        }

        const now = new Date();
        const user: IUser = {
            id: id || `user-${Date.now()}`,
            username,
            password: await hashPassword(password), // Hash the password
            first_name: first_name || '',
            last_name: last_name || '',
            salutation: salutation || '',
            email,
            phone_num,
            created: now
        };

        const result = await userRepo.add(user);
        
        // Generate token for immediate login
        const token = generateToken(user);
        
        res.status(201).json({ 
            message: 'User created successfully',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                phone_num: user.phone_num,
                salutation: user.salutation,
                first_name: user.first_name,
                last_name: user.last_name,
                created: user.created
            }
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to create user',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// User login route (additional authentication endpoint)
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await userRepo.getEmailOne(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await comparePasswords(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = generateToken(user);

        // Return token and sanitized user data
        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                phone_num: user.phone_num
            }
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Login failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});


// Protect routes with JWT authentication
router.use(authenticateJWT);

/**
 * All routes below this line will require authentication
*/
// READ all users (consider adding authentication/authorization for this route)
router.get('/', async (_req, res) => {
    try {
        const users = await userRepo.getAll();
        // Sanitize user data before returning (remove passwords)
        const sanitizedUsers = users.map(user => ({
            id: user.id,
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            phone_num: user.phone_num,
            created: user.created
        }));
        res.json(sanitizedUsers);
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to fetch users',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// READ user by ID
router.get('/:id', async (req, res) => {
    try {
        const user = await userRepo.getOne(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Return sanitized user data
        res.json({
            id: user.id,
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            phone_num: user.email,
            created: user.created
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to fetch user',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// UPDATE user
router.put('/:id', async (req, res) => {
    try {
        // Only allow specific fields to be updated
        const allowedFields = [
            'username', 'first_name', 'last_name', 
            'salutation', 'email', 'phone_num', 'created_at'
        ];
        
        const updates: Partial<IUser> = {};
        for (const key of allowedFields) {
            if (req.body[key] !== undefined) {
                updates[key as keyof IUser] = req.body[key];
            }
        }
            
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }

        const result = await userRepo.update(req.params.id,{
            ...updates,
            id: req.params.id // Ensure we're updating the correct user
        } as IUser);

        res.json({ 
            message: 'User updated successfully',
            updatedFields: Object.keys(updates)
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to update user',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// DELETE user
router.delete('/:id', async (req, res) => {
    try {
        const result = await userRepo.deleteOne(req.params.id);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ 
            error: 'Failed to delete user',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});



export default router;