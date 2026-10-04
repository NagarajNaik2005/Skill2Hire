import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { generateToken } from '../utils/jwt';
import { AuthenticatedRequest } from '../types';

export class AuthController {
  /**
   * User Registration
   */
  public static async register(req: Request, res: Response): Promise<void> {
    try {
      const { fullName, email, password, targetRole, skills } = req.body;

      if (!fullName || !email || !password) {
        res.status(400).json({ success: false, error: 'Full name, email, and password are required.' });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
        return;
      }

      const emailNormalized = email.toLowerCase().trim();

      // Check database connection state
      if (mongoose.connection.readyState !== 1) {
        // Fallback for offline or local dev without Atlas connection
        const mockUserId = `guest_${Date.now()}`;
        const token = generateToken({
          id: mockUserId,
          email: emailNormalized,
          fullName: fullName.trim()
        });

        res.status(201).json({
          success: true,
          message: 'Account initialized (Offline session active).',
          data: {
            token,
            user: {
              id: mockUserId,
              fullName: fullName.trim(),
              email: emailNormalized,
              targetRole: targetRole || 'Software Engineer',
              skills: Array.isArray(skills) ? skills : []
            }
          }
        });
        return;
      }

      const existingUser = await User.findOne({ email: emailNormalized });
      if (existingUser) {
        res.status(400).json({ success: false, error: 'An account with this email already exists. Please sign in.' });
        return;
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = await User.create({
        fullName: fullName.trim(),
        email: emailNormalized,
        passwordHash,
        targetRole: targetRole || 'Software Engineer',
        skills: Array.isArray(skills) ? skills : []
      });

      const token = generateToken({
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName
      });

      res.status(201).json({
        success: true,
        message: 'Account created successfully.',
        data: {
          token,
          user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            targetRole: user.targetRole,
            skills: user.skills
          }
        }
      });
    } catch (error: any) {
      console.error('[AuthController.register Error]:', error);
      res.status(500).json({ success: false, error: error.message || 'Failed to register account.' });
    }
  }

  /**
   * User Login
   */
  public static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ success: false, error: 'Email and password are required.' });
        return;
      }

      const emailNormalized = email.toLowerCase().trim();

      // Check database connection state
      if (mongoose.connection.readyState !== 1) {
        // Fallback for offline or local dev without Atlas connection
        const mockUserId = `user_${Date.now()}`;
        const token = generateToken({
          id: mockUserId,
          email: emailNormalized,
          fullName: emailNormalized.split('@')[0]
        });

        res.status(200).json({
          success: true,
          message: 'Logged in successfully (Offline session active).',
          data: {
            token,
            user: {
              id: mockUserId,
              fullName: emailNormalized.split('@')[0],
              email: emailNormalized,
              targetRole: 'Software Engineer',
              skills: []
            }
          }
        });
        return;
      }

      const user = await User.findOne({ email: emailNormalized });
      if (!user) {
        res.status(401).json({ success: false, error: 'Invalid email or password.' });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        res.status(401).json({ success: false, error: 'Invalid email or password.' });
        return;
      }

      const token = generateToken({
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName
      });

      res.status(200).json({
        success: true,
        message: 'Logged in successfully.',
        data: {
          token,
          user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            targetRole: user.targetRole,
            skills: user.skills
          }
        }
      });
    } catch (error: any) {
      console.error('[AuthController.login Error]:', error);
      res.status(500).json({ success: false, error: error.message || 'Failed to log in.' });
    }
  }

  /**
   * Get Current User Profile
   */
  public static async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(401).json({ success: false, error: 'Unauthorized.' });
        return;
      }

      if (mongoose.connection.readyState !== 1 || req.user.id.startsWith('guest_') || req.user.id.startsWith('user_')) {
        res.status(200).json({
          success: true,
          data: {
            id: req.user.id,
            fullName: req.user.fullName || 'Candidate',
            email: req.user.email || 'candidate@example.com',
            targetRole: 'Software Engineer',
            skills: []
          }
        });
        return;
      }

      const user = await User.findById(req.user.id).select('-passwordHash');
      if (!user) {
        res.status(404).json({ success: false, error: 'User profile not found.' });
        return;
      }

      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  /**
   * Logout acknowledgment
   */
  public static logout(_req: Request, res: Response): void {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  }
}
