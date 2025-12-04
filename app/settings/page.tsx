import BackButton from "@/app/components/BackButton";
import { getCurrentUser } from "@/lib/currentUser";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, TagIcon } from "@heroicons/react/24/solid";
import ThemeSelector from "@/app/components/ThemeSelector";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ success?: string, error?: string }> }) {
  const user = await getCurrentUser();
  if(!user) return <div>Unauthorized</div>;

  const { success, error } = await searchParams;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { googleRefreshToken: true }
  });

  const isGoogleConnected = !!dbUser?.googleRefreshToken;
  const isGoogleConfigured = !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <BackButton />
      <h1 className="text-2xl font-bold mt-8">Settings</h1>

      {/* ... (Keep Notifications Logic) ... */}

      {/* 1. BUSINESS SETTINGS (NEW) */}
      <div className="card bg-base-100 shadow border border-base-200">
        <div className="card-body">
           <h2 className="card-title text-lg">Business</h2>
           <div className="flex flex-col gap-2">
              <Link href="/settings/products" className="flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors">
                 <div className="p-2 bg-primary/10 text-primary rounded-lg">
                   <TagIcon className="w-5 h-5" />
                 </div>
                 <div className="flex-1">
                   <div className="font-bold text-sm">Products & Services</div>
                   <div className="text-xs text-base-content/50">Manage your catalog and pricing</div>
                 </div>
                 <div className="text-xs font-bold text-primary">Manage</div>
              </Link>
           </div>
        </div>
      </div>

      {/* 2. APPEARANCE SETTINGS */}
      <div className="card bg-base-100 shadow border border-base-200">
        <div className="card-body">
           <h2 className="card-title text-lg">Appearance</h2>
           <p className="text-gray-500 text-sm mb-4">Choose your preferred color theme.</p>
           <ThemeSelector />
        </div>
      </div>

      {/* 3. INTEGRATIONS */}
      <div className="card bg-base-100 shadow border border-base-200">
        <div className="card-body">
          <h2 className="card-title text-lg">Integrations</h2>
          <p className="text-gray-500 text-sm">
            Connect external services to sync data.
          </p>
          
          <div className="flex flex-col gap-3 mt-4">
            {/* Google Integration */}
            <div className={`flex items-center justify-between p-3 border rounded-lg ${isGoogleConnected ? 'bg-green-50/50 border-green-200' : 'bg-base-50'}`}>
              <div className="flex items-center gap-3">
                <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" alt="Google" className="w-8 h-8" />
                <div>
                  <div className="font-bold text-sm">Google Calendar</div>
                  <div className="text-xs text-gray-500">
                    {isGoogleConnected ? "Connected" : "Sync meetings & tasks"}
                  </div>
                </div>
              </div>
              
              {isGoogleConnected ? (
                 <button className="btn btn-sm btn-outline btn-success" disabled>Connected</button>
              ) : isGoogleConfigured ? (
                <Link href="/api/google/auth" prefetch={false}>
                  <button className="btn btn-sm btn-primary">Connect</button>
                </Link>
              ) : (
                <div className="badge badge-warning gap-1 text-xs" title="Missing API Keys in Vercel">
                  <ExclamationTriangleIcon className="w-3 h-3" /> Config Required
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-center text-xs text-gray-400 mt-8">
        User ID: {user.id}
      </div>
    </div>
  );
}