import React from 'react'
import { getCurrentUser } from '@/lib/currentUser'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import AddTasks from '../components/AddTasks'




const tasks = async () => {
  const user = await getCurrentUser()
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold">Unauthorized</h1>
        <p className="text-gray-500">Please log in to access your tasks.</p>
        <Link href="/login" className="mt-4 text-blue-500 hover:underline">
          Go to Login
        </Link>
      </div>
    )
  }
  // Fetch tasks from the database
  // This can be done using a server-side function or client-side fetch

  const tasks = await prisma.task.findMany({
    where: { userId: user.id },
    orderBy: { dueDate: 'asc' },
    include: {
      deal: true,
      contacts: true,
    },
  })
  
  return (
    <div>
        <h1 className="text-2xl font-bold text-center mt-4">Tasks</h1>
        <p className="text-center text-gray-500 mt-2">Manage your tasks here.</p>
        {/* Add your task management components here */}
        <div className="max-w-md mx-auto p-4">
            {/* Placeholder for task list or form */}
            <ul className="space-y-4">
                {tasks.map(task => (
                    <li key={task.id} className="p-4 border rounded-lg shadow-sm">
                        <h2 className="text-lg font-semibold">{task.title}</h2>
                        <p className="text-gray-600">{task.description}</p>
                        <p className="text-sm text-gray-500">
                          Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString()  : 'No due date'}
                          By {task.dueDate ? new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </p>
                        {task.deal && <p className="text-sm text-blue-500">Deal: {task.deal.title}</p>}
                        {task.contacts.length > 0 && (
                            <div className="mt-2">
                                <span className="font-medium">Contacts:</span>
                                <ul className="list-disc pl-5">
                                    {task.contacts.map(contact => (
                                        <li key={contact.id}>{contact.name}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>

            <AddTasks />

    </div>
  )
}

export default tasks