import bcrypt from 'bcryptjs';
import { connectDB, closeDB, collections, toObjectId } from '../src/utils/db';

async function main() {
  await connectDB();
  const db = collections;

  console.log('Clearing database...');
  const colls = [
    db.passwordResets(), db.notifications(), db.orderItems(), db.orders(), db.cartItems(), db.carts(),
    db.wishlists(), db.reviews(), db.cakeImages(), db.cakeVariants(), db.cakes(),
    db.addresses(), db.combos(), db.coupons(), db.categories(), db.users(),
  ];
  for (const c of colls) {
    await c.deleteMany({});
  }

  console.log('Seeding roles and users...');
  const adminPasswordHash = await bcrypt.hash('AdminPassword123', 10);
  const customerPasswordHash = await bcrypt.hash('CustomerPassword123', 10);

  const adminRes = await db.users().insertOne({
    name: 'Admin Hub',
    email: 'admin@bakeryhub.com',
    password: adminPasswordHash,
    role: 'ADMIN',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  await db.carts().insertOne({ userId: adminRes.insertedId, createdAt: new Date(), updatedAt: new Date() });

  const customerRes = await db.users().insertOne({
    name: 'Sabina Shrestha',
    email: 'customer@bakeryhub.com',
    password: customerPasswordHash,
    role: 'CUSTOMER',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  await db.carts().insertOne({ userId: customerRes.insertedId, createdAt: new Date(), updatedAt: new Date() });

  const customer = { id: customerRes.insertedId };

  await db.addresses().insertOne({
    userId: customerRes.insertedId,
    fullName: 'John Doe',
    phone: '9841234567',
    streetAddress: '123 Sweet Lane',
    city: 'Kathmandu',
    landmark: 'Near Chocolate Tower',
    isDefault: true,
  });

  console.log('Seeding categories...');
  const categoriesData = [
    { name: 'Birthday Cakes', slug: 'birthday-cakes', description: 'Make birthdays special with our curated range of birthday cakes.' },
    { name: 'Anniversary Cakes', slug: 'anniversary-cakes', description: 'Celebrate years of love and companionship.' },
    { name: 'Wedding Cakes', slug: 'wedding-cakes', description: 'Grand multi-tiered cakes designed for your perfect day.' },
    { name: 'Chocolate Cakes', slug: 'chocolate-cakes', description: 'For the absolute chocolate lovers.' },
    { name: 'Red Velvet Cakes', slug: 'red-velvet-cakes', description: 'Classic red velvet layers with rich cream cheese frosting.' },
    { name: 'Cheesecakes', slug: 'cheesecakes', description: 'Rich, smooth, and creamy cheesecakes.' },
    { name: 'Cupcakes', slug: 'cupcakes', description: 'Bite-sized happiness in various flavors.' },
  ];

  const categoriesMap: Record<string, any> = {};
  for (const cat of categoriesData) {
    const r = await db.categories().insertOne(cat);
    categoriesMap[cat.slug] = r.insertedId;
  }

  console.log('Seeding cakes...');
  const cakesData = [
    {
      name: 'Gourmet Chocolate Fudge Cake',
      description: 'A decadent chocolate cake covered in smooth chocolate fudge frosting. Perfect for chocolate lovers.',
      price: 750.0,
      discountPrice: 699.0,
      ingredients: 'Cocoa powder, flour, sugar, butter, buttermilk, chocolate chips',
      prepTime: 12,
      stock: 15,
      slug: 'chocolate-cakes',
      images: ['https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop'],
      variants: [
        { weight: 1.0, flavor: 'Chocolate Fudge', priceModifier: 0.0 },
        { weight: 2.0, flavor: 'Chocolate Fudge', priceModifier: 550.0 },
        { weight: 1.0, flavor: 'Dark Chocolate', priceModifier: 120.0 },
      ],
    },
    {
      name: 'Classic Red Velvet Dream',
      description: 'Velvety red sponge cake layered with rich cream cheese frosting and fine crumbs.',
      price: 850.0,
      discountPrice: 799.0,
      ingredients: 'Red food coloring, buttermilk, vinegar, cream cheese, butter',
      prepTime: 24,
      stock: 8,
      slug: 'red-velvet-cakes',
      images: ['https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?w=800&auto=format&fit=crop'],
      variants: [
        { weight: 1.0, flavor: 'Red Velvet', priceModifier: 0.0 },
        { weight: 2.0, flavor: 'Red Velvet', priceModifier: 620.0 },
      ],
    },
    {
      name: 'New York Baked Cheesecake',
      description: 'Rich, dense, and creamy baked cheesecake with a crunchy graham cracker crust.',
      price: 950.0,
      discountPrice: null,
      ingredients: 'Cream cheese, graham crackers, heavy cream, sugar, eggs, sour cream',
      prepTime: 36,
      stock: 5,
      slug: 'cheesecakes',
      images: ['https://images.unsplash.com/photo-1535141192574-5d4897c13636?w=800&auto=format&fit=crop'],
      variants: [
        { weight: 1.0, flavor: 'Classic Baked', priceModifier: 0.0 },
        { weight: 1.5, flavor: 'Blueberry Swirl', priceModifier: 280.0 },
      ],
    },
    {
      name: 'Princess Strawberry Birthday Cake',
      description: 'A beautiful light pink vanilla cake filled with fresh strawberries and sweet vanilla whipped cream.',
      price: 800.0,
      discountPrice: 749.0,
      ingredients: 'Fresh strawberries, organic flour, vanilla extract, whipped cream',
      prepTime: 18,
      stock: 12,
      slug: 'birthday-cakes',
      images: ['https://images.unsplash.com/photo-1535141192574-5d4897c13636?w=800&auto=format&fit=crop'],
      variants: [
        { weight: 1.0, flavor: 'Vanilla Strawberry', priceModifier: 0.0 },
        { weight: 2.0, flavor: 'Vanilla Strawberry', priceModifier: 650.0 },
        { weight: 1.0, flavor: 'Creamy Mango', priceModifier: 80.0 },
      ],
    },
    {
      name: 'Assorted Celebration Cupcakes',
      description: 'Box of 6 gourmet cupcakes: 2 Chocolate, 2 Red Velvet, and 2 Vanilla Bean sprinkles.',
      price: 450.0,
      discountPrice: null,
      ingredients: 'Organic flour, sugar, butter, frosting, sprinkles, cocoa powder',
      prepTime: 6,
      stock: 25,
      slug: 'cupcakes',
      images: ['https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=800&auto=format&fit=crop'],
      variants: [
        { weight: 0.5, flavor: 'Assorted Flavors', priceModifier: 0.0 },
      ],
    },
    {
      name: 'Grand Tiered Wedding Cake',
      description: 'Elegant 3-tier white wedding cake decorated with edible sugar flowers and vanilla buttercream.',
      price: 4500.0,
      discountPrice: 3999.0,
      ingredients: 'Buttercream, high-ratio flour, premium vanilla pod, edible flowers',
      prepTime: 48,
      stock: 3,
      slug: 'wedding-cakes',
      images: ['https://images.unsplash.com/photo-1527018601619-a508a2be00cd?w=800&auto=format&fit=crop'],
      variants: [
        { weight: 5.0, flavor: 'Vanilla Raspberry', priceModifier: 0.0 },
        { weight: 7.0, flavor: 'Almond Marzipan', priceModifier: 1500.0 },
      ],
    },
  ];

  for (const cake of cakesData) {
    const categoryId = categoriesMap[cake.slug];
    const r = await db.cakes().insertOne({
      name: cake.name,
      description: cake.description,
      price: cake.price,
      discountPrice: cake.discountPrice,
      ingredients: cake.ingredients,
      prepTime: cake.prepTime,
      stock: cake.stock,
      categoryId,
      rating: 5.0,
      isCustom: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    for (const url of cake.images) {
      await db.cakeImages().insertOne({ cakeId: r.insertedId, url });
    }
    for (const v of cake.variants) {
      await db.cakeVariants().insertOne({ cakeId: r.insertedId, weight: v.weight, flavor: v.flavor, priceModifier: v.priceModifier });
    }
  }

  console.log('Seeding coupons...');
  const coupons = [
    { code: 'WELCOME10', discountPercentage: 10.0, maxDiscount: 5.0, expiryDate: new Date('2027-12-31') },
    { code: 'BAKERY20', discountPercentage: 20.0, maxDiscount: 15.0, expiryDate: new Date('2027-12-31') },
    { code: 'FESTIVAL30', discountPercentage: 30.0, maxDiscount: null, expiryDate: new Date('2027-12-31') },
  ];
  for (const c of coupons) {
    await db.coupons().insertOne(c);
  }

  console.log('Seeding combo offers...');
  const combos = [
    { name: 'Birthday Special', description: 'A delightful birthday package: Premium Cake, Birthday Candle, and Spray Cake for a perfect celebration.', price: 1500.0, imageUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&auto=format&fit=crop', items: ['Cake', 'Birthday Candle', 'Spray Cake'] },
    { name: 'b00keys CAKE Delight', description: 'Exclusive b00keys CAKE combo with Birthday Candle and Birthday Crown to make the day unforgettable.', price: 2200.0, imageUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&auto=format&fit=crop', items: ['b00keys CAKE', 'Birthday Candle', 'Birthday Crown'] },
    { name: 'Premium Birthday Bundle', description: 'Ultimate celebration bundle featuring Cake, b00keys CAKE, Birthday Candle, Spray Cake, and Birthday Crown.', price: 4500.0, imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop', items: ['Cake', 'b00keys CAKE', 'Birthday Candle', 'Spray Cake', 'Birthday Crown'] },
  ];
  const comboResults = [];
  for (const combo of combos) {
    const r = await db.combos().insertOne(combo);
    comboResults.push({ id: r.insertedId, price: combo.price });
  }

  console.log('Seeding test orders for analytics...');
  const cakes = await db.cakes().find({}).limit(3).toArray();

  if (cakes.length > 0 && comboResults.length > 0) {
    const seedOrder = async (orderData: any, items: any[]) => {
      const r = await db.orders().insertOne(orderData);
      for (const it of items) {
        await db.orderItems().insertOne({ ...it, orderId: r.insertedId });
      }
      return r;
    };

    await seedOrder(
      {
        userId: customer.id, status: 'DELIVERED', totalPrice: 1500.0, paymentMethod: 'COD', paymentStatus: 'PAID',
        deliveryName: 'John Doe', deliveryPhone: '9841234567', deliveryEmail: 'customer@bakeryhub.com',
        deliveryAddress: '123 Sweet Lane', deliveryCity: 'Kathmandu', deliveryDate: '2026-07-10', deliveryTime: '14:00', deliveryOption: 'STANDARD',
        createdAt: new Date(), updatedAt: new Date(),
      },
      [
        { cakeId: cakes[0]._id, quantity: 2, price: cakes[0].price, weight: 1.0, flavor: 'Vanilla', spongeType: 'Standard', creamType: 'Standard' },
        { comboId: comboResults[0].id, cakeId: cakes[0]._id, quantity: 1, price: comboResults[0].price, weight: 1.0, flavor: 'Standard', spongeType: 'Standard', creamType: 'Standard' },
      ]
    );

    await seedOrder(
      {
        userId: customer.id, status: 'DELIVERED', totalPrice: 2200.0, paymentMethod: 'COD', paymentStatus: 'PAID',
        deliveryName: 'John Doe', deliveryPhone: '9841234567', deliveryEmail: 'customer@bakeryhub.com',
        deliveryAddress: '123 Sweet Lane', deliveryCity: 'Kathmandu', deliveryDate: '2026-07-12', deliveryTime: '16:00', deliveryOption: 'SAME_DAY',
        createdAt: new Date(), updatedAt: new Date(),
      },
      [
        { comboId: comboResults[1].id, cakeId: cakes[1]?._id || cakes[0]._id, quantity: 1, price: comboResults[1].price, weight: 1.0, flavor: 'Standard', spongeType: 'Standard', creamType: 'Standard' },
      ]
    );

    await seedOrder(
      {
        userId: customer.id, status: 'PENDING', totalPrice: 800.0, paymentMethod: 'COD', paymentStatus: 'PENDING',
        deliveryName: 'John Doe', deliveryPhone: '9841234567', deliveryEmail: 'customer@bakeryhub.com',
        deliveryAddress: '123 Sweet Lane', deliveryCity: 'Kathmandu', deliveryDate: '2026-07-15', deliveryTime: '10:00', deliveryOption: 'STANDARD',
        createdAt: new Date(), updatedAt: new Date(),
      },
      [
        { cakeId: cakes[2]?._id || cakes[0]._id, quantity: 1, price: 800.0, weight: 1.0, flavor: 'Chocolate', spongeType: 'Standard', creamType: 'Standard' },
      ]
    );
  }

  console.log('Creating indexes...');
  await Promise.all([
    db.users().createIndex({ email: 1 }),
    db.cakes().createIndex({ categoryId: 1, price: 1 }),
    db.cakes().createIndex({ createdAt: -1 }),
    db.orders().createIndex({ userId: 1, createdAt: -1 }),
    db.orders().createIndex({ status: 1 }),
    db.orderItems().createIndex({ orderId: 1 }),
    db.orderItems().createIndex({ cakeId: 1 }),
    db.reviews().createIndex({ cakeId: 1, createdAt: -1 }),
    db.carts().createIndex({ userId: 1 }, { unique: true }),
    db.passwordResets().createIndex({ token: 1 }, { unique: true }),
    db.passwordResets().createIndex({ userId: 1 }),
  ]);

  console.log('Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await closeDB();
  });
