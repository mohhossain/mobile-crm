import React from 'react';
import { getCurrentUser } from '@/lib/currentUser';
import { prisma } from '@/lib/prisma';
import AddTasks from '../components/AddTasks';
import TaskCard from '../components/TaskCard';

export default async function TasksPage() {
  const user = await getCurrentUser();
  if (!user) return <div className="p-4 text-center">Please sign in.</div>;

  const tasks = await prisma.task.findMany({
    where: { userId: user.id },
    orderBy: [
      { status: 'asc' }, // TO_DO before DONE
      { priority: 'desc' }, // High priority first
      { dueDate: 'asc' }, // Soonest due first
    ],
    include: {
      deal: { select: { title: true } },
    },
  });
  
  return (
    <div className="p-4 pb-24 max-w-2xl mx-auto space-y-6">
       <div className="flex justify-between items-center">
         <h1 className="text-2xl font-bold">My Tasks</h1>
         <span className="badge badge-neutral">{tasks.filter(t => t.status !== 'DONE').length} Pending</span>
       </div>

       {/* Add Task Form Collapsible */}
       <div className="collapse collapse-arrow bg-base-200">
          <input type="checkbox" /> 
          <div className="collapse-title font-medium">
            + Add New Task
          </div>
          <div className="collapse-content"> 
            <AddTasks />
          </div>
       </div>

       {/* Task List */}
       <div className="space-y-3">
         {tasks.length === 0 && <p className="text-center text-gray-500 py-8">No tasks yet. Create one above!</p>}
         {tasks.map(task => (
           <TaskCard key={task.id} task={task} />
         ))}
       </div>
    </div>
  );
}