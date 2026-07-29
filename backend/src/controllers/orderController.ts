import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { collections, toObjectId, normalizeId } from '../utils/db';
import { AppError } from '../middlewares/error';
import { AuthRequest } from '../middlewares/auth';

export const createOrderSchema = z.object({
  body: z.object({
    couponApplied: z.string().optional().nullable(),
    paymentMethod: z.enum(['COD', 'ESEWA', 'KHALTI', 'STRIPE', 'PAYPAL']),
    deliveryOption: z.enum(['STANDARD', 'SAME_DAY', 'MIDNIGHT', 'SCHEDULED']),
    deliveryName: z.string().min(2, 'Recipient name is required'),
    deliveryPhone: z.string().min(8, 'Phone number is required'),
    deliveryEmail: z.string().email('Email is required'),
    deliveryAddress: z.string().min(5, 'Delivery address is required'),
    deliveryCity: z.string().min(2, 'City is required'),
    deliveryDate: z.string().min(1, 'Delivery date is required'),
    deliveryTime: z.string().min(1, 'Delivery time is required'),
    deliveryLandmark: z.string().optional().nullable(),
    deliveryInstructions: z.string().optional().nullable(),
  }),
});

export const updateOrderSchema = z.object({
  body: z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'PREPARING', 'BAKING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']).optional(),
    paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional(),
  }),
});

async function populateOrder(order: any) {
  if (!order) return order;
  const [user, items] = await Promise.all([
    order.userId ? collections.users().findOne({ _id: toObjectId(order.userId.toString()) }, { projection: { password: 0 } }) : null,
    collections.orderItems().find({ orderId: order._id }).toArray(),
  ]);
  const populatedItems = await Promise.all(
    items.map(async (it) => {
      const cake = it.cakeId ? await collections.cakes().findOne({ _id: toObjectId(it.cakeId.toString()) }) : null;
      const combo = it.comboId ? await collections.combos().findOne({ _id: toObjectId(it.comboId.toString()) }) : null;
      return {
        ...normalizeId(it),
        cake: cake ? { ...normalizeId(cake), images: (await collections.cakeImages().find({ cakeId: cake._id }).toArray()).map(normalizeId) } : null,
        combo: combo ? normalizeId(combo) : null,
      };
    })
  );
  return {
    ...normalizeId(order),
    user: user ? { name: user.name, email: user.email } : undefined,
    items: populatedItems,
  };
}

export const getOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return next(new AppError('User not authenticated', 401));

    let filter: any = {};
    if (req.user.role !== 'ADMIN') {
      filter.userId = toObjectId(req.user.id);
    }

    const orders = await collections.orders().find(filter).sort({ createdAt: -1 }).toArray();
    const populated = await Promise.all(orders.map(populateOrder));

    res.status(200).json({
      success: true,
      orders: populated,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    if (!req.user) return next(new AppError('User not authenticated', 401));
    if (!toObjectId(id)) return next(new AppError('Order not found', 404));

    const order = await collections.orders().findOne({ _id: toObjectId(id) });
    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    if (order.userId.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return next(new AppError('Unauthorized access to order details', 403));
    }

    res.status(200).json({
      success: true,
      order: await populateOrder(order),
    });
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const {
    couponApplied,
    paymentMethod,
    deliveryOption,
    deliveryName,
    deliveryPhone,
    deliveryEmail,
    deliveryAddress,
    deliveryCity,
    deliveryDate,
    deliveryTime,
    deliveryLandmark,
    deliveryInstructions,
  } = req.body;

  try {
    if (!req.user) return next(new AppError('User not authenticated', 401));

    const cart = await collections.carts().findOne({ userId: toObjectId(req.user.id) });
    const cartItems = cart ? await collections.cartItems().find({ cartId: cart._id }).toArray() : [];

    if (!cart || cartItems.length === 0) {
      return next(new AppError('Your cart is empty', 400));
    }

    let subtotal = 0;
    const itemsData: any[] = [];

    for (const item of cartItems) {
      const cake = await collections.cakes().findOne({ _id: toObjectId(item.cakeId.toString()) });
      if (!cake) continue;

      const variants = await collections.cakeVariants().find({ cakeId: cake._id }).toArray();
      const matchingVariant = variants.find(
        (v) => v.weight === item.weight && v.flavor.toLowerCase() === item.flavor.toLowerCase()
      );
      const basePrice = cake.discountPrice || cake.price;
      const variantModifier = matchingVariant ? matchingVariant.priceModifier : 0.0;

      let accessoriesCost = 0;
      if (item.candle) accessoriesCost += 50.0;
      if (item.knife) accessoriesCost += 50.0;
      if (item.greetingCard) accessoriesCost += 150.0;
      if (item.giftWrap) accessoriesCost += 200.0;

      const singleItemPrice = basePrice + variantModifier + accessoriesCost;
      const totalItemPrice = singleItemPrice * item.quantity;
      subtotal += totalItemPrice;

      itemsData.push({
        cakeId: item.cakeId,
        comboId: item.comboId || null,
        quantity: item.quantity,
        price: singleItemPrice,
        weight: item.weight,
        flavor: item.flavor,
        spongeType: item.spongeType,
        creamType: item.creamType,
        writingMessage: item.writingMessage,
        customImage: item.customImage,
        candle: item.candle,
        knife: item.knife,
        greetingCard: item.greetingCard,
        giftWrap: item.giftWrap,
      });
    }

    let deliveryFee = 199.0;
    if (deliveryOption === 'SAME_DAY') deliveryFee = 499.0;
    else if (deliveryOption === 'MIDNIGHT') deliveryFee = 699.0;
    else if (deliveryOption === 'SCHEDULED') deliveryFee = 299.0;

    let discount = 0;
    if (couponApplied) {
      const coupon = await collections.coupons().findOne({ code: couponApplied.toUpperCase() });
      if (coupon && coupon.active && new Date() <= new Date(coupon.expiryDate)) {
        discount = (subtotal * coupon.discountPercentage) / 100;
        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
          discount = coupon.maxDiscount;
        }
      }
    }

    const tax = Math.round((subtotal - discount) * 0.1 * 100) / 100;
    const total = subtotal + deliveryFee + tax - discount;

    const orderResult = await collections.orders().insertOne({
      userId: toObjectId(req.user.id),
      status: 'PENDING',
      totalPrice: Math.round(total * 100) / 100,
      deliveryFee,
      tax,
      discount: Math.round(discount * 100) / 100,
      couponApplied: couponApplied ? couponApplied.toUpperCase() : null,
      paymentMethod,
      paymentStatus: 'PENDING',
      deliveryName,
      deliveryPhone,
      deliveryEmail,
      deliveryAddress,
      deliveryCity,
      deliveryDate,
      deliveryTime,
      deliveryLandmark: deliveryLandmark ?? null,
      deliveryInstructions: deliveryInstructions ?? null,
      deliveryOption,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    for (const it of itemsData) {
      await collections.orderItems().insertOne({ ...it, orderId: orderResult.insertedId });
    }

    // Reduce stock atomically
    // for (const item of cartItems) {
    //   const updateResult = await collections.cakes().findOneAndUpdate(
    //     { _id: toObjectId(item.cakeId.toString()), stock: { $gte: item.quantity } },
    //     { $inc: { stock: -item.quantity } }
    //   );
    //   if (!updateResult || !updateResult.value) {
    //     return next(new AppError(`Insufficient stock for one or more items. Please remove ${item.cakeId} and try again.`, 400));
    //   }
    // }
    // Reduce stock atomically
for (const item of cartItems) {
  const cake = await collections.cakes().findOne({
    _id: toObjectId(item.cakeId.toString()),
  });

  if (!cake) {
    return next(new AppError(`Cake not found: ${item.cakeId}`, 404));
  }

  console.log("================================");
  console.log({
    cakeId: item.cakeId.toString(),
    cakeName: cake.name,
    availableStock: cake.stock,
    requestedQuantity: item.quantity,
  });
  console.log("================================");

  if (cake.stock < item.quantity) {
    return next(
      new AppError(
        `Insufficient stock for "${cake.name}". Available: ${cake.stock}, Requested: ${item.quantity}`,
        400
      )
    );
  }

  const result = await collections.cakes().updateOne(
    {
      _id: cake._id,
      stock: { $gte: item.quantity },
    },
    {
      $inc: { stock: -item.quantity },
    }
  );

  console.log("Update Result:", result);

  if (result.modifiedCount === 0) {
    return next(
      new AppError(
        `Failed to update stock for "${cake.name}".`,
        400
      )
    );
  }
}

    // Clear cart
    await collections.cartItems().deleteMany({ cartId: cart._id });

    // Notification
    await collections.notifications().insertOne({
      userId: toObjectId(req.user.id),
      title: 'Order Placed successfully',
      message: `Your order #${orderResult.insertedId.toString().slice(0, 8)} has been placed. Payment Method: ${paymentMethod}.`,
      read: false,
      createdAt: new Date(),
    });

    const newOrder = await collections.orders().findOne({ _id: orderResult.insertedId });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: await populateOrder(newOrder!),
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrder = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { status, paymentStatus } = req.body;

  try {
    if (!toObjectId(id)) return next(new AppError('Order not found', 404));
    const existing = await collections.orders().findOne({ _id: toObjectId(id) });
    if (!existing) {
      return next(new AppError('Order not found', 404));
    }

    const updateData: any = { updatedAt: new Date() };
    if (status !== undefined) updateData.status = status;
    if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;

    await collections.orders().updateOne({ _id: toObjectId(id) }, { $set: updateData });

    if (status && status !== existing.status) {
      await collections.notifications().insertOne({
        userId: existing.userId,
        title: 'Order Status Update',
        message: `Your order #${existing._id.toString().slice(0, 8)} status is now: ${status}.`,
        read: false,
        createdAt: new Date(),
      });
    }

    const updated = await collections.orders().findOne({ _id: toObjectId(id) });
    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      order: await populateOrder(updated!),
    });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    if (!req.user) return next(new AppError('User not authenticated', 401));
    if (!toObjectId(id)) return next(new AppError('Order not found', 404));

    const order = await collections.orders().findOne({ _id: toObjectId(id) });
    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    if (order.userId.toString() !== req.user.id && req.user.role !== 'ADMIN') {
      return next(new AppError('Unauthorized', 403));
    }

    if (order.status !== 'PENDING' && req.user.role !== 'ADMIN') {
      return next(new AppError('Order cannot be cancelled once it is confirmed or baking', 400));
    }

    await collections.orders().updateOne(
      { _id: toObjectId(id) },
      { $set: { status: 'CANCELLED', paymentStatus: order.paymentStatus === 'PAID' ? 'REFUNDED' : 'PENDING', updatedAt: new Date() } }
    );

    const items = await collections.orderItems().find({ orderId: toObjectId(id) }).toArray();
    for (const item of items) {
      if (item.cakeId) {
        await collections.cakes().updateOne(
          { _id: toObjectId(item.cakeId.toString()) },
          { $inc: { stock: item.quantity } }
        );
      }
    }

    const updated = await collections.orders().findOne({ _id: toObjectId(id) });
    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order: await populateOrder(updated!),
    });
  } catch (error) {
    next(error);
  }
};
