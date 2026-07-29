import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { collections, toObjectId, normalizeId, isObjectId } from '../utils/db';
import { AppError } from '../middlewares/error';

export const categorySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    description: z.string().optional().nullable(),
  }),
});

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cats = await collections.categories().find({}).toArray();
    // Count cakes per category (document-based count instead of SQL _count)
    const categories = await Promise.all(
      cats.map(async (c) => {
        const count = await collections.cakes().countDocuments({ categoryId: c._id });
        return { ...normalizeId(c), _count: { cakes: count } };
      })
    );
    res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  const { name, description } = req.body;
  const slug = slugify(name);

  try {
    const existing = await collections.categories().findOne({ $or: [{ name }, { slug }] });

    if (existing) {
      return next(new AppError('Category with this name or slug already exists', 400));
    }

    const result = await collections.categories().insertOne({ name, slug, description: description ?? null });
    const category = normalizeId({ _id: result.insertedId, name, slug, description: description ?? null });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    if (!isObjectId(id)) return next(new AppError('Invalid category id', 400));
    const existing = await collections.categories().findOne({ _id: toObjectId(id) });
    if (!existing) {
      return next(new AppError('Category not found', 404));
    }

    const slug = name ? slugify(name) : existing.slug;
    if (name && name !== existing.name) {
      const duplicate = await collections.categories().findOne({ $or: [{ name }, { slug }] });
      if (duplicate && duplicate._id.toString() !== id) {
        return next(new AppError('Category name already taken', 400));
      }
    }

    await collections.categories().updateOne(
      { _id: toObjectId(id) },
      { $set: { name: name ?? existing.name, slug, description: description ?? existing.description } }
    );

    const category = await collections.categories().findOne({ _id: toObjectId(id) });

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      category: normalizeId(category!),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    if (!isObjectId(id)) return next(new AppError('Invalid category id', 400));
    const existing = await collections.categories().findOne({ _id: toObjectId(id) });
    if (!existing) {
      return next(new AppError('Category not found', 404));
    }

    await collections.categories().deleteOne({ _id: toObjectId(id) });

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
