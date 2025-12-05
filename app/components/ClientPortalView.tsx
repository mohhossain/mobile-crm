"use client";

import { 
  CheckCircleIcon, 
  ClockIcon, 
  DocumentCheckIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as SolidCheck } from "@heroicons/react/24/solid";

export default function ClientPortalView({ deal, owner }: { deal: any, owner: any }) {
  
  const STAGES = ['OPEN', 'NEGOTIATION', 'PENDING', 'WON'];
  const currentStageIndex = STAGES.indexOf(deal.status);
  
  // Calculate Progress
  const progress = Math.max(5, ((currentStageIndex + 1) / STAGES.length) * 100);

  return (
    <div className="w-full max-w-3xl space-y-6">
      
      {/* 1. Branding Header */}
      <div className="text-center mb-8">
        <div className="avatar mb-4">
          <div className="w-20 h-20 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
            {owner.avatar ? (
              <img src={owner.avatar} alt={owner.name} />
            ) : (
              <div className="bg-neutral text-neutral-content w-full h-full flex items-center justify-center text-2xl font-bold">
                {owner.name.charAt(0)}
              </div>
            )}
          </div>
        </div>
        <h2 className="text-2xl font-bold">{owner.name}</h2>
        <p className="text-sm text-base-content/60">Project Status Portal</p>
      </div>

      {/* 2. Project Status Card */}
      <div className="card bg-base-100 shadow-xl border border-base-200 overflow-hidden">
        {/* Status Bar */}
        <div className="bg-base-200 px-6 py-4 border-b border-base-300 flex justify-between items-center">
           <span className="text-xs font-bold uppercase tracking-widest opacity-50">Project</span>
           <span className={`badge ${deal.status === 'WON' ? 'badge-success' : 'badge-primary'}`}>
             {deal.status}
           </span>
        </div>
        
        <div className="p-6 sm:p-8">
          <h1 className="text-3xl font-black mb-2">{deal.title}</h1>
          <div className="flex items-center gap-2 text-sm opacity-60 mb-8">
            <CalendarDaysIcon className="w-4 h-4" />
            <span>Updated: {new Date(deal.updatedAt).toLocaleDateString()}</span>
          </div>

          {/* Visual Pipeline */}
          <div className="relative mb-8">
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-base-200">
              <div style={{ width: `${progress}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-1000"></div>
            </div>
            <div className="flex justify-between text-[10px] font-bold uppercase opacity-40">
              <span>Start</span>
              <span>In Progress</span>
              <span>Completion</span>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-4 border-t border-base-200 pt-6">
            <div>
               <div className="text-xs uppercase font-bold opacity-40 mb-1">Target Date</div>
               <div className="font-mono text-lg">
                 {deal.closeDate ? new Date(deal.closeDate).toLocaleDateString() : 'TBD'}
               </div>
            </div>
            <div className="text-right">
               <div className="text-xs uppercase font-bold opacity-40 mb-1">Budget</div>
               <div className="font-mono text-lg font-bold text-success">
                 ${deal.amount.toLocaleString()}
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Tasks / Deliverables */}
      {deal.tasks && deal.tasks.length > 0 && (
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-0">
             <div className="px-6 py-4 border-b border-base-200 flex items-center gap-2">
                <DocumentCheckIcon className="w-5 h-5 text-primary" />
                <h3 className="font-bold">Deliverables & Tasks</h3>
             </div>
             <div className="divide-y divide-base-200">
               {deal.tasks.map((task: any) => (
                 <div key={task.id} className="p-4 flex items-start gap-4">
                    <div className="mt-1">
                      {task.status === 'DONE' ? (
                        <SolidCheck className="w-6 h-6 text-success" />
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-base-300"></div>
                      )}
                    </div>
                    <div className={`flex-1 ${task.status === 'DONE' ? 'opacity-50' : ''}`}>
                       <div className={`font-medium ${task.status === 'DONE' ? 'line-through' : ''}`}>
                         {task.title}
                       </div>
                       {task.description && (
                         <p className="text-sm text-base-content/60 mt-1">{task.description}</p>
                       )}
                       {task.dueDate && (
                         <div className="flex items-center gap-1 mt-2 text-xs opacity-40">
                           <ClockIcon className="w-3 h-3" />
                           Due: {new Date(task.dueDate).toLocaleDateString()}
                         </div>
                       )}
                    </div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      )}

    </div>
  );
}