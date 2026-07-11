import prisma from "./lib/prisma";

async function main() {
  const comp = await prisma.complaint.findFirst({
    where: { complaintId: "CMP-20260707-0001" }
  });
  console.log("Complaint details in DB:", JSON.stringify(comp, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
