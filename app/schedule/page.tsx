import { getCurrentUser } from '@/lib/currentUser';
import CalendarGrid from '@/app/components/CalendarGrid';
import Link from 'next/link';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';

export default async function SchedulePage() {
  const user = await getCurrentUser();
  if (!user) return <div>Please sign in.</div>;

  return (
    <div className="p-4 max-w-6xl mx-auto pb-24">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Schedule</h1>
          <p className="text-sm text-gray-500">Manage your meetings and tasks timeline.</p>
        </div>
        <Link href="/settings" className="btn btn-sm btn-outline gap-2">
          <Cog6ToothIcon className="w-4 h-4" />
          Sync Settings
        </Link>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body p-4 md:p-6">
           <CalendarGrid />
        </div>
      </div>
    </div>
  );
}