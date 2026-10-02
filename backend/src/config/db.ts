import prisma from './prisma';

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log(`SQLite Database Connected via Prisma`);
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
};
export default connectDB;
