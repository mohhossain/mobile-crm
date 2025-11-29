"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TrashIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";

interface Note {
  id: string;
  content: string;
  createdAt: Date;
}

export default function DealNotes({ dealId, initialNotes }: { dealId: string, initialNotes: Note[] }) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newNote, dealId }),
      });

      if (res.ok) {
        const addedNote = await res.json();
        setNotes((prev) => [...prev, addedNote]);
        setNewNote("");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (noteId: string) => {
    if (!confirm("Delete this note?")) return;
    
    try {
      const res = await fetch("/api/notes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: noteId }),
      });

      if (res.ok) {
        setNotes((prev) => prev.filter((n) => n.id !== noteId));
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="card bg-base-100 shadow-sm h-full">
      <div className="card-body p-4">
        <h3 className="font-bold text-lg mb-4">Activity & Notes</h3>
        
        {/* Notes List */}
        <div className="flex-1 overflow-y-auto max-h-[400px] space-y-4 mb-4 pr-2 custom-scrollbar">
          {notes.length === 0 && (
            <p className="text-gray-400 text-sm text-center italic py-8">No notes yet. Start the conversation!</p>
          )}
          {notes.map((note) => (
            <div key={note.id} className="chat chat-start">
               <div className="chat-bubble chat-bubble-secondary bg-base-200 text-base-content shadow-sm relative group">
                  <p className="whitespace-pre-wrap text-sm">{note.content}</p>
                  <div className="chat-footer opacity-50 text-[10px] mt-1">
                    {new Date(note.createdAt).toLocaleDateString()} {new Date(note.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                  <button 
                    onClick={() => handleDelete(note.id)}
                    className="btn btn-xs btn-circle btn-ghost absolute -top-2 -right-2 hidden group-hover:flex bg-base-100 shadow text-error"
                  >
                    <TrashIcon className="w-3 h-3" />
                  </button>
               </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <form onSubmit={handleAddNote} className="relative">
          <textarea
            className="textarea textarea-bordered w-full pr-10 resize-none"
            placeholder="Type a note..."
            rows={2}
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAddNote(e);
              }
            }}
          />
          <button 
            type="submit" 
            disabled={loading || !newNote.trim()}
            className="btn btn-sm btn-ghost absolute right-2 bottom-2 text-primary"
          >
            {loading ? <span className="loading loading-spinner loading-xs"></span> : <PaperAirplaneIcon className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
}