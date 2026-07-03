import prisma from "./lib/prisma";
async function main() {
  const a = await prisma.appliance.findFirst();
  console.log("Name:", a?.name);
  console.log("ImageUrl:", a?.imageUrl ? a.imageUrl.substring(0, 60) + "..." : "(empty)");
  await prisma.$disconnect();
}
main();
