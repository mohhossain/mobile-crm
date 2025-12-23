import BackButton from "@/app/components/BackButton";
import { getCurrentUser } from "@/lib/currentUser";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  TagIcon, 
  UserCircleIcon,
  BanknotesIcon,
  DocumentTextIcon
} from "@heroicons/react/24/solid";
import ThemeSelector from "@/app/components/ThemeSelector";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ success?: string, error?: string }> }) {
  const user = await getCurrentUser();
  if(!user) return <div>Unauthorized</div>;

  const { success, error } = await searchParams;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24">
      <BackButton />
      <h1 className="text-2xl font-bold mt-8">Settings</h1>

      {success && (
        <div role="alert" className="alert alert-success">
          <CheckCircleIcon className="w-6 h-6" />
          <span>Settings saved!</span>
        </div>
      )}
      {error && (
        <div role="alert" className="alert alert-error">
          <XCircleIcon className="w-6 h-6" />
          <span>Action failed. Please try again.</span>
        </div>
      )}

      {/* 1. BUSINESS */}
      <div className="card bg-base-100 shadow border border-base-200">
        <div className="card-body">
           <h2 className="card-title text-lg">Business</h2>
           <div className="flex flex-col gap-2">
              <Link href="/settings/profile" className="flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors">
                 <div className="p-2 bg-secondary/10 text-secondary rounded-lg">
                   <UserCircleIcon className="w-5 h-5" />
                 </div>
                 <div className="flex-1">
                   <div className="font-bold text-sm">Public Profile</div>
                   <div className="text-xs text-base-content/50">Link-in-bio page</div>
                 </div>
                 <div className="text-xs font-bold text-primary">Manage</div>
              </Link>

              <Link href="/settings/products" className="flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors">
                 <div className="p-2 bg-primary/10 text-primary rounded-lg">
                   <TagIcon className="w-5 h-5" />
                 </div>
                 <div className="flex-1">
                   <div className="font-bold text-sm">Products & Services</div>
                   <div className="text-xs text-base-content/50">Catalog & Pricing</div>
                 </div>
                 <div className="text-xs font-bold text-primary">Manage</div>
              </Link>

              {/* NEW CONTRACTS LINK */}
              <Link href="/settings/contract" className="flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors">
                 <div className="p-2 bg-accent/10 text-accent rounded-lg">
                   <DocumentTextIcon className="w-5 h-5" />
                 </div>
                 <div className="flex-1">
                   <div className="font-bold text-sm">Contract Terms</div>
                   <div className="text-xs text-base-content/50">Default legal agreement</div>
                 </div>
                 <div className="text-xs font-bold text-primary">Manage</div>
              </Link>

              <Link href="/settings/payments" className="flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors">
                 <div className="p-2 bg-success/10 text-success rounded-lg">
                   <BanknotesIcon className="w-5 h-5" />
                 </div>
                 <div className="flex-1">
                   <div className="font-bold text-sm">Payment Methods</div>
                   <div className="text-xs text-base-content/50">Configure links & bank details</div>
                 </div>
                 <div className="text-xs font-bold text-primary">Manage</div>
              </Link>
           </div>
        </div>
      </div>

      {/* 2. APPEARANCE */}
      <div className="card bg-base-100 shadow border border-base-200">
        <div className="card-body">
           <h2 className="card-title text-lg">Appearance</h2>
           <ThemeSelector />
        </div>
      </div>
      
      <div className="text-center text-xs text-gray-400 mt-8">
        User ID: {user.id}
      </div>
    </div>
  );
}