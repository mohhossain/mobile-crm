"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  PlusIcon, 
  CalendarIcon, 
  FlagIcon, 
  BriefcaseIcon, 
  XMarkIcon,
  ClockIcon
} from "@heroicons/react/24/outline";

export default function AddTasks({ onSuccess }: { onSuccess?: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [priority, setPriority] = useState("2");
  const [dealId, setDealId] = useState("");

  const [dealQuery, setDealQuery] = useState("");
  const [dealResults, setDealResults] = useState<any[]>([]);
  const [showDealSearch, setShowDealSearch] = useState(false);

  useEffect(() => {
    if (!dealQuery) { setDealResults([]); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/deals/search?query=${dealQuery}`);
        setDealResults(await res.json());
      } catch (e) { console.error(e); }
    }, 300);
    return () => clearTimeout(timer);
  }, [dealQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);

    try {
      let finalDate = null;
      if (date) {
        const timePart = time || "09:00";
        finalDate = new Date(`${date}T${timePart}`).toISOString();
      }

      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          dueDate: finalDate,
          priority: parseInt(priority),
          dealId: dealId || null
        })
      });

      if (res.ok) {
        setTitle(""); setDescription(""); setDate(""); setTime(""); setPriority("2"); setDealId(""); setDealQuery("");
        setIsExpanded(false);
        router.refresh();
        if (onSuccess) onSuccess();
      }
    } catch (e) {
      alert("Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`
      bg-base-100 border border-base-200 shadow-sm rounded-2xl transition-all duration-300 relative z-20
      ${isExpanded ? "p-4 ring-2 ring-primary/10" : "p-2 hover:border-primary/30"}
    `}>
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${isExpanded ? "bg-primary text-primary-content" : "bg-base-200 text-base-content/40"}`}>
            <PlusIcon className="w-5 h-5" />
          </div>
          <input 
            type="text" 
            placeholder="Add a new task..." 
            className="input input-ghost w-full focus:outline-none h-10 text-lg px-0 placeholder:text-base-content/40"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setIsExpanded(true)}
          />
          {isExpanded && (
            <button type="button" onClick={() => setIsExpanded(false)} className="btn btn-sm btn-circle btn-ghost">
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {isExpanded && (
          <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2">
            <textarea 
              className="textarea textarea-ghost w-full px-0 min-h-[60px] text-sm focus:outline-none resize-none" 
              placeholder="Description (optional)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="flex flex-wrap gap-2 items-center">
              
              {/* DATE PICKER (Fixed Visibility) */}
              <div className="relative">
                 <CalendarIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-primary pointer-events-none" />
                 <input 
                   type="date" 
                   className="input input-sm input-bordered rounded-full pl-9 w-auto text-xs"
                   value={date}
                   onChange={(e) => setDate(e.target.value)}
                 />
              </div>

              {date && (
                <div className="relative">
                   <ClockIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40 pointer-events-none" />
                   <input 
                     type="time" 
                     className="input input-sm input-bordered rounded-full pl-9 w-auto text-xs"
                     value={time}
                     onChange={(e) => setTime(e.target.value)}
                   />
                </div>
              )}

              {/* PRIORITY */}
              <div className="dropdown dropdown-top">
                <div tabIndex={0} role="button" className={`btn btn-sm rounded-full gap-2 px-3 ${priority === '3' ? 'btn-error text-white' : 'btn-ghost bg-base-200'}`}>
                  <FlagIcon className="w-3 h-3" /> 
                  <span className="text-xs">{priority === '3' ? 'High' : priority === '2' ? 'Medium' : 'Low'}</span>
                </div>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-32 mb-2 text-xs">
                  <li><a onClick={() => setPriority("1")}>Low</a></li>
                  <li><a onClick={() => setPriority("2")}>Medium</a></li>
                  <li><a onClick={() => setPriority("3")}>High</a></li>
                </ul>
              </div>

              {/* DEAL LINK */}
              <div className="relative">
                <button 
                  type="button"
                  onClick={() => setShowDealSearch(!showDealSearch)}
                  className={`btn btn-sm rounded-full gap-2 px-3 max-w-[150px] truncate ${dealId ? 'btn-secondary text-white' : 'btn-ghost bg-base-200'}`}
                >
                  <BriefcaseIcon className="w-3 h-3" />
                  <span className="text-xs truncate">{dealQuery || "Link Deal"}</span>
                </button>
                
                {showDealSearch && (
                  <div className="absolute top-full mt-2 left-0 w-64 bg-base-100 shadow-xl border border-base-200 rounded-xl p-2 z-50">
                    <input 
                      autoFocus
                      className="input input-sm input-bordered w-full mb-2 text-xs" 
                      placeholder="Search deals..." 
                      value={dealQuery}
                      onChange={(e) => { setDealQuery(e.target.value); if(!e.target.value) setDealId(""); }}
                    />
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {dealResults.map(d => (
                        <button 
                          key={d.id} 
                          type="button"
                          className="w-full text-left text-xs p-2 hover:bg-base-200 rounded-lg truncate"
                          onClick={() => { setDealId(d.id); setDealQuery(d.title); setShowDealSearch(false); }}
                        >
                          {d.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1"></div>

              <button 
                type="submit" 
                disabled={loading}
                className="btn btn-sm btn-primary rounded-full px-6"
              >
                {loading ? <span className="loading loading-spinner loading-xs"></span> : "Save"}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}