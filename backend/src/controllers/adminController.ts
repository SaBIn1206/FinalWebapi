import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { collections, toObjectId, normalizeId, isObjectId } from '../utils/db';
import { AppError } from '../middlewares/error';

// Zod schemas for user management
export const adminUserSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
    role: z.enum(['ADMIN', 'CUSTOMER']).default('CUSTOMER'),
  }),
});

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [totalUsers, totalProducts, totalOrders, pendingOrders, deliveredOrders] = await Promise.all([
      collections.users().countDocuments({}),
      collections.cakes().countDocuments({}),
      collections.orders().countDocuments({}),
      collections.orders().countDocuments({ status: 'PENDING' }),
      collections.orders().countDocuments({ status: 'DELIVERED' }),
    ]);

    const paidOrders = await collections.orders().find({ paymentStatus: 'PAID' }, { projection: { totalPrice: 1 } }).toArray();
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalPrice, 0);

    // Group by status using Mongo aggregation
    const statusAgg = await collections.orders().aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$totalPrice' } } },
    ]).toArray();

    const statusCounts = statusAgg.map((s) => ({
      status: s._id,
      count: s.count,
      revenue: s.revenue || 0,
    }));

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        pendingOrders,
        deliveredOrders,
        statusCounts,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCakeAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Top cakes by quantity sold
    const topAgg = await collections.orderItems().aggregate([
      { $group: { _id: '$cakeId', quantity: { $sum: '$quantity' }, price: { $sum: '$price' } } },
      { $sort: { quantity: -1 } },
      { $limit: 10 },
    ]).toArray();

    const cakeMap = new Map<string, any>();
    for (const item of topAgg) {
      const cake = await collections.cakes().findOne({ _id: toObjectId(item._id.toString()) }, { projection: { name: 1, categoryId: 1 } });
      const category = cake?.categoryId ? await collections.categories().findOne({ _id: toObjectId(cake.categoryId.toString()) }, { projection: { name: 1 } }) : null;
      if (cake) {
        cakeMap.set(item._id.toString(), {
          id: cake._id.toString(),
          name: cake.name,
          category: category ? { name: category.name } : { name: 'Uncategorized' },
          unitsSold: item.quantity || 0,
          revenue: item.price || 0,
        });
      }
    }

    const categoryBreakdown = await collections.orderItems().aggregate([
      { $lookup: { from: 'Cake', localField: 'cakeId', foreignField: '_id', as: 'cake' } },
      { $unwind: { path: '$cake', preserveNullAndEmptyArrays: true } },
      { $lookup: { from: 'Category', localField: 'cake.categoryId', foreignField: '_id', as: 'cat' } },
      { $unwind: { path: '$cat', preserveNullAndEmptyArrays: true } },
      { $group: { _id: { $ifNull: ['$cat.name', 'Uncategorized'] }, revenue: { $sum: '$price' }, units: { $sum: '$quantity' } } },
    ]).toArray();

    const salesTrendAgg = await collections.orderItems().aggregate([
      { $lookup: { from: 'Order', localField: 'orderId', foreignField: '_id', as: 'order' } },
      { $unwind: '$order' },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$order.createdAt' } },
          revenue: { $sum: { $multiply: ['$price', '$quantity'] } },
          orders: { $sum: '$quantity' },
        },
      },
      { $sort: { _id: 1 } },
    ]).toArray();

    res.status(200).json({
      success: true,
      analytics: {
        topCakes: Array.from(cakeMap.values()).sort((a, b) => b.unitsSold - a.unitsSold),
        categoryBreakdown: categoryBreakdown.map((c) => ({ name: c._id, revenue: c.revenue, units: c.units })),
        salesTrend: salesTrendAgg.map((t) => ({ date: t._id, revenue: t.revenue, orders: t.orders })),
        totalCakeRevenue: categoryBreakdown.reduce((a, c) => a + c.revenue, 0),
        totalCakeOrders: topAgg.reduce((sum, item) => sum + (item.quantity || 0), 0),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getComboAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const comboOrderItems = await collections.orderItems().find({ comboId: { $ne: null } }).toArray();

    const comboMap = new Map<string, any>();
    for (const item of comboOrderItems) {
      const comboId = item.comboId.toString();
      const existing = comboMap.get(comboId) || { id: comboId, name: '', price: 0, orders: 0, units: 0, revenue: 0 };
      const combo = await collections.combos().findOne({ _id: toObjectId(comboId) });
      existing.name = combo?.name || existing.name;
      existing.price = combo?.price || existing.price;
      existing.orders += 1;
      existing.units += item.quantity;
      existing.revenue += item.price * item.quantity;
      comboMap.set(comboId, existing);
    }

    const combos = Array.from(comboMap.values()).sort((a, b) => b.revenue - a.revenue);
    const totalComboRevenue = combos.reduce((sum, c) => sum + c.revenue, 0);
    const totalComboOrders = combos.reduce((sum, c) => sum + c.orders, 0);

    const trendMap = new Map<string, { revenue: number; orders: number }>();
    for (const item of comboOrderItems) {
      const order = await collections.orders().findOne({ _id: toObjectId(item.orderId.toString()) });
      const date = order?.createdAt ? order.createdAt.toISOString().split('T')[0] : 'unknown';
      const current = trendMap.get(date) || { revenue: 0, orders: 0 };
      current.revenue += item.price * item.quantity;
      current.orders += item.quantity;
      trendMap.set(date, current);
    }

    const trendData = Array.from(trendMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    res.status(200).json({
      success: true,
      analytics: {
        combos,
        totalComboRevenue,
        totalComboOrders,
        trendData,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getComparisonAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [cakeItems, comboItems, allOrders] = await Promise.all([
      collections.orderItems().find({ comboId: null }).toArray(),
      collections.orderItems().find({ comboId: { $ne: null } }).toArray(),
      collections.orders().find({}, { projection: { totalPrice: 1, createdAt: 1, status: 1 } }).toArray(),
    ]);

    const cakeRevenue = cakeItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const comboRevenue = comboItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalRevenue = cakeRevenue + comboRevenue;

    const cakeShare = totalRevenue > 0 ? (cakeRevenue / totalRevenue) * 100 : 0;
    const comboShare = totalRevenue > 0 ? (comboRevenue / totalRevenue) * 100 : 0;

    const trendMap = new Map<string, { cake: number; combo: number; total: number }>();
    const addToTrend = async (items: any[], key: 'cake' | 'combo') => {
      for (const item of items) {
        const order = await collections.orders().findOne({ _id: toObjectId(item.orderId.toString()) });
        const date = order?.createdAt ? order.createdAt.toISOString().split('T')[0] : 'unknown';
        const current = trendMap.get(date) || { cake: 0, combo: 0, total: 0 };
        current[key] += item.price * item.quantity;
        current.total += item.price * item.quantity;
        trendMap.set(date, current);
      }
    };
    await addToTrend(cakeItems, 'cake');
    await addToTrend(comboItems, 'combo');

    const comparisonTrend = Array.from(trendMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const cakeOrders = allOrders.filter((o) => o.status !== 'CANCELLED').length;

    res.status(200).json({
      success: true,
      comparison: {
        cakeRevenue,
        comboRevenue,
        totalRevenue,
        cakeShare: Math.round(cakeShare * 100) / 100,
        comboShare: Math.round(comboShare * 100) / 100,
        cakeUnits: cakeItems.reduce((sum, item) => sum + item.quantity, 0),
        comboUnits: comboItems.reduce((sum, item) => sum + item.quantity, 0),
        trend: comparisonTrend,
        cakeOrders,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Admin Users CRUD
export const getAdminUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await collections.users().find({}, { projection: { password: 0 } }).sort({ createdAt: -1 }).toArray();

    const usersWithCounts = await Promise.all(
      users.map(async (u) => ({
        ...normalizeId(u),
        _count: { orders: await collections.orders().countDocuments({ userId: u._id }) },
      }))
    );

    res.status(200).json({
      success: true,
      users: usersWithCounts,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminUserById = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    if (!isObjectId(id)) return next(new AppError('User not found', 404));
    const user = await collections.users().findOne({ _id: toObjectId(id) }, { projection: { password: 0 } });
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const addresses = await collections.addresses().find({ userId: toObjectId(id) }).toArray();
    const orders = await collections.orders().find({ userId: toObjectId(id) }).sort({ createdAt: -1 }).toArray();

    res.status(200).json({
      success: true,
      user: {
        ...normalizeId(user),
        addresses: addresses.map(normalizeId),
        orders: orders.map(normalizeId),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createAdminUser = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, role } = req.body;

  try {
    const existing = await collections.users().findOne({ email });
    if (existing) {
      return next(new AppError('Email already in use', 400));
    }

    const defaultPassword = password || 'ChangeMe123!';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const result = await collections.users().insertOne({
      name,
      email,
      password: hashedPassword,
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await collections.carts().insertOne({
      userId: result.insertedId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const user = normalizeId({ _id: result.insertedId, name, email, role, createdAt: new Date() });
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAdminUser = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { name, email, password, role } = req.body;

  try {
    if (!isObjectId(id)) return next(new AppError('User not found', 404));
    const existing = await collections.users().findOne({ _id: toObjectId(id) });
    if (!existing) {
      return next(new AppError('User not found', 404));
    }

    if (email && email !== existing.email) {
      const duplicate = await collections.users().findOne({ email });
      if (duplicate) {
        return next(new AppError('Email already in use', 400));
      }
    }

    const updateData: any = { updatedAt: new Date() };
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    await collections.users().updateOne({ _id: toObjectId(id) }, { $set: updateData });
    const user = await collections.users().findOne({ _id: toObjectId(id) }, { projection: { password: 0 } });

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: normalizeId(user!),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAdminUser = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    if (!isObjectId(id)) return next(new AppError('User not found', 404));
    const existing = await collections.users().findOne({ _id: toObjectId(id) });
    if (!existing) {
      return next(new AppError('User not found', 404));
    }

    if (existing.role === 'ADMIN') {
      const adminCount = await collections.users().countDocuments({ role: 'ADMIN' });
      if (adminCount <= 1) {
        return next(new AppError('Cannot delete the last admin account', 400));
      }
    }

    await collections.users().deleteOne({ _id: toObjectId(id) });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
