"use client";

import { useState, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, VideoCameraIcon, ClipboardDocumentCheckIcon } from "@heroicons/react/24/outline";

interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO date
  end: string;
  type: 'MEETING' | 'TASK';
  priority?: number;
  contactName?: string;
}

export default function CalendarGrid() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Modal State
  const [newTitle, setNewTitle] = useState("");
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");

  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDay = monthStart.getDay(); // 0 = Sunday
  const daysInMonth = monthEnd.getDate();

  const fetchEvents = async () => {
    setLoading(true);
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString();
    
    try {
      const res = await fetch(`/api/schedule?start=${start}&end=${end}`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/schedule', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          title: newTitle,
          startTime: newStart,
          endTime: newEnd
        })
      });
      setShowModal(false);
      setNewTitle("");
      fetchEvents();
    } catch (e) {
      alert("Failed to create meeting");
    }
  };

  // Helper to get events for a specific day number
  const getEventsForDay = (day: number) => {
    return events.filter(e => {
      const eventDate = new Date(e.start);
      return eventDate.getDate() === day && 
             eventDate.getMonth() === currentDate.getMonth() &&
             eventDate.getFullYear() === currentDate.getFullYear();
    });
  };

  // Generate grid cells
  const blanks = Array.from({ length: startDay }, (_, i) => <div key={`blank-${i}`} className="bg-base-200 min-h-[100px] border border-base-300 opacity-50"></div>);
  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const dayNum = i + 1;
    const dayEvents = getEventsForDay(dayNum);
    const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNum).toDateString();

    return (
      <div key={`day-${dayNum}`} className={`bg-base-100 min-h-[120px] border border-base-200 p-2 hover:bg-base-200 transition relative group ${isToday ? 'bg-indigo-50 border-indigo-200' : ''}`}>
        <div className="flex justify-between items-start">
           <span className={`text-sm font-bold ${isToday ? 'text-primary' : 'text-gray-500'}`}>{dayNum}</span>
           <button 
             onClick={() => {
                const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNum, 9, 0).toISOString().slice(0,16);
                setNewStart(dateStr);
                setNewEnd(dateStr);
                setShowModal(true);
             }}
             className="btn btn-xs btn-ghost btn-circle opacity-0 group-hover:opacity-100"
           >
             <PlusIcon className="w-3 h-3" />
           </button>
        </div>

        <div className="mt-1 space-y-1">
          {dayEvents.map(ev => (
            <div key={ev.id} className={`text-[10px] p-1 rounded border truncate flex items-center gap-1 cursor-pointer hover:opacity-80
               ${ev.type === 'MEETING' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-warning/10 text-warning-content border-warning/20'}
            `}>
              {ev.type === 'MEETING' ? <VideoCameraIcon className="w-3 h-3" /> : <ClipboardDocumentCheckIcon className="w-3 h-3" />}
              {ev.title}
            </div>
          ))}
        </div>
      </div>
    );
  });

  return (
    <div className="w-full">
      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          {loading && <span className="loading loading-spinner loading-xs"></span>}
        </h2>
        <div className="join">
          <button className="join-item btn btn-sm" onClick={() => changeMonth(-1)}><ChevronLeftIcon className="w-4 h-4" /></button>
          <button className="join-item btn btn-sm" onClick={() => setCurrentDate(new Date())}>Today</button>
          <button className="join-item btn btn-sm" onClick={() => changeMonth(1)}><ChevronRightIcon className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Grid Header */}
      <div className="grid grid-cols-7 mb-1 text-center font-semibold text-gray-500 text-sm">
        <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
      </div>

      {/* Grid Body */}
      <div className="grid grid-cols-7 gap-1 bg-base-300 border border-base-300 rounded-lg overflow-hidden">
        {blanks}
        {days}
      </div>

      {/* Add Meeting Modal */}
      {showModal && (
        <dialog open className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Schedule Meeting</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <input 
                className="input input-bordered w-full" 
                placeholder="Meeting Title (e.g., Demo with Acme)" 
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label text-xs">Start</label>
                  <input type="datetime-local" className="input input-bordered" value={newStart} onChange={e => setNewStart(e.target.value)} required />
                </div>
                <div className="form-control">
                  <label className="label text-xs">End</label>
                  <input type="datetime-local" className="input input-bordered" value={newEnd} onChange={e => setNewEnd(e.target.value)} required />
                </div>
              </div>
              <div className="modal-action">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Schedule</button>
              </div>
            </form>
          </div>
        </dialog>
      )}
    </div>
  );
}