import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { collections, toObjectId, normalizeId } from '../utils/db';
import { AppError } from '../middlewares/error';

export const couponSchema = z.object({
  body: z.object({
    code: z.string().min(3, 'Code must be at least 3 characters'),
    discountPercentage: z.number().min(1).max(100),
    maxDiscount: z.number().optional().nullable(),
    expiryDate: z.string().transform((str) => new Date(str)),
    active: z.boolean().default(true),
  }),
});

export const getCoupons = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const coupons = await collections.coupons().find({}).toArray();
    res.status(200).json({
      success: true,
      coupons: coupons.map(normalizeId),
    });
  } catch (error) {
    next(error);
  }
};

export const createCoupon = async (req: Request, res: Response, next: NextFunction) => {
  const { code, discountPercentage, maxDiscount, expiryDate, active } = req.body;
  const uppercaseCode = code.toUpperCase();

  try {
    const existing = await collections.coupons().findOne({ code: uppercaseCode });
    if (existing) {
      return next(new AppError('Coupon code already exists', 400));
    }

    const result = await collections.coupons().insertOne({
      code: uppercaseCode,
      discountPercentage,
      maxDiscount: maxDiscount ?? null,
      expiryDate: new Date(expiryDate),
      active: active !== undefined ? active : true,
    });

    const coupon = normalizeId({ _id: result.insertedId, code: uppercaseCode, discountPercentage, maxDiscount, expiryDate, active });
    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      coupon,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCoupon = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { code, discountPercentage, maxDiscount, expiryDate, active } = req.body;

  try {
    if (!toObjectId(id)) return next(new AppError('Invalid coupon id', 400));
    const existing = await collections.coupons().findOne({ _id: toObjectId(id) });
    if (!existing) {
      return next(new AppError('Coupon not found', 404));
    }

    const uppercaseCode = code ? code.toUpperCase() : undefined;
    if (uppercaseCode && uppercaseCode !== existing.code) {
      const duplicate = await collections.coupons().findOne({ code: uppercaseCode });
      if (duplicate && duplicate._id.toString() !== id) {
        return next(new AppError('Coupon code already taken', 400));
      }
    }

    const updateData: any = { active };
    if (uppercaseCode) updateData.code = uppercaseCode;
    if (discountPercentage !== undefined) updateData.discountPercentage = discountPercentage;
    if (maxDiscount !== undefined) updateData.maxDiscount = maxDiscount;
    if (expiryDate) updateData.expiryDate = new Date(expiryDate);

    await collections.coupons().updateOne({ _id: toObjectId(id) }, { $set: updateData });
    const coupon = await collections.coupons().findOne({ _id: toObjectId(id) });

    res.status(200).json({
      success: true,
      message: 'Coupon updated successfully',
      coupon: normalizeId(coupon!),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCoupon = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    if (!toObjectId(id)) return next(new AppError('Invalid coupon id', 400));
    const existing = await collections.coupons().findOne({ _id: toObjectId(id) });
    if (!existing) {
      return next(new AppError('Coupon not found', 404));
    }

    await collections.coupons().deleteOne({ _id: toObjectId(id) });

    res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const validateCoupon = async (req: Request, res: Response, next: NextFunction) => {
  const { code } = req.body;
  if (!code || typeof code !== 'string' || code.trim().length === 0) {
    return next(new AppError('Coupon code is required', 400));
  }

  try {
    const coupon = await collections.coupons().findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return next(new AppError('Invalid coupon code', 404));
    }

    if (!coupon.active) {
      return next(new AppError('Coupon is inactive', 400));
    }

    if (new Date() > new Date(coupon.expiryDate)) {
      return next(new AppError('Coupon has expired', 400));
    }

    res.status(200).json({
      success: true,
      coupon: {
        code: coupon.code,
        discountPercentage: coupon.discountPercentage,
        maxDiscount: coupon.maxDiscount,
      },
    });
  } catch (error) {
    next(error);
  }
};
