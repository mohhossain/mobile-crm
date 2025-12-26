"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  CheckCircleIcon, 
  TrashIcon, 
  CalendarIcon, 
  PencilIcon, 
  XMarkIcon, 
  CheckIcon,
  BriefcaseIcon,
  FlagIcon
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as SolidCheck } from "@heroicons/react/24/solid";

interface TaskProps {
  task: {
    id: string;
    title: string;
    description: string | null;
    dueDate: Date | string | null;
    status: string;
    priority: number;
    deal?: { id: string, title: string } | null;
  };
}

export default function TaskCard({ task }: TaskProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState(task.title);
  const [desc, setDesc] = useState(task.description || "");
  const [priority, setPriority] = useState(task.priority);
  
  const initialDate = task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "";
  const initialTime = task.dueDate ? new Date(task.dueDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false}) : "";
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState(initialTime);

  const toggleStatus = async () => {
    setLoading(true);
    const newStatus = task.status === 'DONE' ? 'TO_DO' : 'DONE';
    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      router.refresh();
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let finalDate = null;
      if (date) {
        const timePart = time || "09:00";
        finalDate = new Date(`${date}T${timePart}`).toISOString();
      }

      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description: desc, priority, dueDate: finalDate })
      });

      if (res.ok) { setIsEditing(false); router.refresh(); }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if(!confirm("Delete this task?")) return;
    try {
      await fetch(`/api/tasks/${task.id}`, { method: 'DELETE' });
      router.refresh();
    } catch (e) { console.error(e); }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';

  return (
    <div className={`
      group relative bg-base-100 border border-base-200 rounded-xl p-4 transition-all hover:shadow-sm
      ${task.status === 'DONE' ? 'opacity-50 bg-base-50' : ''}
      ${task.priority === 3 && task.status !== 'DONE' ? 'border-l-4 border-l-error' : ''}
    `}>
      
      {!isEditing ? (
        <div className="flex items-start gap-4">
          <button 
            onClick={toggleStatus} 
            disabled={loading}
            className={`mt-1 flex-shrink-0 transition-colors ${task.status === 'DONE' ? 'text-success' : 'text-base-content/20 hover:text-primary'}`}
          >
            {task.status === 'DONE' ? <SolidCheck className="w-6 h-6" /> : <CheckCircleIcon className="w-6 h-6" />}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <h3 className={`font-semibold text-sm ${task.status === 'DONE' ? 'line-through text-base-content/50' : ''}`}>
                {task.title}
              </h3>
              
              {/* ACTION BUTTONS: Always visible on mobile (opacity-100), Hover on desktop */}
              <div className="flex gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                <button onClick={() => setIsEditing(true)} className="btn btn-square btn-xs btn-ghost text-base-content/50 bg-base-200 lg:bg-transparent">
                  <PencilIcon className="w-3 h-3" />
                </button>
                <button onClick={handleDelete} className="btn btn-square btn-xs btn-ghost text-error bg-base-200 lg:bg-transparent">
                  <TrashIcon className="w-3 h-3" />
                </button>
              </div>
            </div>

            {task.description && <p className="text-xs text-base-content/60 mt-1 line-clamp-1">{task.description}</p>}

            <div className="flex flex-wrap gap-2 mt-2 items-center">
              {task.dueDate && (
                <div className={`flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-md ${isOverdue ? 'bg-error/10 text-error' : 'bg-base-200 text-base-content/60'}`}>
                  <CalendarIcon className="w-3 h-3" />
                  {new Date(task.dueDate).toLocaleDateString()} 
                </div>
              )}
              {task.deal && (
                <div className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-md bg-secondary/10 text-secondary">
                  <BriefcaseIcon className="w-3 h-3" />
                  {task.deal.title}
                </div>
              )}
              {task.priority === 3 && (
                <div className="flex items-center gap-1 text-[10px] font-bold text-error">
                  <FlagIcon className="w-3 h-3" /> High
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Edit Mode */
        <div className="space-y-3 animate-in fade-in">
          <input className="input input-sm input-bordered w-full font-bold" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
          <textarea className="textarea textarea-sm textarea-bordered w-full" value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} />
          
          <div className="flex flex-wrap gap-2 items-center">
            <input type="date" className="input input-xs input-bordered" value={date} onChange={(e) => setDate(e.target.value)} />
            <input type="time" className="input input-xs input-bordered" value={time} onChange={(e) => setTime(e.target.value)} />
            <select className="select select-xs select-bordered" value={priority} onChange={(e) => setPriority(parseInt(e.target.value))}>
              <option value={1}>Low</option><option value={2}>Medium</option><option value={3}>High</option>
            </select>
            <div className="flex-1"></div>
            <button onClick={() => setIsEditing(false)} className="btn btn-xs btn-ghost">Cancel</button>
            <button onClick={handleSave} disabled={loading} className="btn btn-xs btn-primary">Save</button>
          </div>
        </div>
      )}
    </div>
  );
}