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

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [priority, setPriority] = useState("2"); // 2 = Medium
  const [dealId, setDealId] = useState("");

  // Deal Search State
  const [dealQuery, setDealQuery] = useState("");
  const [dealResults, setDealResults] = useState<any[]>([]);
  const [showDealSearch, setShowDealSearch] = useState(false);

  // Search Deals Effect
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
      // Combine Date & Time into ISO string
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
        // Reset Form
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
        {/* Main Input Row */}
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${isExpanded ? "bg-primary text-primary-content" : "bg-base-200 text-base-content/40"}`}>
            <PlusIcon className="w-5 h-5" />
          </div>
          <input 
            type="text" 
            placeholder="What needs to be done?" 
            className="input input-ghost w-full focus:outline-none h-10 text-lg px-0 placeholder:text-base-content/40"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setIsExpanded(true)}
          />
          {isExpanded && (
            <button 
              type="button" 
              onClick={() => setIsExpanded(false)} 
              className="btn btn-sm btn-circle btn-ghost"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Expanded Options Panel */}
        {isExpanded && (
          <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2">
            
            <textarea 
              className="textarea textarea-ghost w-full px-0 min-h-[60px] text-sm focus:outline-none resize-none placeholder:text-base-content/30" 
              placeholder="Add details, notes, or subtasks..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="flex flex-wrap gap-2 items-center">
              
              {/* Date & Time Picker Group */}
              <div className="join border border-base-200 rounded-lg p-0.5 bg-base-50/50">
                <div className="tooltip" data-tip="Due Date">
                    <input 
                    type="date" 
                    className="input input-xs input-ghost join-item focus:bg-base-200"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    />
                </div>
                {date && (
                  <div className="tooltip" data-tip="Time">
                    <input 
                        type="time" 
                        className="input input-xs input-ghost join-item focus:bg-base-200"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Priority Selector */}
              <div className="dropdown dropdown-top">
                <div tabIndex={0} role="button" className={`btn btn-xs gap-2 ${priority === '3' ? 'btn-error text-white' : 'btn-ghost border border-base-200'}`}>
                  <FlagIcon className="w-3 h-3" /> 
                  {priority === '3' ? 'High' : priority === '2' ? 'Medium' : 'Low'}
                </div>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-32 mb-2">
                  <li><a onClick={() => setPriority("1")}>Low</a></li>
                  <li><a onClick={() => setPriority("2")}>Medium</a></li>
                  <li><a onClick={() => setPriority("3")}>High</a></li>
                </ul>
              </div>

              {/* Deal Link Search */}
              <div className="relative">
                <button 
                  type="button"
                  onClick={() => setShowDealSearch(!showDealSearch)}
                  className={`btn btn-xs gap-2 max-w-[150px] truncate ${dealId ? 'btn-secondary text-white' : 'btn-ghost border border-base-200'}`}
                >
                  <BriefcaseIcon className="w-3 h-3" />
                  {dealQuery || "Link Deal"}
                </button>
                
                {showDealSearch && (
                  <div className="absolute top-full mt-2 left-0 w-64 bg-base-100 shadow-xl border border-base-200 rounded-xl p-2 z-50">
                    <input 
                      autoFocus
                      className="input input-sm input-bordered w-full mb-2" 
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
                      {dealResults.length === 0 && dealQuery && <div className="text-xs text-center opacity-50 p-2">No deals found</div>}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1"></div>

              <button 
                type="submit" 
                disabled={loading}
                className="btn btn-sm btn-primary rounded-lg px-6"
              >
                {loading ? <span className="loading loading-spinner loading-xs"></span> : "Add Task"}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}