import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { collections, toObjectId, normalizeId } from '../utils/db';
import { AppError } from '../middlewares/error';
import { AuthRequest } from '../middlewares/auth';

export const addToCartSchema = z.object({
  body: z.object({
    cakeId: z.string().min(1, 'Cake ID is required'),
    comboId: z.string().optional().nullable(),
    quantity: z.number().int().min(1).default(1),
    weight: z.number().min(0.1).default(1.0),
    flavor: z.string().default('Standard'),
    spongeType: z.string().default('Standard'),
    creamType: z.string().default('Standard'),
    writingMessage: z.string().optional().nullable(),
    customImage: z.string().optional().nullable(),
    candle: z.boolean().default(false),
    knife: z.boolean().default(false),
    greetingCard: z.boolean().default(false),
    giftWrap: z.boolean().default(false),
  }),
});

export const updateCartItemSchema = z.object({
  body: z.object({
    quantity: z.number().int().min(1),
  }),
});

async function getOrCreateCart(userId: string) {
  let cart = await collections.carts().findOne({ userId: toObjectId(userId) });
  if (!cart) {
    const r = await collections.carts().insertOne({
      userId: toObjectId(userId),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    cart = await collections.carts().findOne({ _id: r.insertedId })!;
  }
  return cart;
}

async function populateCartItems(cartId: any) {
  const items = await collections.cartItems().find({ cartId }).toArray();
  return Promise.all(
    items.map(async (item) => {
      const cake = await collections.cakes().findOne({ _id: toObjectId(item.cakeId.toString()) });
      let cakePopulated: any = null;
      if (cake) {
        const [images, variants] = await Promise.all([
          collections.cakeImages().find({ cakeId: cake._id }).toArray(),
          collections.cakeVariants().find({ cakeId: cake._id }).toArray(),
        ]);
        cakePopulated = {
          ...normalizeId(cake),
          images: images.map(normalizeId),
          variants: variants.map(normalizeId),
        };
      }
      return { ...normalizeId(item), cake: cakePopulated };
    })
  );
}

export const getCart = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next(new AppError('User not authenticated', 401));
    const cart = await getOrCreateCart(req.user.id);
    const items = await populateCartItems(cart!._id);
    res.status(200).json({
      success: true,
      cart: { ...normalizeId(cart!), items },
    });
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const {
    cakeId,
    comboId,
    quantity,
    weight,
    flavor,
    spongeType,
    creamType,
    writingMessage,
    customImage,
    candle,
    knife,
    greetingCard,
    giftWrap,
  } = req.body;

  try {
    if (!req.user) return next(new AppError('User not authenticated', 401));

    if (!cakeId && !comboId) {
      return next(new AppError('Either cakeId or comboId is required', 400));
    }

    const cart = await getOrCreateCart(req.user.id);

    let item;
    if (comboId) {
      const r = await collections.cartItems().insertOne({
        cartId: cart!._id,
        cakeId: cakeId ? toObjectId(cakeId) : null,
        comboId: toObjectId(comboId),
        quantity,
        weight,
        flavor,
        spongeType,
        creamType,
        writingMessage: writingMessage || null,
        customImage: customImage || null,
        candle,
        knife,
        greetingCard,
        giftWrap,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      item = await collections.cartItems().findOne({ _id: r.insertedId });
    } else {
      const cake = await collections.cakes().findOne({ _id: toObjectId(cakeId) });
      if (!cake) {
        return next(new AppError('Cake product not found', 404));
      }

      const existingItem = await collections.cartItems().findOne({
        cartId: cart!._id,
        cakeId: toObjectId(cakeId),
        weight,
        flavor: flavor.toLowerCase(),
        spongeType,
        creamType,
        writingMessage: writingMessage || null,
        customImage: customImage || null,
        candle,
        knife,
        greetingCard,
        giftWrap,
      });

      if (existingItem) {
        await collections.cartItems().updateOne(
          { _id: existingItem._id },
          { $set: { quantity: existingItem.quantity + quantity, updatedAt: new Date() } }
        );
        item = await collections.cartItems().findOne({ _id: existingItem._id });
      } else {
        const r = await collections.cartItems().insertOne({
          cartId: cart!._id,
          cakeId: toObjectId(cakeId),
          comboId: null,
          quantity,
          weight,
          flavor,
          spongeType,
          creamType,
          writingMessage: writingMessage || null,
          customImage: customImage || null,
          candle,
          knife,
          greetingCard,
          giftWrap,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        item = await collections.cartItems().findOne({ _id: r.insertedId });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      item: normalizeId(item!),
    });
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { quantity } = req.body;

  try {
    if (!req.user) return next(new AppError('User not authenticated', 401));
    if (!toObjectId(id)) return next(new AppError('Cart item not found or unauthorized', 404));

    const item = await collections.cartItems().findOne({ _id: toObjectId(id) });
    if (!item) {
      return next(new AppError('Cart item not found or unauthorized', 404));
    }

    const cart = await collections.carts().findOne({ _id: item.cartId });
    if (!cart || cart.userId.toString() !== req.user.id) {
      return next(new AppError('Cart item not found or unauthorized', 404));
    }

    await collections.cartItems().updateOne(
      { _id: toObjectId(id) },
      { $set: { quantity, updatedAt: new Date() } }
    );
    const updated = await collections.cartItems().findOne({ _id: toObjectId(id) });

    res.status(200).json({
      success: true,
      message: 'Cart quantity updated',
      item: normalizeId(updated!),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCartItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    if (!req.user) return next(new AppError('User not authenticated', 401));
    if (!toObjectId(id)) return next(new AppError('Cart item not found or unauthorized', 404));

    const item = await collections.cartItems().findOne({ _id: toObjectId(id) });
    if (!item) {
      return next(new AppError('Cart item not found or unauthorized', 404));
    }

    const cart = await collections.carts().findOne({ _id: item.cartId });
    if (!cart || cart.userId.toString() !== req.user.id) {
      return next(new AppError('Cart item not found or unauthorized', 404));
    }

    await collections.cartItems().deleteOne({ _id: toObjectId(id) });

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
    });
  } catch (error) {
    next(error);
  }
};
