import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { collections, toObjectId, normalizeId, isObjectId } from '../utils/db';
import { AppError } from '../middlewares/error';

// Zod validation schemas
export const createProductSchema = z.object({
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
    variants: z.array(z.object({
      weight: z.number().min(0.1),
      flavor: z.string().min(1),
      priceModifier: z.number().default(0.0),
    })).optional(),
  }),
});

export const updateProductSchema = createProductSchema.partial();

// Populate a cake document with its category, images, variants and reviews.
async function populateCake(cake: any) {
  if (!cake) return cake;
  const [category, images, variants, reviews] = await Promise.all([
    cake.categoryId ? collections.categories().findOne({ _id: toObjectId(cake.categoryId.toString()) }) : null,
    collections.cakeImages().find({ cakeId: cake._id }).toArray(),
    collections.cakeVariants().find({ cakeId: cake._id }).toArray(),
    collections.reviews().find({ cakeId: cake._id }).sort({ createdAt: -1 }).toArray(),
  ]);
  return {
    ...normalizeId(cake),
    category: category ? normalizeId(category) : null,
    images: images.map(normalizeId),
    variants: variants.map(normalizeId),
    reviews: reviews.map((r) => ({ ...normalizeId(r), user: r.userId ? { id: r.userId.toString() } : undefined })),
  };
}

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  const {
    search,
    category,
    flavor,
    minPrice,
    maxPrice,
    minRating,
    weight,
    sort,
    page = '1',
    limit = '12',
  } = req.query;

  try {
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const filter: any = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search as string, $options: 'i' } },
        { description: { $regex: search as string, $options: 'i' } },
        { ingredients: { $regex: search as string, $options: 'i' } },
      ];
    }

    if (category) {
      // category may be a slug or an ObjectId
      const catStr = category as string;
      const or: any[] = [];
      if (isObjectId(catStr)) {
        or.push({ categoryId: toObjectId(catStr) });
      }
      const catBySlug = await collections.categories().findOne({ slug: catStr });
      if (catBySlug) or.push({ categoryId: catBySlug._id });
      if (or.length > 0) filter.$or = (filter.$or || []).concat(or);
    }

    if (flavor) {
      const matchingVariants = await collections.cakeVariants()
        .find({ flavor: { $regex: flavor as string, $options: 'i' } })
        .toArray();
      filter._id = { $in: matchingVariants.map((v) => v.cakeId) };
    }

    if (weight) {
      const matchingVariants = await collections.cakeVariants()
        .find({ weight: parseFloat(weight as string) })
        .toArray();
      filter._id = { $in: matchingVariants.map((v) => v.cakeId) };
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice as string);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice as string);
    }

    if (minRating) {
      filter.rating = { $gte: parseFloat(minRating as string) };
    }

    let sortOption: any = { createdAt: -1 };
    if (sort === 'popular' || sort === 'rating') sortOption = { rating: -1 };
    else if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };

    const [cakes, total] = await Promise.all([
      collections.cakes().find(filter).sort(sortOption).skip(skip).limit(limitNum).toArray(),
      collections.cakes().countDocuments(filter),
    ]);

    const populated = await Promise.all(cakes.map(populateCake));

    res.status(200).json({
      success: true,
      count: populated.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      products: populated,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    if (!toObjectId(id)) return next(new AppError('Cake product not found', 404));
    const cake = await collections.cakes().findOne({ _id: toObjectId(id) });
    if (!cake) {
      return next(new AppError('Cake product not found', 404));
    }

    res.status(200).json({
      success: true,
      product: await populateCake(cake),
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  const { name, description, price, discountPrice, ingredients, prepTime, stock, categoryId, images, variants } = req.body;

  try {
    const result = await collections.cakes().insertOne({
      name,
      description,
      price,
      discountPrice: discountPrice || null,
      ingredients: ingredients || null,
      prepTime: prepTime || 24,
      stock: stock || 10,
      categoryId: toObjectId(categoryId),
      rating: 5.0,
      isCustom: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const createdImages: any[] = [];
    if (images && images.length) {
      for (const url of images) {
        const r = await collections.cakeImages().insertOne({ cakeId: result.insertedId, url });
        createdImages.push(normalizeId({ _id: r.insertedId, cakeId: result.insertedId, url }));
      }
    }
    const createdVariants: any[] = [];
    if (variants && variants.length) {
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
    const product = {
      ...normalizeId({ _id: result.insertedId, name, description, price, discountPrice, ingredients, prepTime, stock, categoryId, rating: 5.0, isCustom: false }),
      category: category ? normalizeId(category) : null,
      images: createdImages,
      variants: createdVariants,
      reviews: [],
    };

    res.status(201).json({
      success: true,
      message: 'Cake product created successfully',
      product,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { name, description, price, discountPrice, ingredients, prepTime, stock, categoryId, images, variants } = req.body;

  try {
    if (!toObjectId(id)) return next(new AppError('Cake product not found', 404));
    const existingProduct = await collections.cakes().findOne({ _id: toObjectId(id) });
    if (!existingProduct) {
      return next(new AppError('Cake product not found', 404));
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

    const updated = await collections.cakes().findOne({ _id: toObjectId(id) });

    res.status(200).json({
      success: true,
      message: 'Cake product updated successfully',
      product: await populateCake(updated!),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    if (!toObjectId(id)) return next(new AppError('Cake product not found', 404));
    const product = await collections.cakes().findOne({ _id: toObjectId(id) });
    if (!product) {
      return next(new AppError('Cake product not found', 404));
    }

    await collections.cakes().deleteOne({ _id: toObjectId(id) });
    // Cascade cleanup (document-based)
    await collections.cakeImages().deleteMany({ cakeId: toObjectId(id) });
    await collections.cakeVariants().deleteMany({ cakeId: toObjectId(id) });
    await collections.reviews().deleteMany({ cakeId: toObjectId(id) });

    res.status(200).json({
      success: true,
      message: 'Cake product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
