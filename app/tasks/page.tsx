import React from 'react';
import { getCurrentUser } from '@/lib/currentUser';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

import AddTasks from '../components/AddTasks';
import TaskCard from '../components/TaskCard';
import TaskFilters from '../components/TaskFilters';

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return <div className="p-4 text-center">Please sign in.</div>;

  const { filter = 'all' } = await searchParams;

  // --- Filter Logic ---
  const whereClause: Prisma.TaskWhereInput = {
    userId: user.id,
  };

  const today = new Date();
  today.setHours(0,0,0,0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (filter === 'active') {
    whereClause.status = { not: 'DONE' };
  } else if (filter === 'completed') {
    whereClause.status = 'DONE';
  } else if (filter === 'today') {
    whereClause.status = { not: 'DONE' };
    whereClause.dueDate = { gte: today, lt: tomorrow };
  } else if (filter === 'overdue') {
    whereClause.status = { not: 'DONE' };
    whereClause.dueDate = { lt: today };
  }

  // Fetch Tasks
  const tasks = await prisma.task.findMany({
    where: whereClause,
    orderBy: [
      { status: 'asc' },    // Active first
      { priority: 'desc' }, // High priority first
      { dueDate: 'asc' },   // Soonest due first
    ],
    include: {
      deal: { select: { id: true, title: true } },
    },
  });

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto min-h-screen pb-32">
       
       {/* Header */}
       <div className="mb-8">
         <h1 className="text-3xl font-black tracking-tight mb-1">Task Hub</h1>
         <p className="text-base-content/60 text-sm">
           Keep moving forward, one step at a time.
         </p>
       </div>

       {/* Components */}
       <div className="space-y-6">
         <AddTasks />
         
         <TaskFilters />

         <div className="space-y-3">
           {tasks.length === 0 ? (
             <div className="text-center py-20 bg-base-100 rounded-2xl border border-dashed border-base-300 opacity-60">
               <p>No tasks found for this filter.</p>
             </div>
           ) : (
             tasks.map((task: any) => (
               <TaskCard key={task.id} task={task} />
             ))
           )}
         </div>
       </div>
    </div>
  );
}