import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { collections, toObjectId, normalizeId, isObjectId } from '../utils/db';
import { AppError } from '../middlewares/error';
import { AuthRequest } from '../middlewares/auth';

export const reviewSchema = z.object({
  body: z.object({
    cakeId: z.string().min(1, 'Cake ID is required'),
    rating: z.number().min(1).max(5),
    comment: z.string().min(3, 'Comment must be at least 3 characters'),
  }),
});

async function updateCakeRating(cakeId: string) {
  const reviews = await collections.reviews().find({ cakeId: toObjectId(cakeId) }, { projection: { rating: 1 } }).toArray();
  if (reviews.length === 0) {
    await collections.cakes().updateOne({ _id: toObjectId(cakeId) }, { $set: { rating: 5.0 } });
    return;
  }
  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  await collections.cakes().updateOne(
    { _id: toObjectId(cakeId) },
    { $set: { rating: Math.round(avg * 10) / 10 } }
  );
}

export const getReviews = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { cakeId } = req.query;

  try {
    const filter: any = {};
    if (cakeId) filter.cakeId = toObjectId(cakeId as string);

    const reviews = await collections.reviews().find(filter).sort({ createdAt: -1 }).toArray();
    const populated = await Promise.all(
      reviews.map(async (r) => {
        const [user, cake] = await Promise.all([
          collections.users().findOne({ _id: toObjectId(r.userId.toString()) }, { projection: { name: 1 } }),
          collections.cakes().findOne({ _id: toObjectId(r.cakeId.toString()) }, { projection: { name: 1 } }),
        ]);
        return {
          ...normalizeId(r),
          user: user ? { name: user.name } : undefined,
          cake: cake ? { name: cake.name } : undefined,
        };
      })
    );

    res.status(200).json({
      success: true,
      reviews: populated,
    });
  } catch (error) {
    next(error);
  }
};

export const createReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { cakeId, rating, comment } = req.body;

  try {
    if (!req.user) return next(new AppError('User not authenticated', 401));

    const cake = await collections.cakes().findOne({ _id: toObjectId(cakeId) });
    if (!cake) {
      return next(new AppError('Cake product not found', 404));
    }

    const result = await collections.reviews().insertOne({
      userId: toObjectId(req.user.id),
      cakeId: toObjectId(cakeId),
      rating,
      comment,
      createdAt: new Date(),
    });

    await updateCakeRating(cakeId);

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review: normalizeId({ _id: result.insertedId, userId: toObjectId(req.user.id), cakeId: toObjectId(cakeId), rating, comment }),
    });
  } catch (error) {
    next(error);
  }
};

export const updateReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  try {
    if (!req.user) return next(new AppError('User not authenticated', 401));
    if (!isObjectId(id)) return next(new AppError('Review not found', 404));

    const existing = await collections.reviews().findOne({ _id: toObjectId(id) });
    if (!existing) {
      return next(new AppError('Review not found', 404));
    }

    if (existing.userId.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return next(new AppError('Unauthorized', 403));
    }

    await collections.reviews().updateOne(
      { _id: toObjectId(id) },
      { $set: { rating, comment } }
    );

    await updateCakeRating(existing.cakeId.toString());

    const review = await collections.reviews().findOne({ _id: toObjectId(id) });
    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      review: normalizeId(review!),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    if (!req.user) return next(new AppError('User not authenticated', 401));
    if (!isObjectId(id)) return next(new AppError('Review not found', 404));

    const existing = await collections.reviews().findOne({ _id: toObjectId(id) });
    if (!existing) {
      return next(new AppError('Review not found', 404));
    }

    if (existing.userId.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return next(new AppError('Unauthorized', 403));
    }

    await collections.reviews().deleteOne({ _id: toObjectId(id) });
    await updateCakeRating(existing.cakeId.toString());

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
