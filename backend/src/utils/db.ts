import { MongoClient, Db, Collection, ObjectId } from 'mongodb';

const uri = process.env.DATABASE_URL || 'mongodb://localhost:27017/bakeryhub';
const dbName = uri.split('/').pop()?.split('?')[0] || 'bakeryhub';

const client = new MongoClient(uri);

let _db: Db | null = null;

export async function connectDB(): Promise<Db> {
  if (_db) return _db;
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('MongoDB connection timeout')), 3000)
  );
  await Promise.race([client.connect(), timeoutPromise]);
  _db = client.db(dbName);
  return _db;
}

export function getDb(): Db {
  if (!_db) {
    throw new Error('Database not connected. Call connectDB() first.');
  }
  return _db;
}

export async function closeDB(): Promise<void> {
  await client.close();
  _db = null;
}

// --- Collection accessors ---
export const collections = {
  users: (): Collection => getDb().collection('User'),
  addresses: (): Collection => getDb().collection('Address'),
  categories: (): Collection => getDb().collection('Category'),
  cakes: (): Collection => getDb().collection('Cake'),
  cakeImages: (): Collection => getDb().collection('CakeImage'),
  cakeVariants: (): Collection => getDb().collection('CakeVariant'),
  carts: (): Collection => getDb().collection('Cart'),
  cartItems: (): Collection => getDb().collection('CartItem'),
  orders: (): Collection => getDb().collection('Order'),
  orderItems: (): Collection => getDb().collection('OrderItem'),
  coupons: (): Collection => getDb().collection('Coupon'),
  combos: (): Collection => getDb().collection('ComboOffer'),
  reviews: (): Collection => getDb().collection('Review'),
  wishlists: (): Collection => getDb().collection('Wishlist'),
  notifications: (): Collection => getDb().collection('Notification'),
  passwordResets: (): Collection => getDb().collection('PasswordReset'),
};

// --- ObjectId helpers ---
export const toObjectId = (id: string): ObjectId => new ObjectId(id);
export const isObjectId = (id: string): boolean => ObjectId.isValid(id);

// Mongo stores _id as ObjectId; our API historically used string ids.
// These helpers normalize documents in/out.
export function normalizeId<T extends Record<string, any>>(doc: T): any {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return { id: _id?.toString(), ...rest };
}

export function serializeDoc<T extends Record<string, any>>(doc: T): any {
  return normalizeId(doc);
}

export default { connectDB, getDb, closeDB, collections, toObjectId, isObjectId, normalizeId };
