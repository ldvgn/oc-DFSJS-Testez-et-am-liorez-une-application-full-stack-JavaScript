import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const { count } = await prisma.user.deleteMany({
    where: { email: { endsWith: "@e2e.test" } },
  });
  console.log(`E2E cleanup: ${count} user(s) supprimé(s)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
