import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { collections, toObjectId, normalizeId } from '../utils/db';
import { AppError } from '../middlewares/error';
import { AuthRequest } from '../middlewares/auth';

// Validation Schema
export const addressSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, 'Full name is required'),
    phone: z.string().min(8, 'Phone number is required'),
    streetAddress: z.string().min(5, 'Street address is required'),
    city: z.string().min(2, 'City is required'),
    landmark: z.string().optional().nullable(),
    isDefault: z.boolean().default(false),
  }),
});

// Addresses CRUD
export const getAddresses = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next(new AppError('User not authenticated', 401));
    const addresses = await collections.addresses().find({ userId: toObjectId(req.user.id) }).toArray();
    res.status(200).json({
      success: true,
      addresses: addresses.map(normalizeId),
    });
  } catch (error) {
    next(error);
  }
};

export const createAddress = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { fullName, phone, streetAddress, city, landmark, isDefault } = req.body;

  try {
    if (!req.user) return next(new AppError('User not authenticated', 401));

    if (isDefault) {
      await collections.addresses().updateMany(
        { userId: toObjectId(req.user.id), isDefault: true },
        { $set: { isDefault: false } }
      );
    }

    const result = await collections.addresses().insertOne({
      userId: toObjectId(req.user.id),
      fullName,
      phone,
      streetAddress,
      city,
      landmark: landmark ?? null,
      isDefault,
    });

    const address = normalizeId({ _id: result.insertedId, userId: toObjectId(req.user.id), fullName, phone, streetAddress, city, landmark, isDefault });
    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      address,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAddress = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { fullName, phone, streetAddress, city, landmark, isDefault } = req.body;

  try {
    if (!req.user) return next(new AppError('User not authenticated', 401));
    if (!toObjectId(id)) return next(new AppError('Address not found', 404));

    const existing = await collections.addresses().findOne({ _id: toObjectId(id) });
    if (!existing || existing.userId.toString() !== req.user.id) {
      return next(new AppError('Address not found', 404));
    }

    if (isDefault) {
      await collections.addresses().updateMany(
        { userId: toObjectId(req.user.id), isDefault: true },
        { $set: { isDefault: false } }
      );
    }

    const updateData: any = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (phone !== undefined) updateData.phone = phone;
    if (streetAddress !== undefined) updateData.streetAddress = streetAddress;
    if (city !== undefined) updateData.city = city;
    if (landmark !== undefined) updateData.landmark = landmark;
    if (isDefault !== undefined) updateData.isDefault = isDefault;

    await collections.addresses().updateOne({ _id: toObjectId(id) }, { $set: updateData });
    const address = await collections.addresses().findOne({ _id: toObjectId(id) });

    res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      address: normalizeId(address!),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    if (!req.user) return next(new AppError('User not authenticated', 401));
    if (!toObjectId(id)) return next(new AppError('Address not found', 404));

    const existing = await collections.addresses().findOne({ _id: toObjectId(id) });
    if (!existing || existing.userId.toString() !== req.user.id) {
      return next(new AppError('Address not found', 404));
    }

    await collections.addresses().deleteOne({ _id: toObjectId(id) });

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Wishlist CRUD
export const getWishlist = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next(new AppError('User not authenticated', 401));

    const wishlist = await collections.wishlists().find({ userId: toObjectId(req.user.id) }).toArray();
    const populated = await Promise.all(
      wishlist.map(async (w) => {
        const cake = await collections.cakes().findOne({ _id: toObjectId(w.cakeId.toString()) });
        const images = cake ? await collections.cakeImages().find({ cakeId: cake._id }).toArray() : [];
        return {
          ...normalizeId(w),
          cake: cake ? { ...normalizeId(cake), images: images.map(normalizeId) } : null,
        };
      })
    );

    res.status(200).json({
      success: true,
      wishlist: populated,
    });
  } catch (error) {
    next(error);
  }
};

export const addToWishlist = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { cakeId } = req.body;

  try {
    if (!req.user) return next(new AppError('User not authenticated', 401));

    const existing = await collections.wishlists().findOne({ userId: toObjectId(req.user.id), cakeId: toObjectId(cakeId) });

    if (existing) {
      return res.status(200).json({
        success: true,
        message: 'Cake is already in your wishlist',
      });
    }

    const result = await collections.wishlists().insertOne({
      userId: toObjectId(req.user.id),
      cakeId: toObjectId(cakeId),
    });

    res.status(201).json({
      success: true,
      message: 'Added to wishlist',
      item: normalizeId({ _id: result.insertedId, userId: toObjectId(req.user.id), cakeId: toObjectId(cakeId) }),
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromWishlist = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { cakeId } = req.params;

  try {
    if (!req.user) return next(new AppError('User not authenticated', 401));

    const existing = await collections.wishlists().findOne({ userId: toObjectId(req.user.id), cakeId: toObjectId(cakeId) });

    if (!existing) {
      return next(new AppError('Wishlist item not found', 404));
    }

    await collections.wishlists().deleteOne({ _id: existing._id });

    res.status(200).json({
      success: true,
      message: 'Removed from wishlist',
    });
  } catch (error) {
    next(error);
  }
};

// Notifications CRUD
export const getNotifications = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next(new AppError('User not authenticated', 401));

    const notifications = await collections.notifications().find({ userId: toObjectId(req.user.id) }).sort({ createdAt: -1 }).toArray();

    res.status(200).json({
      success: true,
      notifications: notifications.map(normalizeId),
    });
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    if (!req.user) return next(new AppError('User not authenticated', 401));
    if (!toObjectId(id)) return next(new AppError('Notification not found', 404));

    const existing = await collections.notifications().findOne({ _id: toObjectId(id) });
    if (!existing || existing.userId.toString() !== req.user.id) {
      return next(new AppError('Notification not found', 404));
    }

    await collections.notifications().updateOne({ _id: toObjectId(id) }, { $set: { read: true } });
    const notification = await collections.notifications().findOne({ _id: toObjectId(id) });

    res.status(200).json({
      success: true,
      notification: normalizeId(notification!),
    });
  } catch (error) {
    next(error);
  }
};
