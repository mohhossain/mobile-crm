import React from 'react';
import { getCurrentUser } from '@/lib/currentUser';
import { prisma } from '@/lib/prisma';
import AddTasks from '../components/AddTasks';
import TaskCard from '../components/TaskCard';
import TaskFilters from '../components/TaskFilters';
import { Prisma } from '@prisma/client';

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; sort?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return <div className="p-4 text-center">Please sign in.</div>;

  const { filter = 'all', sort = 'date' } = await searchParams;

  // --- Dynamic Query Building ---
  
  // 1. Filter Logic
  const whereClause: Prisma.TaskWhereInput = {
    userId: user.id,
  };

  if (filter === 'active') {
    whereClause.status = { not: 'DONE' };
  } else if (filter === 'completed') {
    whereClause.status = 'DONE';
  }
  // 'all' includes everything, so no status filter needed

  // 2. Sort Logic
  let orderByClause: Prisma.TaskOrderByWithRelationInput[];

  switch (sort) {
    case 'priority':
      orderByClause = [
        { status: 'asc' }, // Keep active tasks at top
        { priority: 'desc' }, // High priority first
        { dueDate: 'asc' },
      ];
      break;
    case 'newest':
      orderByClause = [
        { createdAt: 'desc' },
      ];
      break;
    case 'date':
    default:
      orderByClause = [
        { status: 'asc' }, // Keep active tasks at top
        { dueDate: 'asc' }, // Soonest due first
        { priority: 'desc' },
      ];
      break;
  }

  const tasks = await prisma.task.findMany({
    where: whereClause,
    orderBy: orderByClause,
    include: {
      deal: { select: { title: true } },
    },
  });

  return (
    <div className="p-4 pb-24 max-w-3xl mx-auto space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-center gap-4">
         <div>
            <h1 className="text-2xl font-bold">My Tasks</h1>
            <p className="text-gray-500 text-sm">
              {tasks.length} {filter === 'all' ? 'total' : filter} tasks found
            </p>
         </div>
         
         {/* Add Task Form Collapsible */}
         <div className="w-full md:w-auto">
           <div className="collapse collapse-arrow bg-base-200 border border-base-300">
              <input type="checkbox" /> 
              <div className="collapse-title font-medium text-sm">
                + Add New Task
              </div>
              <div className="collapse-content bg-base-100"> 
                <div className="pt-4">
                  <AddTasks />
                </div>
              </div>
           </div>
         </div>
       </div>

       {/* Filters & Sorting */}
       <TaskFilters />

       {/* Task List */}
       <div className="space-y-3">
         {tasks.length === 0 && (
           <div className="text-center py-12 bg-base-100 rounded-xl border border-dashed border-base-300">
             <p className="text-gray-400">No tasks match your current filters.</p>
           </div>
         )}
         
         {tasks.map(task => (
           <TaskCard key={task.id} task={task} />
         ))}
       </div>
    </div>
  );
}