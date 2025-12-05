import { ArrowPathIcon } from "@heroicons/react/24/outline";

export default function Loading() {
  return (
    <div className="w-full h-full p-4 space-y-8 animate-pulse">
      
      {/* Header Skeleton */}
      <div className="flex justify-between items-end">
        <div className="space-y-3">
          <div className="h-8 w-48 bg-base-200 rounded-lg"></div>
          <div className="h-4 w-32 bg-base-200 rounded-lg"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-8 bg-base-200 rounded-full"></div>
          <div className="h-8 w-24 bg-base-200 rounded-lg"></div>
        </div>
      </div>

      {/* Dashboard Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Big Card */}
          <div className="h-48 w-full bg-base-200 rounded-2xl"></div>
          
          {/* List Items */}
          <div className="space-y-3">
            <div className="h-20 w-full bg-base-200 rounded-xl"></div>
            <div className="h-20 w-full bg-base-200 rounded-xl"></div>
            <div className="h-20 w-full bg-base-200 rounded-xl"></div>
          </div>
        </div>

        {/* Sidebar Area */}
        <div className="space-y-6">
          <div className="h-64 w-full bg-base-200 rounded-2xl"></div>
          <div className="h-40 w-full bg-base-200 rounded-2xl"></div>
        </div>
      </div>
      
      {/* Centered Spinner for extra visual cue */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <ArrowPathIcon className="w-10 h-10 animate-spin text-primary" />
      </div>
    </div>
  );
}