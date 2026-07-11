import prisma from "./lib/prisma";
async function main() {
  const c = await prisma.appliance.count();
  console.log("Appliances:", c);
  const a = await prisma.appliance.findFirst();
  console.log("Sample imageUrl:", a?.imageUrl?.substring(0, 50) || "(empty)");
  await prisma.$disconnect();
}
main();
