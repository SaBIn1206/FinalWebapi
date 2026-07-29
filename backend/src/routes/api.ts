import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema
} from '../controllers/authController';
import {
  forgotPassword,
  resetPassword,
  forgotPasswordSchema,
  resetPasswordSchema
} from '../controllers/passwordResetController';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductSchema,
  updateProductSchema
} from '../controllers/productController';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  categorySchema
} from '../controllers/categoryController';
import {
  getCart,
  addToCart,
  updateCartItem,
  deleteCartItem,
  addToCartSchema,
  updateCartItemSchema
} from '../controllers/cartController';
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  cancelOrder,
  createOrderSchema,
  updateOrderSchema
} from '../controllers/orderController';
import {
  getCombos,
  createCombo,
  updateCombo,
  deleteCombo,
  comboSchema
} from '../controllers/comboController';
import {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  couponSchema
} from '../controllers/couponController';
import {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
  reviewSchema
} from '../controllers/reviewController';
import {
  getDashboardStats,
  getAdminUsers,
  getAdminUserById,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  getCakeAnalytics,
  getComboAnalytics,
  getComparisonAnalytics,
  adminUserSchema
} from '../controllers/adminController';
import {
  createCustomCake,
  getMyCustomCakes,
  updateCustomCake,
  deleteCustomCake,
  customCakeSchema
} from '../controllers/customCakeController';
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  addressSchema,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getNotifications,
  markNotificationRead
} from '../controllers/customerController';
import { uploadSingleImage } from '../controllers/uploadController';

const router = Router();

// --- Authentication ---
router.post('/auth/register', validate(registerSchema), register);
router.post('/auth/login', validate(loginSchema), login);
router.post('/auth/logout', logout);
router.post('/auth/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/auth/reset-password', validate(resetPasswordSchema), resetPassword);
router.get('/auth/profile', authenticate as any, getProfile as any);
router.put('/auth/profile', authenticate as any, validate(updateProfileSchema), updateProfile as any);
router.put('/auth/change-password', authenticate as any, validate(changePasswordSchema), changePassword as any);

// --- Products (primary catalog — ADMIN managed) ---
router.get('/products', getProducts);
router.get('/products/:id', getProductById);
router.post('/products', authenticate as any, authorize('ADMIN'), validate(createProductSchema), createProduct);
router.put('/products/:id', authenticate as any, authorize('ADMIN'), validate(updateProductSchema), updateProduct);
router.delete('/products/:id', authenticate as any, authorize('ADMIN'), deleteProduct);

// --- Custom Cakes (user-submitted designs — any authenticated user) ---
router.post('/custom-cakes', authenticate as any, validate(customCakeSchema), createCustomCake);
router.get('/custom-cakes/mine', authenticate as any, getMyCustomCakes);
router.put('/custom-cakes/:id', authenticate as any, validate(customCakeSchema.partial()), updateCustomCake);
router.delete('/custom-cakes/:id', authenticate as any, deleteCustomCake);

// --- Categories ---
router.get('/categories', getCategories);
router.post('/categories', authenticate as any, authorize('ADMIN'), validate(categorySchema), createCategory);
router.put('/categories/:id', authenticate as any, authorize('ADMIN'), validate(categorySchema), updateCategory);
router.delete('/categories/:id', authenticate as any, authorize('ADMIN'), deleteCategory);

// --- Cart ---
router.get('/cart', authenticate as any, getCart as any);
router.post('/cart', authenticate as any, validate(addToCartSchema), addToCart as any);
router.put('/cart/:id', authenticate as any, validate(updateCartItemSchema), updateCartItem as any);
router.delete('/cart/:id', authenticate as any, deleteCartItem as any);

// --- Orders ---
router.get('/orders', authenticate as any, getOrders as any);
router.get('/orders/:id', authenticate as any, getOrderById as any);
router.post('/orders', authenticate as any, validate(createOrderSchema), createOrder as any);
router.put('/orders/:id', authenticate as any, authorize('ADMIN'), validate(updateOrderSchema), updateOrder);
router.delete('/orders/:id/cancel', authenticate as any, cancelOrder as any); // Customer cancels, admin can cancel

// --- Combo Offers ---
router.get('/combos', getCombos);
router.post('/combos', authenticate as any, authorize('ADMIN'), validate(comboSchema), createCombo);
router.put('/combos/:id', authenticate as any, authorize('ADMIN'), validate(comboSchema), updateCombo);
router.delete('/combos/:id', authenticate as any, authorize('ADMIN'), deleteCombo);

// --- Coupons ---
router.get('/coupons', authenticate as any, authorize('ADMIN'), getCoupons);
router.post('/coupons', authenticate as any, authorize('ADMIN'), validate(couponSchema), createCoupon);
router.post('/coupons/validate', validateCoupon); // Customer validates coupon
router.put('/coupons/:id', authenticate as any, authorize('ADMIN'), validate(couponSchema), updateCoupon);
router.delete('/coupons/:id', authenticate as any, authorize('ADMIN'), deleteCoupon);

// --- Reviews ---
router.get('/reviews', getReviews as any);
router.post('/reviews', authenticate as any, validate(reviewSchema), createReview as any);
router.put('/reviews/:id', authenticate as any, validate(reviewSchema.partial()), updateReview as any);
router.delete('/reviews/:id', authenticate as any, deleteReview as any);

// --- Admin (Dashboard & Users) ---
router.get('/admin/stats', authenticate as any, authorize('ADMIN'), getDashboardStats);
router.get('/admin/analytics/cakes', authenticate as any, authorize('ADMIN'), getCakeAnalytics);
router.get('/admin/analytics/combos', authenticate as any, authorize('ADMIN'), getComboAnalytics);
router.get('/admin/analytics/comparison', authenticate as any, authorize('ADMIN'), getComparisonAnalytics);
router.get('/admin/users', authenticate as any, authorize('ADMIN'), getAdminUsers);
router.get('/admin/users/:id', authenticate as any, authorize('ADMIN'), getAdminUserById);
router.post('/admin/users', authenticate as any, authorize('ADMIN'), validate(adminUserSchema), createAdminUser);
router.put('/admin/users/:id', authenticate as any, authorize('ADMIN'), validate(adminUserSchema.partial()), updateAdminUser);
router.delete('/admin/users/:id', authenticate as any, authorize('ADMIN'), deleteAdminUser);

// --- Customer Addresses ---
router.get('/addresses', authenticate as any, getAddresses as any);
router.post('/addresses', authenticate as any, validate(addressSchema), createAddress as any);
router.put('/addresses/:id', authenticate as any, validate(addressSchema), updateAddress as any);
router.delete('/addresses/:id', authenticate as any, deleteAddress as any);

// --- Customer Wishlist ---
router.get('/wishlist', authenticate as any, getWishlist as any);
router.post('/wishlist', authenticate as any, addToWishlist as any);
router.delete('/wishlist/:cakeId', authenticate as any, removeFromWishlist as any);

// --- Customer Notifications ---
router.get('/notifications', authenticate as any, getNotifications as any);
router.put('/notifications/:id/read', authenticate as any, markNotificationRead as any);

// --- Image Upload ---
router.post('/upload', authenticate as any, uploadSingleImage);

export default router;
