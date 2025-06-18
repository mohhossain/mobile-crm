'use client'

import React, { useState } from 'react'

interface AddNotesProps {
  notes: string[]
  onNotesInput: (notes: string[]) => void
}

const detectLinks = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = text.split(urlRegex)

  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline break-all"
        >
          {part}
        </a>
      )
    } else {
      return <span key={index}>{part}</span>
    }
  })
}

const AddNotes = ({ notes, onNotesInput }: AddNotesProps) => {
  const [noteInput, setNoteInput] = useState('')

  const handleAddNote = () => {
    const trimmed = noteInput.trim()
    if (trimmed && !notes.includes(trimmed)) {
      onNotesInput([...notes, trimmed])
      setNoteInput('')
    }
  }

  return (
    <div className="fieldset w-78">
      <label className="label">Add Notes</label>

      <div className="flex flex-col gap-2 mb-2">
        {notes.map((note, index) => (
          <div
            key={index}
            className="relative card rounded-md bg-secondary shadow-sm p-4 text-left whitespace-pre-wrap break-words"
          >
            <button
              type="button"
              className="absolute top-2 right-2 btn btn-xs btn-circle btn-ghost text-warning"
              onClick={() =>
                onNotesInput(notes.filter((_, i) => i !== index))
              }
            >
              ✕
            </button>
            {detectLinks(note)}
          </div>
        ))}
      </div>

      <textarea
        className="textarea textarea-bordered w-full"
        placeholder="Type your notes here..."
        value={noteInput}
        onChange={(e) => setNoteInput(e.target.value)}
        rows={6}
        wrap="soft"
      />
      <button
        type="button"
        className="btn btn-outline btn-sm mt-2"
        onClick={handleAddNote}
      >
        + Add New Note
      </button>

      <div className="label text-xs text-gray-500 mt-1">
        Multiple lines allowed. Links will be clickable.
      </div>
    </div>
  )
}

export default AddNotes
