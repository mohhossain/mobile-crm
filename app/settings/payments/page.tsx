import BackButton from "@/app/components/BackButton";
import { getCurrentUser } from "@/lib/currentUser";
import { prisma } from "@/lib/prisma";
import PaymentSettings from "@/app/components/PaymentSettings";

export default async function PaymentsPage() {
  const user = await getCurrentUser();
  if(!user) return <div>Unauthorized</div>;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { 
      defaultPaymentLink: true,
      paymentInstructions: true,
      paymentMethods: true, // Fetch the new JSON field
    }
  });

  // Safely cast the JSON to the expected type
  const paymentMethods = dbUser?.paymentMethods as any || null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24">
      <BackButton />
      
      <div className="mt-8 mb-8">
        <h1 className="text-3xl font-black tracking-tight">Payment Setup</h1>
        <p className="text-base-content/60 mt-2">Configure how you want to get paid. These details will be added to your invoices and client portal.</p>
      </div>

      <PaymentSettings 
        initialLink={dbUser?.defaultPaymentLink} 
        initialInstructions={dbUser?.paymentInstructions}
        initialMethods={paymentMethods}
      />
    </div>
  );
}