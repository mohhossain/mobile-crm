"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, CalendarIcon } from "@heroicons/react/24/solid";

export default function QuickTaskForm({ dealId }: { dealId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState(""); // New separate time state
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    setLoading(true);

    // Combine date and time if date is present
    let finalDueDate = null;
    if (date) {
      const timePart = time || "09:00"; // Default tasks to 9 AM if no time set
      finalDueDate = new Date(`${date}T${timePart}`).toISOString();
    }

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          dueDate: finalDueDate,
          dealId,
          priority: 2 // Default medium
        })
      });

      if (res.ok) {
        setTitle("");
        setDate("");
        setTime("");
        setIsOpen(false);
        router.refresh();
      }
    } catch (e) {
      console.error(e);
      alert("Failed to add task");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="btn btn-sm btn-ghost border-dashed border-base-300 w-full text-gray-500 hover:text-primary hover:border-primary"
      >
        <PlusIcon className="w-4 h-4" /> Add Task
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-base-200 p-3 rounded-lg animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex flex-col gap-2">
        <input 
          autoFocus
          className="input input-sm input-bordered w-full"
          placeholder="What needs to be done?"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <div className="flex flex-wrap gap-2 items-center">
          <div className="join flex-1">
            <input 
              type="date" 
              className="input input-sm input-bordered join-item flex-grow min-w-[120px]"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
            {date && (
              <input 
                type="time" 
                className="input input-sm input-bordered join-item w-28"
                value={time}
                onChange={e => setTime(e.target.value)}
              />
            )}
          </div>
          
          <div className="flex gap-2 ml-auto">
            <button type="button" onClick={() => setIsOpen(false)} className="btn btn-sm btn-ghost" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-sm btn-primary" disabled={loading}>
              {loading ? "..." : "Add"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}