"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  EllipsisHorizontalIcon, 
  ArrowRightIcon,
  ArrowsRightLeftIcon
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

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'border-primary text-primary',
  NEGOTIATION: 'border-info text-info',
  PENDING: 'border-warning text-warning',
  WON: 'border-success text-success',
  LOST: 'border-error text-error'
};

const STATUS_BG: Record<string, string> = {
  OPEN: 'bg-primary/5',
  NEGOTIATION: 'bg-info/5',
  PENDING: 'bg-warning/5',
  WON: 'bg-success/5',
  LOST: 'bg-error/5'
};

export default function DealsKanban({ deals }: { deals: Deal[] }) {
  const router = useRouter();
  const [movingId, setMovingId] = useState<string | null>(null);
  const [activeMobileTab, setActiveMobileTab] = useState(STAGES[0]);
  const containerRef = useRef<HTMLDivElement>(null);
  const columnRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Group deals by status
  const columns = STAGES.map(stage => ({
    id: stage,
    title: stage.charAt(0) + stage.slice(1).toLowerCase(),
    items: deals.filter(d => d.status === stage),
    total: deals.filter(d => d.status === stage).reduce((sum, d) => sum + d.amount, 0)
  }));

  // Scroll to column on mobile tab click
  const scrollToColumn = (stage: string) => {
    setActiveMobileTab(stage);
    const el = columnRefs.current[stage];
    if (el && containerRef.current) {
      const containerLeft = containerRef.current.getBoundingClientRect().left;
      const elLeft = el.getBoundingClientRect().left;
      const offset = elLeft - containerLeft + containerRef.current.scrollLeft;
      
      // Center logic for mobile view
      // We want the column to be centered or slightly padded from left
      containerRef.current.scrollTo({ left: offset - 16, behavior: 'smooth' }); // 16px padding
    }
  };

  // Handle Drag & Drop (Desktop)
  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    e.dataTransfer.setData("dealId", dealId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData("dealId");
    if (!dealId) return;

    // Optimistic update or loading state could go here
    await handleMove(dealId, newStatus);
  };

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

  // Track scroll to update active mobile tab
  const handleScroll = () => {
    if (!containerRef.current) return;
    // Simple logic: which column is closest to left edge
    // This is a basic implementation, can be refined with IntersectionObserver
  };

  return (
    <div className="flex flex-col h-full">
      
      {/* Mobile Navigation Tabs */}
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

      {/* Kanban Container */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
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
            
            {/* Column Header */}
            <div className={`p-3 border-b border-base-200 flex justify-between items-center rounded-t-2xl bg-base-100/50 backdrop-blur-sm sticky top-0 z-10 border-t-4 ${STATUS_COLORS[col.id].split(' ')[0]}`}>
              <div className="flex items-center gap-2">
                <h3 className={`font-black text-sm tracking-tight ${STATUS_COLORS[col.id].split(' ')[1]}`}>
                  {col.title}
                </h3>
                <span className="badge badge-xs badge-ghost font-mono">{col.items.length}</span>
              </div>
              <div className="text-xs font-bold opacity-40 font-mono">
                ${col.total.toLocaleString()}
              </div>
            </div>

            {/* Drop Zone / List */}
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
                    {/* Card Top */}
                    <div className="flex justify-between items-start">
                      <Link href={`/deals/${deal.id}`} className="font-bold text-sm leading-tight line-clamp-2 hover:text-primary transition-colors">
                        {deal.title}
                      </Link>
                      
                      {/* Quick Move (Mobile Friendly) */}
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

                    {/* Card Amount */}
                    <div className="text-base font-black tracking-tight flex items-center gap-2">
                       ${deal.amount.toLocaleString()}
                       {col.id === 'WON' && <span className="badge badge-xs badge-success badge-outline">Paid</span>}
                    </div>

                    {/* Card Bottom: Avatars & Date */}
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
                      <span className="text-[9px] opacity-40 font-mono">
                         {new Date(deal.updatedAt).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
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