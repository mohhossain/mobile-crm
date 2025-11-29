'use client'
import AddTaskForm from './AddTasks'
type Props = {
  onClose: () => void;
  selectedDate: Date;
};

export default function AddTaskModal({ onClose, selectedDate }: Props) {
  return (
    <dialog open className="modal">
      <div className="modal-box max-w-lg">
        <button
          onClick={onClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        >
          ✕
        </button>
        <h3 className="font-bold text-lg mb-4">Add Task</h3>
        <AddTaskForm />
      </div>
    </dialog>
  )
}
