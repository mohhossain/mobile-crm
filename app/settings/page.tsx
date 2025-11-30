import BackButton from "@/app/components/BackButton";
import { getCurrentUser } from "@/lib/currentUser";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
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

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6 pb-24">
      <BackButton />
      <h1 className="text-2xl font-bold mt-8">Settings</h1>

      {/* Notifications */}
      {success && (
        <div role="alert" className="alert alert-success">
          <CheckCircleIcon className="w-6 h-6" />
          <span>Integration successful!</span>
        </div>
      )}
      {error && (
        <div role="alert" className="alert alert-error">
          <XCircleIcon className="w-6 h-6" />
          <span>Action failed. Please try again.</span>
        </div>
      )}

      {/* 1. APPEARANCE SETTINGS */}
      <div className="card bg-base-100 shadow border border-base-200">
        <div className="card-body">
           <h2 className="card-title text-lg">Appearance</h2>
           <p className="text-gray-500 text-sm mb-4">Choose your preferred color theme.</p>
           <ThemeSelector />
        </div>
      </div>

      {/* 2. INTEGRATIONS */}
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
                    {isGoogleConnected ? "Connected" : "Not connected"}
                  </div>
                </div>
              </div>
              
              {isGoogleConnected ? (
                 <button className="btn btn-sm btn-outline btn-success" disabled>Connected</button>
              ) : (
                <Link href="/api/google/auth" prefetch={false}>
                  <button className="btn btn-sm btn-primary">Connect</button>
                </Link>
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