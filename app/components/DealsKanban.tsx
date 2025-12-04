"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  EllipsisHorizontalIcon, 
  CalendarDaysIcon, 
  ArrowRightIcon 
} from "@heroicons/react/24/outline";

interface Deal {
  id: string;
  title: string;
  amount: number;
  status: string;
  updatedAt: Date | string;
  probability?: number;
  contacts: { id: string; name: string; imageUrl?: string }[];
  tags: { name: string }[];
}

const STAGES = ['OPEN', 'NEGOTIATION', 'PENDING', 'WON'];

export default function DealsKanban({ deals }: { deals: Deal[] }) {
  const router = useRouter();
  const [movingId, setMovingId] = useState<string | null>(null);

  // Group deals by status
  const columns = STAGES.map(stage => ({
    id: stage,
    title: stage.charAt(0) + stage.slice(1).toLowerCase(),
    items: deals.filter(d => d.status === stage),
    total: deals.filter(d => d.status === stage).reduce((sum, d) => sum + d.amount, 0)
  }));

  const handleMove = async (dealId: string, newStatus: string) => {
    setMovingId(dealId);
    try {
      const res = await fetch(`/api/deals/${dealId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, probability: newStatus === 'WON' ? 100 : undefined })
      });
      if (res.ok) router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setMovingId(null);
    }
  };

  return (
    <div className="flex overflow-x-auto snap-x snap-mandatory h-[calc(100vh-200px)] pb-10 gap-4 px-1 no-scrollbar">
      {columns.map((col) => (
        <div key={col.id} className="snap-center shrink-0 w-[85vw] md:w-[350px] flex flex-col h-full">
          
          {/* Column Header */}
          <div className="flex justify-between items-center mb-3 px-1 sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <h3 className="font-black text-lg tracking-tight">{col.title}</h3>
              <span className="badge badge-sm badge-neutral">{col.items.length}</span>
            </div>
            <div className="text-xs font-bold opacity-50">
              ${col.total.toLocaleString()}
            </div>
          </div>

          {/* Column Body */}
          <div className="flex-1 bg-base-200/50 rounded-2xl p-3 overflow-y-auto border border-base-200 space-y-3">
            {col.items.length === 0 && (
              <div className="h-32 flex items-center justify-center text-base-content/30 text-xs italic border-2 border-dashed border-base-content/5 rounded-xl">
                No deals in {col.title}
              </div>
            )}
            
            {col.items.map((deal) => (
              <div key={deal.id} className={`card bg-base-100 shadow-sm border border-base-100 active:scale-95 transition-transform duration-200 ${movingId === deal.id ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="card-body p-4 gap-1">
                  {/* Top Row */}
                  <div className="flex justify-between items-start">
                    <Link href={`/deals/${deal.id}`} className="font-bold text-sm line-clamp-2 hover:text-primary transition-colors">
                      {deal.title}
                    </Link>
                    
                    {/* Quick Move Dropdown */}
                    <div className="dropdown dropdown-end">
                      <div tabIndex={0} role="button" className="btn btn-xs btn-ghost btn-circle">
                        <EllipsisHorizontalIcon className="w-5 h-5" />
                      </div>
                      <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-xl bg-base-100 rounded-box w-40 border border-base-200">
                        <li className="menu-title text-[10px] uppercase opacity-50">Move to...</li>
                        {STAGES.filter(s => s !== col.id).map(s => (
                          <li key={s}>
                            <button onClick={() => handleMove(deal.id, s)} className="text-xs">
                              {s.charAt(0) + s.slice(1).toLowerCase()}
                            </button>
                          </li>
                        ))}
                        <div className="divider my-0"></div>
                        <li><Link href={`/deals/${deal.id}`} className="text-xs">View Details</Link></li>
                      </ul>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-lg font-black">${deal.amount.toLocaleString()}</div>

                  {/* Bottom Row */}
                  <div className="flex justify-between items-end mt-2">
                    <div className="flex -space-x-1.5">
                       {deal.contacts.slice(0, 3).map(c => (
                         <div key={c.id} className="avatar w-5 h-5 ring-1 ring-base-100 rounded-full">
                           {c.imageUrl ? (
                             <img src={c.imageUrl} alt={c.name} className="rounded-full" />
                           ) : (
                             <div className="bg-neutral text-neutral-content text-[8px] flex items-center justify-center w-full h-full font-bold">{c.name.charAt(0)}</div>
                           )}
                         </div>
                       ))}
                    </div>
                    <span className="text-[10px] opacity-40 font-mono flex items-center gap-1">
                       {new Date(deal.updatedAt).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {/* Spacer for right edge scrolling */}
      <div className="w-4 shrink-0"></div>
    </div>
  );
}