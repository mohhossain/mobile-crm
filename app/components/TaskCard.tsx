"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  CheckCircleIcon, 
  TrashIcon, 
  ClockIcon, 
  PencilSquareIcon, 
  XMarkIcon,
  CheckIcon,
  CalendarDaysIcon,
  ArrowDownTrayIcon,
  ArrowTopRightOnSquareIcon
} from "@heroicons/react/24/outline";
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
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  
  // Notification State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description || "");
  const [editDate, setEditDate] = useState(() => {
    if (!task.dueDate) return "";
    return new Date(task.dueDate).toISOString().split('T')[0];
  });
  const [editTime, setEditTime] = useState(() => {
    if (!task.dueDate) return "";
    return new Date(task.dueDate).toISOString().split('T')[1].substring(0, 5);
  });
  const [editPriority, setEditPriority] = useState(task.priority);

  const router = useRouter();

  // --- Helper: Show Toast ---
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // --- Calendar Utilities ---

  const getEventDates = () => {
    if (!task.dueDate) return null;
    const start = new Date(task.dueDate);
    const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 Hour
    
    const format = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");
    return { start: format(start), end: format(end) };
  };

  const handleGoogleCalendar = () => {
    const dates = getEventDates();
    if (!dates) return;
    
    const url = new URL("https://calendar.google.com/calendar/render");
    url.searchParams.append("action", "TEMPLATE");
    url.searchParams.append("text", task.title);
    url.searchParams.append("details", task.description || "");
    url.searchParams.append("dates", `${dates.start}/${dates.end}`);
    
    // Open in new tab (Capacitor handles this by opening system browser/app)
    window.open(url.toString(), "_blank");
    setShowCalendarModal(false);
  };

  const handleDownloadICS = async () => {
    if (!task.dueDate) return;
    const dates = getEventDates();
    if (!dates) return;

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Pulse//Task Manager//EN
BEGIN:VEVENT
UID:${task.id}@pulse.app
DTSTAMP:${dates.start}
DTSTART:${dates.start}
DTEND:${dates.end}
SUMMARY:${task.title}
DESCRIPTION:${task.description || ""}
END:VEVENT
END:VCALENDAR`;

    const fileName = `${task.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
    const file = new File([icsContent], fileName, { type: 'text/calendar' });

    // Try Native Share first (Works best on Mobile)
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: task.title,
          text: 'Add to your calendar'
        });
        setShowCalendarModal(false);
        return;
      } catch (e) {
        console.log("Share skipped", e);
      }
    }

    // Fallback: Direct Download (Works on Desktop)
    const uri = "data:text/calendar;charset=utf-8," + encodeURIComponent(icsContent);
    const link = document.createElement("a");
    link.href = uri;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowCalendarModal(false);
  };

  // --- Handlers ---
  const handleAddToCalendar = () => {
    if (!task.dueDate) {
      showToast("This task has no due date set.", "error");
      return;
    }
    setShowCalendarModal(true);
  };

  const toggleStatus = async () => {
    setLoading(true);
    const newStatus = task.status === 'DONE' ? 'TO_DO' : 'DONE';
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        router.refresh();
        showToast(`Task marked as ${newStatus === 'DONE' ? 'Done' : 'To Do'}`, "success");
      }
    } catch (e) {
      console.error(e);
      showToast("Failed to update status", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let finalDate = null;
      if (editDate) {
        const timePart = editTime || "00:00"; 
        finalDate = `${editDate}T${timePart}:00.000Z`;
      }

      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          description: editDesc,
          dueDate: finalDate,
          priority: editPriority
        })
      });

      if (!res.ok) throw new Error("Failed to update");
      
      setIsEditing(false);
      showToast("Task updated successfully", "success");
      router.refresh();
    } catch (e) {
      console.error(e);
      showToast("Failed to save changes", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, { method: 'DELETE' });
      if (res.ok) {
        router.refresh();
        showToast("Task deleted", "success");
      }
    } catch (e) {
      console.error(e);
      showToast("Failed to delete task", "error");
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';

  return (
    <>
      <div className={`card bg-base-100 shadow-sm border-l-4 ${
         task.priority === 3 ? 'border-l-error' : task.priority === 2 ? 'border-l-warning' : 'border-l-success'
      } ${task.status === 'DONE' ? 'opacity-60 bg-base-200' : ''} transition-all duration-300`}>
        
        <div className="card-body p-4 flex flex-row items-start gap-3 relative group">
          
          {!isEditing && (
            <button onClick={toggleStatus} disabled={loading} className="mt-1 text-primary hover:scale-110 transition">
              {task.status === 'DONE' ? <SolidCheck className="w-6 h-6" /> : <CheckCircleIcon className="w-6 h-6" />}
            </button>
          )}

          <div className="flex-1 min-w-0">
             {isEditing ? (
               <div className="flex flex-col gap-2">
                 <input className="input input-sm input-bordered w-full font-bold" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                 <textarea className="textarea textarea-sm textarea-bordered w-full" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={2} />
                 <div className="flex flex-wrap gap-2">
                   <input type="date" className="input input-sm input-bordered flex-grow min-w-[120px]" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
                   <input type="time" className="input input-sm input-bordered w-24" value={editTime} onChange={(e) => setEditTime(e.target.value)} />
                   <select className="select select-sm select-bordered w-full sm:w-auto" value={editPriority} onChange={(e) => setEditPriority(Number(e.target.value))}>
                     <option value={1}>Low</option><option value={2}>Medium</option><option value={3}>High</option>
                   </select>
                 </div>
                 <div className="flex gap-2 justify-end mt-2">
                   <button onClick={() => setIsEditing(false)} className="btn btn-xs btn-ghost gap-1"><XMarkIcon className="w-3 h-3" /> Cancel</button>
                   <button onClick={handleSave} className="btn btn-xs btn-primary gap-1" disabled={loading}><CheckIcon className="w-3 h-3" /> Save</button>
                 </div>
               </div>
             ) : (
               <>
                 <h3 className={`font-semibold truncate transition-all ${task.status === 'DONE' ? 'line-through decoration-2 text-gray-400' : ''}`}>{task.title}</h3>
                 {task.description && <p className={`text-sm mt-1 line-clamp-2 ${task.status === 'DONE' ? 'text-gray-300' : 'text-gray-500'}`}>{task.description}</p>}
                 
                 <div className="flex flex-wrap gap-2 mt-2 items-center">
                   {task.dueDate && (
                     <span className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-error font-bold' : 'text-gray-400'}`}>
                       <ClockIcon className="w-3 h-3" />
                       {new Date(task.dueDate).toLocaleDateString()} 
                       <span className="opacity-50">{new Date(task.dueDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                     </span>
                   )}
                   {task.deal && <span className="badge badge-xs badge-ghost">Deal: {task.deal.title}</span>}
                 </div>
               </>
             )}
          </div>

          {!isEditing && (
            <div className="flex flex-col gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              <button onClick={() => setIsEditing(true)} className="btn btn-ghost btn-xs btn-circle text-gray-400 hover:text-primary hover:bg-base-200"><PencilSquareIcon className="w-4 h-4" /></button>
              {task.dueDate && (
                <button onClick={handleAddToCalendar} className="btn btn-ghost btn-xs btn-circle text-gray-400 hover:text-secondary hover:bg-base-200" title="Add to Calendar">
                  <CalendarDaysIcon className="w-4 h-4" />
                </button>
              )}
              <button onClick={() => setShowDeleteModal(true)} className="btn btn-ghost btn-xs btn-circle text-gray-400 hover:text-error hover:bg-red-50"><TrashIcon className="w-4 h-4" /></button>
            </div>
          )}
        </div>
      </div>

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="toast toast-bottom toast-center z-[100]">
          <div className={`alert ${toast.type === 'error' ? 'alert-error' : toast.type === 'success' ? 'alert-success' : 'alert-info'} shadow-lg text-white text-sm py-2 min-h-0`}>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      {showDeleteModal && (
        <dialog open className="modal modal-bottom sm:modal-middle bg-black/50 backdrop-blur-sm z-50">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Delete Task?</h3>
            <p className="py-4">Are you sure you want to delete <strong>{task.title}</strong>?</p>
            <div className="modal-action">
              <button className="btn" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="btn btn-error" onClick={handleDelete}>Delete</button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowDeleteModal(false)}></div>
        </dialog>
      )}

      {/* CALENDAR OPTIONS */}
      {showCalendarModal && (
        <dialog open className="modal modal-bottom sm:modal-middle bg-black/50 backdrop-blur-sm z-50">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <CalendarDaysIcon className="w-6 h-6 text-primary" />
              Add to Calendar
            </h3>
            <div className="flex flex-col gap-2">
              <button 
                onClick={handleGoogleCalendar}
                className="btn btn-outline justify-start gap-3 h-auto py-3"
              >
                <ArrowTopRightOnSquareIcon className="w-5 h-5 text-blue-500" />
                <div className="text-left">
                  <div className="font-bold">Google Calendar</div>
                  <div className="text-[10px] opacity-60">Opens browser (Best for Android)</div>
                </div>
              </button>

              <button 
                onClick={handleDownloadICS}
                className="btn btn-outline justify-start gap-3 h-auto py-3"
              >
                <ArrowDownTrayIcon className="w-5 h-5 text-gray-500" />
                <div className="text-left">
                  <div className="font-bold">Device Calendar (.ics)</div>
                  <div className="text-[10px] opacity-60">Save file (Apple / Outlook)</div>
                </div>
              </button>
            </div>
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setShowCalendarModal(false)}>Close</button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowCalendarModal(false)}></div>
        </dialog>
      )}
    </>
  );
}