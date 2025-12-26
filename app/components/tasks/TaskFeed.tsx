"use client";

import { useState } from "react";
import { 
  CheckCircleIcon, 
  PlusIcon, 
  CalendarIcon, 
  FlagIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ClockIcon
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/24/solid";
import Link from "next/link";

interface Task {
  id: string;
  title: string;
  dueDate: Date | string | null;
  priority: number;
  status: string;
  deal?: { id: string, title: string };
}

export default function TaskFeed({ initialTasks, userId }: { initialTasks: Task[], userId: string }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState<'ALL' | 'HIGH' | 'DUE'>('ALL');
  const [quickTitle, setQuickTitle] = useState("");
  const [loading, setLoading] = useState(false);

  // --- ACTIONS ---

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    setLoading(true);

    try {
      // Default to "Due Today" and "Medium Priority" for quick adds
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: quickTitle,
          dueDate: new Date().toISOString(), 
          priority: 2
        })
      });
      
      if (res.ok) {
        const newTask = await res.json();
        setTasks(prev => [newTask, ...prev]);
        setQuickTitle("");
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const toggleStatus = async (taskId: string, currentStatus: string) => {
    // Optimistic Update
    const newStatus = currentStatus === 'DONE' ? 'TO_DO' : 'DONE';
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (e) {
      console.error(e);
      // Revert on error could go here
    }
  };

  // --- GROUPING LOGIC ---
  const activeTasks = tasks.filter(t => t.status !== 'DONE');
  
  const groupedTasks = {
    overdue: activeTasks.filter(t => {
      if (!t.dueDate) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return new Date(t.dueDate) < today;
    }),
    today: activeTasks.filter(t => {
      if (!t.dueDate) return false;
      const d = new Date(t.dueDate);
      const now = new Date();
      return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }),
    upcoming: activeTasks.filter(t => {
      if (!t.dueDate) return true; // No date = upcoming/backlog
      const d = new Date(t.dueDate);
      const now = new Date();
      now.setHours(23,59,59,999);
      return d > now;
    })
  };

  // Filter Application
  const getDisplayTasks = (group: Task[]) => {
    if (filter === 'HIGH') return group.filter(t => t.priority === 3);
    return group;
  };

  const completedCount = tasks.filter(t => t.status === 'DONE').length;

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-2rem)] flex flex-col">
      
      {/* 1. HERO HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 shrink-0">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-base-content">My Tasks</h1>
          <p className="text-sm text-base-content/60 font-medium mt-1">
            You have <span className="text-primary font-bold">{activeTasks.length}</span> active tasks and <span className="text-success font-bold">{completedCount}</span> completed.
          </p>
        </div>
        
        {/* Filter Pills */}
        <div className="join bg-base-100 shadow-sm border border-base-200 p-1 rounded-xl">
          <button 
            onClick={() => setFilter('ALL')} 
            className={`btn btn-sm join-item border-none ${filter === 'ALL' ? 'bg-base-200 text-base-content font-bold' : 'btn-ghost font-normal'}`}
          >All</button>
          <button 
            onClick={() => setFilter('HIGH')} 
            className={`btn btn-sm join-item border-none ${filter === 'HIGH' ? 'bg-error/10 text-error font-bold' : 'btn-ghost font-normal'}`}
          >High Priority</button>
        </div>
      </div>

      {/* 2. QUICK ADD BAR */}
      <div className="shrink-0 mb-8 relative group z-20">
        <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-xl group-hover:bg-primary/10 transition-all"></div>
        <form onSubmit={handleQuickAdd} className="relative flex items-center bg-base-100 rounded-2xl shadow-lg shadow-base-300/50 border border-base-200 p-2">
          <div className="w-12 h-12 flex items-center justify-center text-primary">
            {loading ? <span className="loading loading-spinner loading-sm"></span> : <PlusIcon className="w-6 h-6" />}
          </div>
          <input 
            type="text" 
            placeholder="What needs to be done? (Press Enter)" 
            className="input input-ghost w-full focus:outline-none text-lg placeholder:text-base-content/30 h-12"
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm rounded-xl px-6 mr-2">Add</button>
        </form>
      </div>

      {/* 3. TASK FEED (Scrollable) */}
      <div className="flex-1 overflow-y-auto pr-2 pb-20 custom-scrollbar space-y-8">
        
        {/* SECTION: OVERDUE */}
        {groupedTasks.overdue.length > 0 && getDisplayTasks(groupedTasks.overdue).length > 0 && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h3 className="text-xs font-bold uppercase tracking-widest text-error mb-3 flex items-center gap-2">
              <ExclamationCircleIcon className="w-4 h-4" /> Overdue
            </h3>
            <div className="space-y-2">
              {getDisplayTasks(groupedTasks.overdue).map(task => <TaskItem key={task.id} task={task} onToggle={toggleStatus} />)}
            </div>
          </section>
        )}

        {/* SECTION: TODAY */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-75">
          <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" /> Today
          </h3>
          {getDisplayTasks(groupedTasks.today).length === 0 ? (
            <div className="p-8 border-2 border-dashed border-base-200 rounded-2xl text-center text-base-content/40 text-sm">
              No tasks due today. You're clear!
            </div>
          ) : (
            <div className="space-y-2">
              {getDisplayTasks(groupedTasks.today).map(task => <TaskItem key={task.id} task={task} onToggle={toggleStatus} />)}
            </div>
          )}
        </section>

        {/* SECTION: UPCOMING */}
        {getDisplayTasks(groupedTasks.upcoming).length > 0 && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <h3 className="text-xs font-bold uppercase tracking-widest text-base-content/40 mb-3 flex items-center gap-2">
              <ClockIcon className="w-4 h-4" /> Upcoming
            </h3>
            <div className="space-y-2">
              {getDisplayTasks(groupedTasks.upcoming).map(task => <TaskItem key={task.id} task={task} onToggle={toggleStatus} />)}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}

// --- SUB-COMPONENT: INDIVIDUAL TASK ROW ---
function TaskItem({ task, onToggle }: { task: Task, onToggle: (id: string, status: string) => void }) {
  // Visuals based on priority
  const priorityColor = task.priority === 3 ? "border-l-error bg-error/5" : task.priority === 2 ? "border-l-warning bg-warning/5" : "border-l-transparent hover:bg-base-50";
  
  return (
    <div className={`group flex items-center gap-4 p-4 bg-base-100 rounded-xl border border-base-200 shadow-sm hover:shadow-md transition-all border-l-[3px] ${priorityColor}`}>
      
      {/* Checkbox */}
      <button 
        onClick={() => onToggle(task.id, task.status)}
        className="text-base-content/20 hover:text-primary transition-colors active:scale-90 transform duration-200"
      >
        <CheckCircleIcon className="w-6 h-6" />
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm text-base-content truncate">{task.title}</h4>
        <div className="flex items-center gap-3 mt-1 text-xs text-base-content/50">
          {task.dueDate && (
            <span className={`flex items-center gap-1 ${new Date(task.dueDate) < new Date() ? 'text-error font-medium' : ''}`}>
              <CalendarIcon className="w-3 h-3" />
              {new Date(task.dueDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
            </span>
          )}
          
          {task.deal && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 bg-base-200 rounded text-[10px] font-medium truncate max-w-[120px]">
              <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>
              {task.deal.title}
            </span>
          )}

          {task.priority === 3 && (
            <span className="text-error font-bold flex items-center gap-1">
              <FlagIcon className="w-3 h-3" /> High
            </span>
          )}
        </div>
      </div>

      {/* Edit Trigger (Could open a modal, keeping it simple for now) */}
      <button className="btn btn-ghost btn-xs opacity-0 group-hover:opacity-100 transition-opacity">
        Edit
      </button>
    </div>
  );
}

// Icon Helper
function ExclamationCircleIcon({className}: {className: string}) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  );
}