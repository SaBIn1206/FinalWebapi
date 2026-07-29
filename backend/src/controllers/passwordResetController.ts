import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { collections, toObjectId, normalizeId } from '../utils/db';
import { AppError } from '../middlewares/error';

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Reset token is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

const generateResetToken = (userId: string) => {
  const secret = process.env.JWT_SECRET || 'supersecretkeyforbakeryhubdev';
  return jwt.sign(
    { id: userId, type: 'password-reset' },
    secret,
    { expiresIn: '1h' }
  );
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;

  try {
    const user = await collections.users().findOne({ email });
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, we have sent a password reset link.',
      });
    }

    const resetToken = generateResetToken(user._id.toString());
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await collections.passwordResets().insertOne({
      userId: user._id,
      token: resetToken,
      expiresAt,
      used: false,
      createdAt: new Date(),
    });

    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, we have sent a password reset link.',
      // In production, send this via email. For dev, return it in response.
      resetToken,
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  const { token, password } = req.body;

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return next(new AppError('Server configuration error', 500));
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });
    } catch {
      return next(new AppError('Invalid or expired reset token', 400));
    }

    if (decoded.type !== 'password-reset') {
      return next(new AppError('Invalid reset token', 400));
    }

    const resetRecord = await collections.passwordResets().findOne({
      token,
      userId: toObjectId(decoded.id),
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!resetRecord) {
      return next(new AppError('Invalid or expired reset token', 400));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await collections.users().updateOne(
      { _id: toObjectId(decoded.id) },
      { $set: { password: hashedPassword, updatedAt: new Date() } }
    );

    await collections.passwordResets().updateOne(
      { _id: resetRecord._id },
      { $set: { used: true } }
    );

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. Please log in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};
