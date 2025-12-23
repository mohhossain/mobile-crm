"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  PencilSquareIcon, 
  LinkIcon,
  EyeIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import DeleteDealButton from '../DeleteDealButton';

interface HeaderProps {
  deal: any;
  onUpdate: (updates: any) => void;
  onRefresh: () => void;
}

const VISUAL_PIPELINE = ['Lead', 'Meeting', 'Proposal', 'Negotiation', 'Won'];

export default function DealHeader({ deal, onUpdate, onRefresh }: HeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [titleInput, setTitleInput] = useState(deal.title);
  const [amountInput, setAmountInput] = useState(deal.amount);

  const saveTitle = () => { onUpdate({ title: titleInput }); setIsEditingTitle(false); };
  const saveAmount = () => { onUpdate({ amount: parseFloat(amountInput) }); setIsEditingAmount(false); };

  const handleStageChange = (newStage: string) => {
    let updates: any = { stage: newStage };
    if (newStage === 'Won') {
      updates.status = 'WON';
      updates.probability = 100;
    } else {
      updates.status = 'OPEN';
      const idx = VISUAL_PIPELINE.indexOf(newStage);
      updates.probability = Math.round(((idx + 1) / VISUAL_PIPELINE.length) * 80);
    }
    onUpdate(updates);
  };

  const markAsLost = () => {
    onUpdate({ status: 'LOST', stage: 'Lost', probability: 0 });
  };

  const generateLink = async () => {
    const newToken = crypto.randomUUID();
    onUpdate({ shareToken: newToken });
    setTimeout(() => alert("Magic Link Generated! Click Share again."), 500);
  };

  const copyPortalLink = () => {
    if (!deal.shareToken) { generateLink(); return; }
    const link = `${window.location.origin}/portal/${deal.shareToken}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(link).then(() => alert("Copied Magic Link!")).catch(() => prompt("Copy link:", link));
    } else {
        prompt("Copy link:", link);
    }
  };

  const currentStage = deal.stage || 'Lead';

  return (
    <div className="bg-base-100 p-6 rounded-3xl shadow-sm border border-base-200 relative overflow-hidden">
        <div className={`absolute -top-10 -right-10 w-96 h-96 bg-gradient-to-br ${deal.status === 'WON' ? 'from-success/10' : deal.status === 'LOST' ? 'from-error/10' : 'from-primary/10'} to-transparent rounded-full blur-3xl pointer-events-none opacity-50`}></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
          <div className="flex-1 space-y-4">
             <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-50">
               <Link href="/deals" className="hover:text-primary transition">Pipeline</Link> 
               <span>/</span> 
               <span>{deal.status === 'OPEN' ? 'Active' : deal.status}</span>
             </div>

             <div>
               {isEditingTitle ? (
                 <input 
                   className="input input-lg text-3xl font-black w-full p-0 h-auto bg-transparent border-b-2 border-primary focus:outline-none"
                   value={titleInput}
                   onChange={e => setTitleInput(e.target.value)}
                   onBlur={saveTitle}
                   onKeyDown={e => e.key === 'Enter' && saveTitle()}
                   autoFocus
                 />
               ) : (
                 <h1 onClick={() => setIsEditingTitle(true)} className="text-3xl md:text-4xl font-black tracking-tight cursor-pointer hover:opacity-70 transition-opacity group flex items-center gap-2">
                   {deal.title}
                   <PencilSquareIcon className="w-5 h-5 opacity-0 group-hover:opacity-50" />
                 </h1>
               )}
             </div>

             <div className="max-w-xl">
                <div className="w-full bg-base-200 rounded-full h-2 mb-3 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-700 ease-out ${deal.status === 'LOST' ? 'bg-error' : 'bg-primary'}`} 
                    style={{ width: `${deal.probability}%` }}
                  ></div>
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {VISUAL_PIPELINE.map((stage) => (
                    <button
                      key={stage}
                      onClick={() => handleStageChange(stage)}
                      className={`btn btn-xs rounded-full whitespace-nowrap px-3 
                        ${currentStage === stage ? 'btn-neutral' : 'btn-ghost bg-base-200/50 hover:bg-base-200'}
                        ${stage === 'Won' && currentStage === 'Won' ? 'btn-success text-white' : ''}
                      `}
                    >
                      {stage}
                    </button>
                  ))}
                  <button 
                    onClick={markAsLost}
                    className={`btn btn-xs rounded-full px-3 ${deal.status === 'LOST' ? 'btn-error text-white' : 'btn-ghost hover:bg-error/10 hover:text-error'}`}
                  >
                    Lost
                  </button>
                </div>
             </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-4 min-w-[200px]">
             <div className="flex items-center gap-2">
                <DeleteDealButton dealId={deal.id} />
                
                {deal.shareToken ? (
                  <>
                    <button onClick={copyPortalLink} className="btn btn-sm btn-ghost gap-2" title="Copy Client Link">
                       <LinkIcon className="w-4 h-4" />
                    </button>
                    <Link href={`/portal/${deal.shareToken}`} target="_blank" className="btn btn-sm btn-outline gap-2">
                      Client Portal
                    </Link>
                  </>
                ) : (
                   <button onClick={generateLink} className="btn btn-sm btn-primary gap-2">
                      <LinkIcon className="w-4 h-4" /> Generate Magic Link
                   </button>
                )}
             </div>

             <div className="text-right">
                <div className="text-xs font-bold uppercase opacity-40 mb-1">Deal Value</div>
                {isEditingAmount ? (
                   <input 
                     type="number"
                     className="input input-lg text-4xl font-black w-48 p-0 h-auto bg-transparent border-b-2 border-success focus:outline-none text-right"
                     value={amountInput}
                     onChange={e => setAmountInput(e.target.value)}
                     onBlur={saveAmount}
                     onKeyDown={e => e.key === 'Enter' && saveAmount()}
                     autoFocus
                   />
                ) : (
                   <div onClick={() => setIsEditingAmount(true)} className="text-4xl font-black text-success cursor-pointer hover:opacity-80">
                     ${deal.amount.toLocaleString()}
                   </div>
                )}
             </div>
          </div>
        </div>
      </div>
  );
}