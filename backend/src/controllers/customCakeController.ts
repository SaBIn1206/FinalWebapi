import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { collections, toObjectId, normalizeId } from '../utils/db';
import { AppError } from '../middlewares/error';
import { AuthRequest } from '../middlewares/auth';

// Custom cake designs are user-submitted "items". Any authenticated user can
// create one; only the owner (or an ADMIN) may modify or remove it.
export const customCakeSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    price: z.number().min(0, 'Price must be positive'),
    discountPrice: z.number().min(0).optional().nullable(),
    ingredients: z.string().optional().nullable(),
    prepTime: z.number().int().min(1).optional(),
    stock: z.number().int().min(0).optional(),
    categoryId: z.string().min(1, 'Category ID is required'),
    images: z.array(z.string()).optional(),
    variants: z
      .array(
        z.object({
          weight: z.number().min(0.1),
          flavor: z.string().min(1),
          priceModifier: z.number().default(0.0),
        })
      )
      .optional(),
  }),
});

async function populateCake(cake: any) {
  if (!cake) return cake;
  const [category, images, variants] = await Promise.all([
    cake.categoryId ? collections.categories().findOne({ _id: toObjectId(cake.categoryId.toString()) }) : null,
    collections.cakeImages().find({ cakeId: cake._id }).toArray(),
    collections.cakeVariants().find({ cakeId: cake._id }).toArray(),
  ]);
  return {
    ...normalizeId(cake),
    category: category ? normalizeId(category) : null,
    images: images.map(normalizeId),
    variants: variants.map(normalizeId),
  };
}

export const createCustomCake = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { name, description, price, discountPrice, ingredients, prepTime, stock, categoryId, images, variants } = req.body;
  const userId = req.user?.id;

  try {
    const result = await collections.cakes().insertOne({
      name,
      description,
      price,
      discountPrice: discountPrice || null,
      ingredients: ingredients || null,
      prepTime: prepTime || 24,
      stock: stock ?? 10,
      categoryId: toObjectId(categoryId),
      rating: 5.0,
      isCustom: true,
      createdByUserId: userId ? toObjectId(userId) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const createdImages: any[] = [];
    if (images && images.length > 0) {
      for (const url of images) {
        const r = await collections.cakeImages().insertOne({ cakeId: result.insertedId, url });
        createdImages.push(normalizeId({ _id: r.insertedId, cakeId: result.insertedId, url }));
      }
    }
    const createdVariants: any[] = [];
    if (variants && variants.length > 0) {
      for (const v of variants) {
        const r = await collections.cakeVariants().insertOne({
          cakeId: result.insertedId,
          weight: v.weight,
          flavor: v.flavor,
          priceModifier: v.priceModifier || 0.0,
        });
        createdVariants.push(normalizeId({ _id: r.insertedId, cakeId: result.insertedId, ...v }));
      }
    }

    const category = await collections.categories().findOne({ _id: toObjectId(categoryId) });
    const cake = {
      ...normalizeId({ _id: result.insertedId, name, description, price, discountPrice, ingredients, prepTime, stock, categoryId, rating: 5.0, isCustom: true }),
      category: category ? normalizeId(category) : null,
      images: createdImages,
      variants: createdVariants,
    };

    res.status(201).json({ success: true, message: 'Custom cake design saved', cake });
  } catch (error) {
    next(error);
  }
};

export const getMyCustomCakes = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.user?.id;
  try {
    const cakes = await collections.cakes().find({ isCustom: true, createdByUserId: toObjectId(userId!) }).sort({ createdAt: -1 }).toArray();
    const populated = await Promise.all(cakes.map(populateCake));
    res.status(200).json({ success: true, cakes: populated });
  } catch (error) {
    next(error);
  }
};

export const updateCustomCake = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const { name, description, price, discountPrice, ingredients, prepTime, stock, categoryId, images, variants } = req.body;

  try {
    if (!toObjectId(id)) return next(new AppError('Custom cake not found', 404));
    const existing = await collections.cakes().findOne({ _id: toObjectId(id) });
    if (!existing) return next(new AppError('Custom cake not found', 404));
    if (!existing.isCustom) return next(new AppError('Only custom cake designs can be edited here', 403));
    if (existing.createdByUserId?.toString() !== userId && req.user?.role !== 'ADMIN') {
      return next(new AppError('Not authorized to modify this design', 403));
    }

    const updateData: any = { updatedAt: new Date() };
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (discountPrice !== undefined) updateData.discountPrice = discountPrice;
    if (ingredients !== undefined) updateData.ingredients = ingredients;
    if (prepTime !== undefined) updateData.prepTime = prepTime;
    if (stock !== undefined) updateData.stock = stock;
    if (categoryId !== undefined) updateData.categoryId = toObjectId(categoryId);

    await collections.cakes().updateOne({ _id: toObjectId(id) }, { $set: updateData });

    if (images) {
      await collections.cakeImages().deleteMany({ cakeId: toObjectId(id) });
      for (const url of images) {
        await collections.cakeImages().insertOne({ cakeId: toObjectId(id), url });
      }
    }
    if (variants) {
      await collections.cakeVariants().deleteMany({ cakeId: toObjectId(id) });
      for (const v of variants) {
        await collections.cakeVariants().insertOne({
          cakeId: toObjectId(id),
          weight: v.weight,
          flavor: v.flavor,
          priceModifier: v.priceModifier || 0.0,
        });
      }
    }

    const cake = await collections.cakes().findOne({ _id: toObjectId(id) });
    res.status(200).json({ success: true, message: 'Custom cake updated', cake: await populateCake(cake!) });
  } catch (error) {
    next(error);
  }
};

export const deleteCustomCake = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    if (!toObjectId(id)) return next(new AppError('Custom cake not found', 404));
    const existing = await collections.cakes().findOne({ _id: toObjectId(id) });
    if (!existing) return next(new AppError('Custom cake not found', 404));
    if (!existing.isCustom) return next(new AppError('Only custom cake designs can be removed here', 403));
    if (existing.createdByUserId?.toString() !== userId && req.user?.role !== 'ADMIN') {
      return next(new AppError('Not authorized to delete this design', 403));
    }

    await collections.cakes().deleteOne({ _id: toObjectId(id) });
    await collections.cakeImages().deleteMany({ cakeId: toObjectId(id) });
    await collections.cakeVariants().deleteMany({ cakeId: toObjectId(id) });
    await collections.reviews().deleteMany({ cakeId: toObjectId(id) });

    res.status(200).json({ success: true, message: 'Custom cake deleted' });
  } catch (error) {
    next(error);
  }
};
