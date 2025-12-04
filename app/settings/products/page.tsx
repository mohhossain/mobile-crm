import { getCurrentUser } from "@/lib/currentUser";
import { prisma } from "@/lib/prisma";
import BackButton from "@/app/components/BackButton";
import ProductManager from "@/app/components/ProductManager";

export default async function ProductSettingsPage() {
  const user = await getCurrentUser();
  if (!user) return <div>Unauthorized</div>;

  const products = await prisma.product.findMany({
    where: { userId: user.id },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-8 pb-24">
      <BackButton />
      
      <div>
        <h1 className="text-2xl font-bold mt-4">Products & Services</h1>
        <p className="text-base-content/60 text-sm">
          Define your standard offerings here to quickly add them to deals and invoices.
        </p>
      </div>

      <ProductManager initialProducts={products} />
    </div>
  );
}