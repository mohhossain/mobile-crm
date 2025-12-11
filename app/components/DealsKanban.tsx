"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  EllipsisHorizontalIcon, 
  CalendarIcon
} from "@heroicons/react/24/outline";

interface Deal {
  id: string;
  title: string;
  amount: number;
  status: string;
  updatedAt: Date | string;
  closeDate?: Date | string | null;
  probability?: number;
  contacts: { id: string; name: string; imageUrl?: string }[];
  tags: { name: string }[];
}

// UPDATED STAGES
const STAGES = ['NEW', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'];

// Updated Colors
const STATUS_COLORS: Record<string, string> = {
  NEW: 'border-base-content/20 text-base-content',
  QUALIFIED: 'border-primary text-primary',
  PROPOSAL: 'border-secondary text-secondary',
  NEGOTIATION: 'border-info text-info',
  WON: 'border-success text-success',
  LOST: 'border-error text-error'
};

const STATUS_BG: Record<string, string> = {
  NEW: 'bg-base-content/5',
  QUALIFIED: 'bg-primary/5',
  PROPOSAL: 'bg-secondary/5',
  NEGOTIATION: 'bg-info/5',
  WON: 'bg-success/5',
  LOST: 'bg-error/5'
};

export default function DealsKanban({ deals }: { deals: Deal[] }) {
  const router = useRouter();
  const [movingId, setMovingId] = useState<string | null>(null);
  const [activeMobileTab, setActiveMobileTab] = useState(STAGES[0]);
  const containerRef = useRef<HTMLDivElement>(null);
  const columnRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const columns = STAGES.map(stage => ({
    id: stage,
    title: stage.charAt(0) + stage.slice(1).toLowerCase(),
    items: deals.filter(d => d.status === stage),
    total: deals.filter(d => d.status === stage).reduce((sum, d) => sum + d.amount, 0)
  }));

  const scrollToColumn = (stage: string) => {
    setActiveMobileTab(stage);
    const el = columnRefs.current[stage];
    if (el && containerRef.current) {
      const containerLeft = containerRef.current.getBoundingClientRect().left;
      const elLeft = el.getBoundingClientRect().left;
      const offset = elLeft - containerLeft + containerRef.current.scrollLeft;
      containerRef.current.scrollTo({ left: offset - 16, behavior: 'smooth' });
    }
  };

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    e.dataTransfer.setData("dealId", dealId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData("dealId");
    if (!dealId) return;
    await handleMove(dealId, newStatus);
  };

  const handleMove = async (dealId: string, newStatus: string) => {
    setMovingId(dealId);
    try {
      // Auto-set probability based on stage
      let prob = undefined;
      if (newStatus === 'WON') prob = 100;
      if (newStatus === 'LOST') prob = 0;
      if (newStatus === 'NEGOTIATION') prob = 75;
      if (newStatus === 'PROPOSAL') prob = 50;
      if (newStatus === 'QUALIFIED') prob = 25;
      if (newStatus === 'NEW') prob = 10;

      const res = await fetch(`/api/deals/${dealId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, probability: prob })
      });
      if (res.ok) router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setMovingId(null);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="lg:hidden flex overflow-x-auto no-scrollbar gap-2 px-1 mb-4 sticky top-0 z-20 bg-base-300/95 backdrop-blur py-2">
        {STAGES.map(stage => (
          <button
            key={stage}
            onClick={() => scrollToColumn(stage)}
            className={`btn btn-sm rounded-full whitespace-nowrap flex-1 transition-all ${
              activeMobileTab === stage 
                ? `btn-active ${STATUS_BG[stage] || 'bg-base-content/10'} border-none shadow-sm` 
                : 'btn-ghost'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${STATUS_BG[stage]?.replace('/5', '') || 'bg-base-content/20'}`}></span>
            {stage.charAt(0) + stage.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div 
        ref={containerRef}
        className="flex-1 flex overflow-x-auto snap-x snap-mandatory gap-4 px-1 pb-4 no-scrollbar lg:gap-6 lg:overflow-hidden"
      >
        {columns.map((col) => (
          <div 
            key={col.id} 
            ref={el => { columnRefs.current[col.id] = el; }}
            className="snap-center shrink-0 w-[85vw] md:w-[320px] lg:flex-1 lg:min-w-0 flex flex-col h-full rounded-2xl bg-base-200/30 border border-base-200"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <div className={`p-3 border-b border-base-200 flex justify-between items-center rounded-t-2xl bg-base-100/50 backdrop-blur-sm sticky top-0 z-10 border-t-4 ${STATUS_COLORS[col.id]?.split(' ')[0] || 'border-base-300'}`}>
              <div className="flex items-center gap-2">
                <h3 className={`font-black text-sm tracking-tight ${STATUS_COLORS[col.id]?.split(' ')[1] || ''}`}>
                  {col.title}
                </h3>
                <span className="badge badge-xs badge-ghost font-mono">{col.items.length}</span>
              </div>
              <div className="text-xs font-bold opacity-40 font-mono">
                ${col.total.toLocaleString()}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
              {col.items.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-base-content/20 text-xs italic min-h-[150px] border-2 border-dashed border-base-content/5 rounded-xl m-2">
                  <span>Drag deals here</span>
                </div>
              )}
              
              {col.items.map((deal) => (
                <div 
                  key={deal.id} 
                  draggable
                  onDragStart={(e) => handleDragStart(e, deal.id)}
                  className={`
                    card bg-base-100 shadow-sm border border-base-100 hover:shadow-md hover:border-primary/20 transition-all cursor-grab active:cursor-grabbing group
                    ${movingId === deal.id ? 'opacity-40 scale-95' : ''}
                  `}
                >
                  <div className="card-body p-3 gap-1.5">
                    <div className="flex justify-between items-start">
                      <Link href={`/deals/${deal.id}`} className="font-bold text-sm leading-tight line-clamp-2 hover:text-primary transition-colors">
                        {deal.title}
                      </Link>
                      
                      <div className="dropdown dropdown-end lg:hidden">
                        <div tabIndex={0} role="button" className="btn btn-xs btn-ghost btn-circle -mt-1 -mr-1">
                          <EllipsisHorizontalIcon className="w-4 h-4" />
                        </div>
                        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-xl bg-base-100 rounded-box w-40 border border-base-200 text-xs">
                          <li className="menu-title opacity-50 px-2 py-1">Move to...</li>
                          {STAGES.filter(s => s !== col.id).map(s => (
                            <li key={s}>
                              <button onClick={() => handleMove(deal.id, s)}>
                                {s.charAt(0) + s.slice(1).toLowerCase()}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="text-base font-black tracking-tight flex items-center gap-2">
                       ${deal.amount.toLocaleString()}
                       {col.id === 'WON' && <span className="badge badge-xs badge-success badge-outline">Paid</span>}
                    </div>

                    <div className="flex justify-between items-end mt-1 pt-2 border-t border-base-content/5">
                      <div className="flex -space-x-1.5">
                         {deal.contacts.slice(0, 2).map(c => (
                           <div key={c.id} className="avatar w-4 h-4 ring-1 ring-base-100 rounded-full" title={c.name}>
                             {c.imageUrl ? (
                               <img src={c.imageUrl} alt={c.name} className="rounded-full" />
                             ) : (
                               <div className="bg-neutral text-neutral-content text-[6px] flex items-center justify-center w-full h-full font-bold">{c.name.charAt(0)}</div>
                             )}
                           </div>
                         ))}
                      </div>
                      
                      <span className={`text-[9px] font-mono flex items-center gap-1 ${deal.closeDate ? 'text-primary' : 'opacity-40'}`}>
                         <CalendarIcon className="w-3 h-3" />
                         {deal.closeDate 
                            ? new Date(deal.closeDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})
                            : new Date(deal.updatedAt).toLocaleDateString(undefined, {month:'short', day:'numeric'})
                         }
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}