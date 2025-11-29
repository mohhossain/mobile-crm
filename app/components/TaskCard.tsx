"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircleIcon, TrashIcon, ClockIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon as SolidCheck } from "@heroicons/react/24/solid";

interface TaskProps {
  task: {
    id: string;
    title: string;
    description: string | null;
    dueDate: Date | null;
    status: string;
    priority: number;
    deal?: { title: string } | null;
  };
}

export default function TaskCard({ task }: TaskProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const toggleStatus = async () => {
    setLoading(true);
    const newStatus = task.status === 'DONE' ? 'TO_DO' : 'DONE';
    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async () => {
    if(!confirm("Delete this task?")) return;
    setLoading(true);
    try {
      await fetch(`/api/tasks/${task.id}`, { method: 'DELETE' });
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';

  return (
    <div className={`card bg-base-100 shadow-sm border-l-4 ${
       task.priority === 3 ? 'border-l-error' : task.priority === 2 ? 'border-l-warning' : 'border-l-success'
    } ${task.status === 'DONE' ? 'opacity-60' : ''}`}>
      <div className="card-body p-4 flex flex-row items-start gap-3">
        
        <button onClick={toggleStatus} disabled={loading} className="mt-1 text-primary hover:scale-110 transition">
          {task.status === 'DONE' ? (
            <SolidCheck className="w-6 h-6" />
          ) : (
            <CheckCircleIcon className="w-6 h-6" />
          )}
        </button>

        <div className="flex-1">
           <h3 className={`font-semibold ${task.status === 'DONE' ? 'line-through decoration-2' : ''}`}>
             {task.title}
           </h3>
           {task.description && <p className="text-sm text-gray-500 mt-1">{task.description}</p>}
           
           <div className="flex flex-wrap gap-2 mt-2 items-center">
             {task.dueDate && (
               <span className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-error font-bold' : 'text-gray-400'}`}>
                 <ClockIcon className="w-3 h-3" />
                 {new Date(task.dueDate).toLocaleDateString()}
               </span>
             )}
             {task.deal && (
               <span className="badge badge-xs badge-ghost">Deal: {task.deal.title}</span>
             )}
           </div>
        </div>

        <button onClick={deleteTask} disabled={loading} className="btn btn-ghost btn-xs btn-circle text-gray-400 hover:text-error">
          <TrashIcon className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
}