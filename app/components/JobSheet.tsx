"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  PlusIcon, 
  CheckCircleIcon, 
  EllipsisHorizontalIcon,
  TrashIcon,
  PencilSquareIcon,
  CheckIcon
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as SolidCheck } from "@heroicons/react/24/solid";

// TYPES
interface Task {
  id: string;
  title: string;
  status: string;
  stage: string | null;
}

interface Stage {
  id: string;
  title: string;
  status: 'PENDING' | 'ACTIVE' | 'DONE';
}

interface JobSheetProps {
  dealId: string;
  roadmap: Stage[];
  tasks: Task[];
  onUpdate: () => void;
}

export default function JobSheet({ dealId, roadmap, tasks, onUpdate }: JobSheetProps) {
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [stageNameInput, setStageNameInput] = useState("");
  const [newTaskInput, setNewTaskInput] = useState("");
  const [addingTaskToStage, setAddingTaskToStage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // --- HANDLERS ---

  // 1. Stage Management
  const updateRoadmap = async (newRoadmap: Stage[]) => {
    try {
      await fetch(`/api/deals/${dealId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roadmap: newRoadmap }),
      });
      onUpdate();
    } catch (e) {
      console.error("Failed to update roadmap", e);
    }
  };

  const handleRenameStage = (id: string) => {
    if (!stageNameInput.trim()) return;
    const newRoadmap = roadmap.map(s => s.id === id ? { ...s, title: stageNameInput } : s);
    updateRoadmap(newRoadmap);
    setEditingStageId(null);
  };

  const handleAddStage = () => {
    const id = `stage-${Date.now()}`;
    const newRoadmap = [...roadmap, { id, title: "New Stage", status: "PENDING" as const }];
    updateRoadmap(newRoadmap);
  };

  const handleDeleteStage = (id: string) => {
    if(!confirm("Delete this stage? Tasks in it will be unassigned.")) return;
    const newRoadmap = roadmap.filter(s => s.id !== id);
    updateRoadmap(newRoadmap);
  };

  // 2. Task Management
  const handleAddTask = async (stageId: string) => {
    if (!newTaskInput.trim()) return;
    setLoading(true);
    try {
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTaskInput,
          dealId,
          stage: stageId,
          priority: 2
        }),
      });
      setNewTaskInput("");
      setAddingTaskToStage(null);
      onUpdate();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskStatus = async (task: Task) => {
    const newStatus = task.status === 'DONE' ? 'TO_DO' : 'DONE';
    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      onUpdate();
    } catch (e) { console.error(e); }
  };

  const deleteTask = async (taskId: string) => {
    if(!confirm("Delete task?")) return;
    try {
      await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      onUpdate();
    } catch (e) { console.error(e); }
  };

  // Helper to check if a stage is complete
  const isStageComplete = (stageId: string) => {
    const stageTasks = tasks.filter(t => t.stage === stageId);
    return stageTasks.length > 0 && stageTasks.every(t => t.status === 'DONE');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Intro */}
      <div className="flex justify-between items-end px-1">
        <div>
          <h3 className="font-bold text-lg">Job Sheet</h3>
          <p className="text-sm text-base-content/60">Your master checklist for this gig.</p>
        </div>
        <button onClick={handleAddStage} className="btn btn-sm btn-ghost gap-2 border border-base-300">
          <PlusIcon className="w-4 h-4" /> Add Stage
        </button>
      </div>

      {/* STAGES TIMELINE */}
      <div className="relative border-l-2 border-base-200 ml-4 space-y-8 pb-4">
        
        {roadmap.map((stage, index) => {
          const stageTasks = tasks.filter(t => t.stage === stage.id);
          const isComplete = isStageComplete(stage.id);
          const isActive = !isComplete && (index === 0 || isStageComplete(roadmap[index - 1].id));
          
          return (
            <div key={stage.id} className="relative pl-8 group">
              
              {/* Timeline Node */}
              <div 
                className={`
                  absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 transition-all duration-300
                  ${isComplete ? 'bg-success border-success' : isActive ? 'bg-primary border-primary animate-pulse' : 'bg-base-100 border-base-300'}
                `}
              >
                {isComplete && <CheckIcon className="w-2.5 h-2.5 text-white absolute top-0.5 left-0.5" />}
              </div>

              {/* Stage Header */}
              <div className="flex justify-between items-center mb-3">
                {editingStageId === stage.id ? (
                  <div className="flex gap-2 items-center">
                    <input 
                      autoFocus
                      className="input input-sm input-bordered"
                      value={stageNameInput}
                      onChange={e => setStageNameInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleRenameStage(stage.id)}
                    />
                    <button onClick={() => handleRenameStage(stage.id)} className="btn btn-xs btn-primary"><CheckIcon className="w-3 h-3" /></button>
                  </div>
                ) : (
                  <h4 
                    className={`font-bold text-lg cursor-pointer hover:text-primary transition-colors flex items-center gap-2 ${isComplete ? 'text-success line-through opacity-70' : ''}`}
                    onClick={() => { setEditingStageId(stage.id); setStageNameInput(stage.title); }}
                  >
                    {stage.title}
                    <PencilSquareIcon className="w-3 h-3 opacity-0 group-hover:opacity-50" />
                  </h4>
                )}

                <div className="dropdown dropdown-end">
                  <button tabIndex={0} className="btn btn-ghost btn-xs btn-circle opacity-0 group-hover:opacity-100 transition-opacity">
                    <EllipsisHorizontalIcon className="w-4 h-4" />
                  </button>
                  <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-32 text-xs">
                    <li><button onClick={() => handleDeleteStage(stage.id)} className="text-error">Delete Stage</button></li>
                  </ul>
                </div>
              </div>

              {/* Tasks List */}
              <div className="space-y-2">
                {stageTasks.map(task => (
                  <div key={task.id} className="flex items-start gap-3 p-3 bg-base-100 border border-base-200 rounded-xl hover:border-primary/30 hover:shadow-sm transition-all group/task">
                    <button 
                      onClick={() => toggleTaskStatus(task)} 
                      className={`mt-0.5 transition-colors ${task.status === 'DONE' ? 'text-success' : 'text-base-content/20 hover:text-primary'}`}
                    >
                      {task.status === 'DONE' ? <SolidCheck className="w-5 h-5" /> : <div className="w-5 h-5 rounded-full border-2 border-current"></div>}
                    </button>
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm ${task.status === 'DONE' ? 'line-through opacity-50' : 'font-medium'}`}>
                        {task.title}
                      </span>
                    </div>
                    <button 
                      onClick={() => deleteTask(task.id)}
                      className="opacity-0 group-hover/task:opacity-100 transition-opacity text-base-content/20 hover:text-error"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {/* Add Task Input */}
                {addingTaskToStage === stage.id ? (
                  <div className="flex gap-2 items-center mt-2 animate-in fade-in">
                    <input 
                      autoFocus
                      className="input input-sm input-bordered flex-1"
                      placeholder="New task name..."
                      value={newTaskInput}
                      onChange={e => setNewTaskInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddTask(stage.id)}
                    />
                    <button onClick={() => handleAddTask(stage.id)} disabled={loading} className="btn btn-sm btn-primary">Add</button>
                    <button onClick={() => setAddingTaskToStage(null)} className="btn btn-sm btn-ghost">Cancel</button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setAddingTaskToStage(stage.id)}
                    className="btn btn-ghost btn-xs text-base-content/40 hover:text-primary mt-2 gap-1 pl-0"
                  >
                    <PlusIcon className="w-3 h-3" /> Add Task
                  </button>
                )}
              </div>

            </div>
          );
        })}

        {/* Unassigned Bucket */}
        {tasks.filter(t => !t.stage).length > 0 && (
          <div className="pl-8 pt-8 opacity-50 hover:opacity-100 transition-opacity">
            <h4 className="text-xs font-bold uppercase mb-2">Unassigned Tasks</h4>
            <div className="space-y-1">
              {tasks.filter(t => !t.stage).map(task => (
                <div key={task.id} className="flex gap-2 items-center text-sm">
                   <div className="w-1.5 h-1.5 bg-base-content/20 rounded-full"></div>
                   {task.title}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}