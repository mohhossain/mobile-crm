import BackButton from "@/app/components/BackButton";
import { getCurrentUser } from "@/lib/currentUser";
import { prisma } from "@/lib/prisma";
import ContractSettings from "@/app/components/ContractSettings";

export default async function ContractPage() {
  const user = await getCurrentUser();
  if(!user) return <div>Unauthorized</div>;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { terms: true }
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24">
      <BackButton />
      
      <div className="mt-8 mb-8">
        <h1 className="text-3xl font-black tracking-tight">Contract Setup</h1>
        <p className="text-base-content/60 mt-2">Define the legal terms displayed to clients before they sign.</p>
      </div>

      <ContractSettings initialTerms={dbUser?.terms} />
    </div>
  );
}