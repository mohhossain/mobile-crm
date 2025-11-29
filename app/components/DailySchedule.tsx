'use client'
import { useState } from 'react'
import { format, isSameDay, parseISO } from 'date-fns'
import AddTaskModal from './AddTaskModal'

type Task = {
  id: string;
  title: string;
  startDate: string;
  dueDate: string;
};

export default function DailySchedule({ tasks }: { tasks: Task[] }) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showModal, setShowModal] = useState(false)

  const filteredTasks = tasks
    .filter(task => isSameDay(parseISO(task.startDate), selectedDate))
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())

  const hours = Array.from({ length: 12 }, (_, i) => i + 8)

  return (
    <div className="relative p-4">
      {/* Date Picker */}
      <div className="flex overflow-x-auto gap-2 pb-4">
        {Array.from({ length: 7 }, (_, i) => {
          const date = new Date()
          date.setDate(date.getDate() + i)
          return (
            <button
              key={i}
              onClick={() => setSelectedDate(date)}
              className={`btn btn-sm ${isSameDay(date, selectedDate) ? 'btn-primary' : 'btn-ghost'}`}
            >
              {format(date, 'E d')}
            </button>
          )
        })}
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {hours.map(hour => {
          const hourTasks = filteredTasks.filter(task => {
            const start = new Date(task.startDate)
            return start.getHours() === hour
          })

          return (
            <div key={hour}>
              <p className="text-sm text-gray-500">{`${hour}:00`}</p>
              {hourTasks.length === 0 ? (
                <div className="text-xs text-gray-400 pl-4">No tasks</div>
              ) : (
                hourTasks.map(task => (
                  <div key={task.id} className="bg-base-200 p-3 rounded shadow-sm space-y-1">
                    <p className="font-semibold">{task.title}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(task.startDate), 'hh:mm a')} – {format(new Date(task.dueDate), 'hh:mm a')}
                    </p>
                  </div>
                ))
              )}
            </div>
          )
        })} 
      </div>

      {/* FAB Button */}
      <button
        className="btn btn-primary btn-circle fixed bottom-20 right-8 shadow-lg"
        onClick={() => setShowModal(true)}
      >
        +
      </button>

      {/* Modal */}
      {showModal && <AddTaskModal selectedDate={selectedDate} onClose={() => setShowModal(false)} />}
    </div>
  )
}
