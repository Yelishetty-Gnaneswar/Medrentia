import mongoose from 'mongoose';

const connectDB = async () => {
  const primaryUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/medrentia';
  
  try {
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 2500, // Quick timeout to fallback in dev if local mongod not started
    });
    console.log(`[MedRentia] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[MedRentia] Could not connect to primary MongoDB at ${primaryUri}`);

    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('[MedRentia] Starting embedded development database (mongodb-memory-server)...');
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create({
          instance: { dbName: 'medrentia' },
        });
        const uri = mongod.getUri();
        const conn = await mongoose.connect(uri);
        console.log(`[MedRentia] Connected to Embedded MongoDB: ${uri}`);

        // Auto-seed embedded database with demo accounts and equipment
        const { seedDataInternal } = await import('../utils/seedHelper.js');
        await seedDataInternal();
        return conn;
      } catch (memErr) {
        console.error('[MedRentia] Embedded database initialization failed:', memErr.message);
      }
    }
  }
};

export default connectDB;
