import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { collections, toObjectId, normalizeId } from '../utils/db';
import { AppError } from '../middlewares/error';

export const comboSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    price: z.number().min(0, 'Price must be positive'),
    imageUrl: z.string().optional().nullable(),
    items: z.array(z.string()).min(1, 'At least one item required'),
    active: z.boolean().default(true),
  }),
});

export const getCombos = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const combos = await collections.combos().find({}).toArray();
    // `items` is a native document array — return as-is.
    res.status(200).json({
      success: true,
      combos: combos.map(normalizeId),
    });
  } catch (error) {
    next(error);
  }
};

export const createCombo = async (req: Request, res: Response, next: NextFunction) => {
  const { name, description, price, imageUrl, items, active } = req.body;

  try {
    const result = await collections.combos().insertOne({
      name,
      description,
      price,
      imageUrl: imageUrl ?? null,
      items,
      active: active !== undefined ? active : true,
    });

    const combo = normalizeId({ _id: result.insertedId, name, description, price, imageUrl, items, active });
    res.status(201).json({
      success: true,
      message: 'Combo offer created successfully',
      combo,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCombo = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { name, description, price, imageUrl, items, active } = req.body;

  try {
    if (!toObjectId(id)) return next(new AppError('Invalid combo id', 400));
    const existing = await collections.combos().findOne({ _id: toObjectId(id) });
    if (!existing) {
      return next(new AppError('Combo offer not found', 404));
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (items !== undefined) updateData.items = items;
    if (active !== undefined) updateData.active = active;

    await collections.combos().updateOne({ _id: toObjectId(id) }, { $set: updateData });
    const combo = await collections.combos().findOne({ _id: toObjectId(id) });

    res.status(200).json({
      success: true,
      message: 'Combo offer updated successfully',
      combo: normalizeId(combo!),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCombo = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    if (!toObjectId(id)) return next(new AppError('Invalid combo id', 400));
    const existing = await collections.combos().findOne({ _id: toObjectId(id) });
    if (!existing) {
      return next(new AppError('Combo offer not found', 404));
    }

    await collections.combos().deleteOne({ _id: toObjectId(id) });

    res.status(200).json({
      success: true,
      message: 'Combo offer deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
