"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  CalendarIcon,
  EllipsisHorizontalIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from "@heroicons/react/24/outline";

interface Deal {
  id: string;
  title: string;
  amount: number;
  status: string;
  stage: string;
  updatedAt: Date | string;
  closeDate?: Date | string | null;
  probability?: number;
  contacts: { id: string; name: string; imageUrl?: string }[];
}

const DEFAULT_STAGES = ['Lead', 'Meeting', 'Proposal', 'Negotiation'];
const TERMINAL_STAGES = ['Won', 'Lost'];

const STAGE_STYLES: Record<string, { border: string; bg: string; badge: string; text: string }> = {
  'Lead': { border: 'border-base-content/20', bg: 'bg-base-200/50', badge: 'badge-ghost', text: 'text-base-content' },
  'Meeting': { border: 'border-info', bg: 'bg-info/5', badge: 'badge-info', text: 'text-info' },
  'Proposal': { border: 'border-secondary', bg: 'bg-secondary/5', badge: 'badge-secondary', text: 'text-secondary' },
  'Negotiation': { border: 'border-warning', bg: 'bg-warning/5', badge: 'badge-warning', text: 'text-warning' },
  'Won': { border: 'border-success', bg: 'bg-success/5', badge: 'badge-success', text: 'text-success' },
  'Lost': { border: 'border-error', bg: 'bg-error/5', badge: 'badge-error', text: 'text-error' },
};

export default function DealsKanban({ deals }: { deals: Deal[] }) {
  const router = useRouter();
  
  // 1. Optimistic State
  const [optimisticDeals, setOptimisticDeals] = useState<Deal[]>(deals);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [activeMobileTab, setActiveMobileTab] = useState(DEFAULT_STAGES[0]);
  
  // Sync Status State
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaved, setLastSaved] = useState<Date>(new Date());

  const containerRef = useRef<HTMLDivElement>(null);
  const columnRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Sync with server data ONLY when the parent passes new distinct data (e.g. initial load)
  // We avoid auto-syncing if we are in the middle of an operation to prevent reverts
  useEffect(() => {
    // Only update if we are idle (not currently dragging/saving) to prevent "jumps"
    if (saveStatus === 'idle' || saveStatus === 'saved') {
        setOptimisticDeals(deals);
    }
  }, [deals]);

  // 2. Column Organization
  const columns = [...DEFAULT_STAGES, ...TERMINAL_STAGES].map(stageName => {
    const items = optimisticDeals.filter(d => d.stage === stageName);
    return {
      id: stageName,
      title: stageName,
      items,
      total: items.reduce((sum, d) => sum + d.amount, 0)
    };
  });

  // 3. Handlers
  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    e.dataTransfer.setData("dealId", dealId);
    e.dataTransfer.effectAllowed = "move";
    setMovingId(dealId);
  };

  const handleDragEnd = () => setMovingId(null);

  const handleDrop = async (e: React.DragEvent, targetStage: string) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData("dealId");
    if (!dealId) return;
    await handleMove(dealId, targetStage);
  };

  const handleMove = async (dealId: string, targetStage: string) => {
    setSaveStatus('saving');
    
    // 1. Logic Calculation
    let newStatus = 'OPEN';
    let newProbability = 20;

    if (targetStage === 'Won') {
      newStatus = 'WON';
      newProbability = 100;
    } else if (targetStage === 'Lost') {
      newStatus = 'LOST';
      newProbability = 0;
    } else {
      newStatus = 'OPEN';
      const idx = DEFAULT_STAGES.indexOf(targetStage);
      newProbability = Math.round(((idx + 1) / DEFAULT_STAGES.length) * 80);
    }

    // 2. Optimistic Update (Immediate Feedback)
    setOptimisticDeals(prev => prev.map(d => 
      d.id === dealId ? { ...d, stage: targetStage, status: newStatus, probability: newProbability } : d
    ));
    setMovingId(null);

    // 3. Server Update (Background)
    try {
      const res = await fetch(`/api/deals/${dealId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          stage: targetStage, 
          status: newStatus,
          probability: newProbability 
        })
      });
      
      if (!res.ok) {
        throw new Error("Failed to save");
      }
      
      // Success!
      setSaveStatus('saved');
      setLastSaved(new Date());
      
      // DO NOT call router.refresh() here. It causes the race condition.
      // We trust our local state. The server is updated.
      
      setTimeout(() => setSaveStatus('idle'), 2000); // Reset status after 2s

    } catch (e) {
      console.error(e);
      setSaveStatus('error');
      // On error, THEN we might want to refresh to get back to reality
      alert("Failed to save change. Refreshing...");
      router.refresh(); 
    }
  };

  const handleManualSave = () => {
    setSaveStatus('saving');
    router.refresh(); // This actually fetches fresh data from DB
    setTimeout(() => {
        setSaveStatus('saved');
        setLastSaved(new Date());
    }, 800);
  };

  return (
    <div className="flex flex-col h-full">
      
      {/* Controls Header (Mobile Tabs + Desktop Save Button) */}
      <div className="flex justify-between items-center mb-4 px-1 gap-4 sticky top-0 z-20 bg-base-300/95 backdrop-blur py-2">
        
        {/* Mobile Tabs */}
        <div className="lg:hidden flex overflow-x-auto no-scrollbar gap-2 flex-1">
            {columns.map(col => {
            const style = STAGE_STYLES[col.id] || STAGE_STYLES['Lead'];
            const isActive = activeMobileTab === col.id;
            return (
                <button
                key={col.id}
                onClick={() => {
                    setActiveMobileTab(col.id);
                    columnRefs.current[col.id]?.scrollIntoView({ behavior: 'smooth', inline: 'center' });
                }}
                className={`btn btn-sm rounded-full whitespace-nowrap flex-1 transition-all ${
                    isActive ? `btn-active border-none shadow-sm ${style.bg} ${style.text}` : 'btn-ghost'
                }`}
                >
                {col.title} <span className="opacity-50 text-[10px] ml-1">{col.items.length}</span>
                </button>
            );
            })}
        </div>

        {/* Sync Status / Manual Save (Visible on both) */}
        <div className="flex items-center gap-2 ml-auto">
            <span className="text-[10px] uppercase font-bold opacity-40 hidden sm:block">
                {saveStatus === 'saving' ? 'Syncing...' : 
                 saveStatus === 'saved' ? 'Saved' : 
                 saveStatus === 'error' ? 'Error' : 
                 `Last sync: ${lastSaved.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
            </span>
            
            <button 
                onClick={handleManualSave} 
                disabled={saveStatus === 'saving'}
                className={`btn btn-sm gap-2 ${saveStatus === 'error' ? 'btn-error' : 'btn-ghost bg-base-100 shadow-sm'}`}
            >
                {saveStatus === 'saving' ? (
                    <span className="loading loading-spinner loading-xs"></span>
                ) : saveStatus === 'saved' ? (
                    <CheckCircleIcon className="w-4 h-4 text-success" />
                ) : (
                    <ArrowPathIcon className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Force Save</span>
            </button>
        </div>
      </div>

      {/* Board Container */}
      <div 
        ref={containerRef}
        // DESKTOP LAYOUT FIX: Changed from grid to flex with flex-1/min-w-0 to force fit without scroll
        className="flex-1 lg:flex lg:gap-3 flex overflow-x-auto snap-x snap-mandatory gap-4 px-4 pb-4 custom-scrollbar"
      >
        {columns.map((col) => {
          const style = STAGE_STYLES[col.id] || STAGE_STYLES['Lead'];
          
          return (
            <div 
              key={col.id} 
              ref={el => { columnRefs.current[col.id] = el; }}
              // flex-1 on desktop forces equal width filling the screen
              className={`
                snap-center shrink-0 w-[85vw] md:w-[320px] 
                lg:w-auto lg:flex-1 lg:min-w-0
                flex flex-col h-full rounded-2xl ${style.bg} border border-base-200 transition-colors duration-300
              `}
              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              {/* Header */}
              <div className={`p-2 border-b border-base-200 flex justify-between items-center rounded-t-2xl bg-base-100/50 backdrop-blur-sm sticky top-0 z-10 border-t-4 ${style.border}`}>
                <div className="flex items-center gap-2 overflow-hidden min-w-0">
                  <h3 className={`font-black text-xs tracking-tight truncate ${style.text}`}>{col.title}</h3>
                  <span className={`badge badge-xs ${style.badge} font-mono shrink-0`}>{col.items.length}</span>
                </div>
                <div className="text-[10px] font-bold opacity-40 font-mono shrink-0">
                  ${col.total >= 1000 ? `${(col.total/1000).toFixed(1)}k` : col.total}
                </div>
              </div>

              {/* Drop Zone */}
              <div className="flex-1 overflow-y-auto p-1.5 space-y-2 custom-scrollbar min-h-[100px]">
                {col.items.map((deal) => (
                  <div 
                    key={deal.id} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, deal.id)}
                    onDragEnd={handleDragEnd}
                    className={`
                      card bg-base-100 shadow-sm border border-base-100 hover:shadow-md hover:border-primary/20 transition-all cursor-grab active:cursor-grabbing group select-none
                      ${movingId === deal.id ? 'opacity-40 scale-95 grayscale' : ''}
                    `}
                  >
                    <div className="card-body p-2 gap-1">
                      <div className="flex justify-between items-start">
                        <Link href={`/deals/${deal.id}`} className="font-bold text-xs leading-tight line-clamp-2 hover:text-primary transition-colors">
                          {deal.title}
                        </Link>
                        
                        {/* Mobile Move Menu */}
                        <div className="dropdown dropdown-end lg:hidden">
                          <div tabIndex={0} role="button" className="btn btn-xs btn-ghost btn-circle -mt-1 -mr-1">
                            <EllipsisHorizontalIcon className="w-3 h-3" />
                          </div>
                          <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-xl bg-base-100 rounded-box w-32 border border-base-200 text-xs">
                            {columns.filter(c => c.id !== col.id).map(c => (
                              <li key={c.id}>
                                <button onClick={() => handleMove(deal.id, c.id)}>{c.title}</button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="text-sm font-black tracking-tight flex items-center gap-2">
                         ${deal.amount.toLocaleString()}
                      </div>

                      <div className="flex justify-between items-end mt-1 pt-1 border-t border-base-content/5">
                        <div className="flex -space-x-1.5">
                           {deal.contacts.slice(0, 2).map(c => (
                             <div key={c.id} className="avatar w-4 h-4 ring-1 ring-base-100 rounded-full">
                               {c.imageUrl ? (
                                 <img src={c.imageUrl} alt={c.name} className="rounded-full" />
                               ) : (
                                 <div className="bg-neutral text-neutral-content text-[6px] flex items-center justify-center w-full h-full font-bold">{c.name.charAt(0)}</div>
                               )}
                             </div>
                           ))}
                        </div>
                        <span className="text-[9px] font-mono flex items-center gap-1 opacity-40">
                           <CalendarIcon className="w-3 h-3" />
                           {deal.updatedAt ? new Date(deal.updatedAt).toLocaleDateString(undefined, {month:'short', day:'numeric'}) : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}