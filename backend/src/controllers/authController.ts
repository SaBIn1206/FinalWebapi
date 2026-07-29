import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { collections, toObjectId, isObjectId, normalizeId } from '../utils/db';
import { AppError } from '../middlewares/error';
import { AuthRequest } from '../middlewares/auth';

// Validation Schemas
export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    role: z.enum(['ADMIN', 'CUSTOMER']).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    email: z.string().email('Invalid email address').optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  }),
});

const generateToken = (user: { id: string; email: string; role: string; name: string }) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    secret,
    { expiresIn: '7d', algorithm: 'HS256' }
  );
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  console.log("test")
  const { email, password, name, role } = req.body;

  try {
    const existingUser = await collections.users().findOne({ email });
    if (existingUser) {
      return next(new AppError('Email already registered', 400));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await collections.users().insertOne({
      email,
      password: hashedPassword,
      name,
      role: role || 'CUSTOMER',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create the user's cart (document-based: separate collection)
    await collections.carts().insertOne({
      userId: result.insertedId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const user = normalizeId({ _id: result.insertedId, name, email, role: role || 'CUSTOMER' });
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  try {
    const userDoc = await collections.users().findOne({ email });
    if (!userDoc) {
      return next(new AppError('Invalid email or password', 401));
    }

    const isMatch = await bcrypt.compare(password, userDoc.password);
    if (!isMatch) {
      return next(new AppError('Invalid email or password', 401));
    }

    const user = normalizeId(userDoc);
    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const { tokenBlacklist } = await import('../middlewares/blacklist');
    tokenBlacklist.revoke(token);
  }

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next(new AppError('User not authenticated', 401));
    const userDoc = await collections.users().findOne(
      { _id: toObjectId(req.user.id) },
      { projection: { password: 0 } }
    );

    if (!userDoc) {
      return next(new AppError('User not found', 404));
    }

    const addresses = await collections.addresses().find({ userId: toObjectId(req.user.id) }).toArray();

    res.status(200).json({
      success: true,
      user: {
        ...normalizeId(userDoc),
        addresses: addresses.map(normalizeId),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { name, email } = req.body;

  try {
    if (!req.user) return next(new AppError('User not authenticated', 401));

    if (email) {
      const existingUser = await collections.users().findOne({ email });
      if (existingUser && existingUser._id.toString() !== req.user.id) {
        return next(new AppError('Email already taken by another account', 400));
      }
    }

    const updateData: any = { updatedAt: new Date() };
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    await collections.users().updateOne(
      { _id: toObjectId(req.user.id) },
      { $set: updateData }
    );

    const updatedDoc = await collections.users().findOne(
      { _id: toObjectId(req.user.id) },
      { projection: { password: 0 } }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: normalizeId(updatedDoc!),
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { currentPassword, newPassword } = req.body;

  try {
    if (!req.user) return next(new AppError('User not authenticated', 401));

    const userDoc = await collections.users().findOne({ _id: toObjectId(req.user.id) });
    if (!userDoc) {
      return next(new AppError('User not found', 404));
    }

    const isMatch = await bcrypt.compare(currentPassword, userDoc.password);
    if (!isMatch) {
      return next(new AppError('Incorrect current password', 400));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await collections.users().updateOne(
      { _id: toObjectId(req.user.id) },
      { $set: { password: hashedPassword, updatedAt: new Date() } }
    );

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};
