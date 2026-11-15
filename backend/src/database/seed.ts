import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as argon2 from 'argon2';
import { ApprovalStatus } from '../common/enums/approval-status.enum';
import { OrderStatus } from '../common/enums/order-status.enum';
import { ProductCondition } from '../common/enums/product-condition.enum';
import { UserRole } from '../common/enums/user-role.enum';
import { Category } from '../categories/entities/category.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Order } from '../orders/entities/order.entity';
import { Product } from '../products/entities/product.entity';
import { Shop } from '../shops/entities/shop.entity';
import { User } from '../users/entities/user.entity';

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [__dirname + '/../**/*.entity.{ts,js}'],
    synchronize: true,
  });
  await dataSource.initialize();

  const users = dataSource.getRepository(User);
  const already = await users.findOne({
    where: { email: 'admin@antiqo.test' },
  });
  if (already) {
    console.log('Demo data already present, nothing to do.');
    await dataSource.destroy();
    return;
  }

  const password = await argon2.hash('Password123');
  const admin = await users.save(
    users.create({
      name: 'Antiqo Admin',
      email: 'admin@antiqo.test',
      passwordHash: password,
      role: UserRole.ADMIN,
    }),
  );
  const seller = await users.save(
    users.create({
      name: 'Sophie Seller',
      email: 'seller@antiqo.test',
      passwordHash: password,
      role: UserRole.SELLER,
    }),
  );
  const buyer = await users.save(
    users.create({
      name: 'Ben Buyer',
      email: 'buyer@antiqo.test',
      passwordHash: password,
      role: UserRole.BUYER,
    }),
  );

  const category = await dataSource
    .getRepository(Category)
    .save({ name: 'Vintage Furniture' });

  const shop = await dataSource.getRepository(Shop).save({
    sellerId: seller.id,
    name: 'Sophie Vintage',
    approvalStatus: ApprovalStatus.APPROVED,
  });

  const products = dataSource.getRepository(Product);
  const chair = await products.save(
    products.create({
      shopId: shop.id,
      categoryId: category.id,
      title: 'Teak Lounge Chair',
      price: '4500.00',
      stock: 5,
      condition: ProductCondition.USED,
    }),
  );
  const lamp = await products.save(
    products.create({
      shopId: shop.id,
      categoryId: category.id,
      title: 'Brass Floor Lamp',
      price: '2200.00',
      stock: 3,
      condition: ProductCondition.LIKE_NEW,
    }),
  );

  const order = await dataSource.getRepository(Order).save({
    buyerId: buyer.id,
    shopId: shop.id,
    status: OrderStatus.DELIVERED,
    total: '4560.00',
  });
  await dataSource.getRepository(OrderItem).save({
    orderId: order.id,
    productId: chair.id,
    quantity: 1,
    unitPrice: '4500.00',
  });

  console.log('Seed complete.');
  console.log('  admin  -> admin@antiqo.test  / Password123');
  console.log('  seller -> seller@antiqo.test / Password123');
  console.log('  buyer  -> buyer@antiqo.test  / Password123');
  console.log(
    `  shop #${shop.id} "${shop.name}" (owner ${seller.id}), products ${chair.id} & ${lamp.id}`,
  );
  console.log(`  delivered order #${order.id} for buyer ${buyer.id}`);
  console.log(`  admin id ${admin.id}`);

  await dataSource.destroy();
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});