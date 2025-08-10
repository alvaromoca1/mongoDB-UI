// Script de inicialización para MongoDB
// Crea la base de datos exampledb con colecciones y datos de ejemplo

// Conectar a MongoDB
db = db.getSiblingDB('exampledb');

print('🚀 Inicializando base de datos exampledb...');

// Crear colección de usuarios
db.createCollection('users');
print('✅ Colección "users" creada');

// Insertar usuarios de ejemplo
db.users.insertMany([
  {
    _id: ObjectId(),
    name: 'Juan Pérez',
    email: 'juan.perez@example.com',
    age: 28,
    role: 'admin',
    createdAt: new Date(),
    isActive: true,
    preferences: {
      theme: 'dark',
      language: 'es'
    }
  },
  {
    _id: ObjectId(),
    name: 'María García',
    email: 'maria.garcia@example.com',
    age: 32,
    role: 'user',
    createdAt: new Date(),
    isActive: true,
    preferences: {
      theme: 'light',
      language: 'en'
    }
  },
  {
    _id: ObjectId(),
    name: 'Carlos López',
    email: 'carlos.lopez@example.com',
    age: 25,
    role: 'user',
    createdAt: new Date(),
    isActive: false,
    preferences: {
      theme: 'dark',
      language: 'es'
    }
  }
]);
print('✅ Usuarios de ejemplo insertados');

// Crear colección de productos
db.createCollection('products');
print('✅ Colección "products" creada');

// Insertar productos de ejemplo
db.products.insertMany([
  {
    _id: ObjectId(),
    name: 'Laptop Dell XPS 13',
    category: 'electronics',
    price: 1299.99,
    stock: 15,
    tags: ['laptop', 'dell', 'premium'],
    specifications: {
      processor: 'Intel i7-1165G7',
      ram: '16GB',
      storage: '512GB SSD',
      display: '13.4" 4K'
    },
    createdAt: new Date(),
    isAvailable: true
  },
  {
    _id: ObjectId(),
    name: 'iPhone 15 Pro',
    category: 'electronics',
    price: 999.99,
    stock: 8,
    tags: ['phone', 'apple', 'premium'],
    specifications: {
      processor: 'A17 Pro',
      ram: '8GB',
      storage: '256GB',
      display: '6.1" Super Retina XDR'
    },
    createdAt: new Date(),
    isAvailable: true
  },
  {
    _id: ObjectId(),
    name: 'Samsung Galaxy S24',
    category: 'electronics',
    price: 899.99,
    stock: 12,
    tags: ['phone', 'samsung', 'android'],
    specifications: {
      processor: 'Snapdragon 8 Gen 3',
      ram: '12GB',
      storage: '256GB',
      display: '6.2" Dynamic AMOLED'
    },
    createdAt: new Date(),
    isAvailable: true
  }
]);
print('✅ Productos de ejemplo insertados');

// Crear colección de órdenes
db.createCollection('orders');
print('✅ Colección "orders" creada');

// Insertar órdenes de ejemplo
db.orders.insertMany([
  {
    _id: ObjectId(),
    orderNumber: 'ORD-001',
    userId: db.users.findOne({name: 'Juan Pérez'})._id,
    items: [
      {
        productId: db.products.findOne({name: 'Laptop Dell XPS 13'})._id,
        quantity: 1,
        price: 1299.99
      }
    ],
    total: 1299.99,
    status: 'completed',
    createdAt: new Date(),
    shippingAddress: {
      street: 'Calle Principal 123',
      city: 'Madrid',
      country: 'España',
      zipCode: '28001'
    }
  },
  {
    _id: ObjectId(),
    orderNumber: 'ORD-002',
    userId: db.users.findOne({name: 'María García'})._id,
    items: [
      {
        productId: db.products.findOne({name: 'iPhone 15 Pro'})._id,
        quantity: 1,
        price: 999.99
      }
    ],
    total: 999.99,
    status: 'pending',
    createdAt: new Date(),
    shippingAddress: {
      street: 'Avenida Central 456',
      city: 'Barcelona',
      country: 'España',
      zipCode: '08001'
    }
  }
]);
print('✅ Órdenes de ejemplo insertadas');

// Crear índices para mejorar el rendimiento
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });
db.products.createIndex({ "category": 1 });
db.products.createIndex({ "tags": 1 });
db.orders.createIndex({ "orderNumber": 1 }, { unique: true });
db.orders.createIndex({ "userId": 1 });
db.orders.createIndex({ "status": 1 });
print('✅ Índices creados');

// Mostrar estadísticas
print('\n📊 Estadísticas de la base de datos:');
print('Colecciones creadas: ' + db.getCollectionNames().length);
print('Usuarios: ' + db.users.countDocuments());
print('Productos: ' + db.products.countDocuments());
print('Órdenes: ' + db.orders.countDocuments());

print('\n🎉 Base de datos exampledb inicializada correctamente!');
print('Puedes explorar las colecciones: users, products, orders');
