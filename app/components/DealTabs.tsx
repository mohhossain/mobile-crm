'use client'

import { useState } from 'react'
import type { Deal, Tag, Contact, Task, Note } from '@prisma/client'
import Link from 'next/link'
import InputTags from './InputTags'
import { useRouter } from 'next/navigation'

interface DealWithRelations extends Deal {
  tags: Tag[]
  contacts: Contact[]
  tasks: Task[]
  notes: Note[]
}

export default function DealTabs({ deal }: { deal: DealWithRelations }) {
  const [activeTab, setActiveTab] = useState<'details' | 'tasks' | 'notes'>('details')
  const [tags, setTags] = useState<string[]>(deal.tags.map(tag => tag.name))
  const [notes, setNotes] = useState<Note[]>(deal.notes)
  const [newNote, setNewNote] = useState('')
  const [addTagModal, setAddTagModal] = useState(false)
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null)
  const [loadingNote, setLoadingNote] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()

  // Add Note
  const handleAddNote = async () => {
    if (!newNote.trim()) return
    setLoadingNote(true)
    setError(null)

    try {
      const res = await fetch(`/api/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNote, dealId: deal.id }),
      })
      if (!res.ok) throw new Error('Failed to add note')

      const added = await res.json()
      setNotes([...notes, added])
      setNewNote('')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoadingNote(false)
    }
  }

  // Delete Note
  const confirmDeleteNote = async () => {
    if (!deletingNoteId) return

    try {
      const res = await fetch(`/api/notes/`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deletingNoteId }),
      })
      if (!res.ok) throw new Error('Failed to delete note')

      setNotes(prev => prev.filter(n => n.id !== deletingNoteId))
      setDeletingNoteId(null)
    } catch (err) {
      console.error(err)
    }
  }

  // Tag Submit
  const handleTagSubmit = async () => {
    if (tags.length === 0) return
    try {
      const res = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags, dealId: deal.id }),
      })
      if (!res.ok) throw new Error('Failed to update tags')

      const updated = await res.json()
      setTags(updated.map((t: Tag) => t.name))
      setAddTagModal(false)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-4">
      {/* Tabs */}
      <div role="tablist" className="tabs tabs-bordered w-full text-sm">
        {['details', 'tasks', 'notes'].map(tab => (
          <button
            key={tab}
            role="tab"
            className={`tab ${activeTab === tab ? 'tab-active' : ''}`}
            onClick={() => setActiveTab(tab as typeof activeTab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="card bg-base-100 p-4 space-y-4">
        {activeTab === 'details' && (
          <>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Tags</h3>
              <button className="btn btn-sm btn-outline" onClick={() => setAddTagModal(true)}>
                + Add Tag
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {tags.length === 0 ? (
                <span className="text-sm text-gray-500">No tags added.</span>
              ) : (
                tags.map(name => (
                  <span key={name} className="badge badge-outline bg-primary text-primary-content">
                    {name}
                  </span>
                ))
              )}
            </div>

            <div>
              <p className="font-semibold mt-4 mb-1">Contacts:</p>
              {deal.contacts.map(contact => (
                <Link
                  key={contact.id}
                  href={`/contacts/${contact.id}`}
                  className="flex justify-between items-center text-sm bg-base-200 p-2 rounded mb-2"
                >
                  <div className="flex items-center gap-2">
                    {contact.imageUrl ? (
                      <img src={contact.imageUrl} alt={contact.name} className="w-8 h-8 rounded-full" />
                    ) : (
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        {contact.name.charAt(0)}
                      </div>
                    )}
                    <span>{contact.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">{contact.email}</span>
                </Link>
              ))}
            </div>
          </>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-2">
            {deal.tasks.length === 0 ? (
              <p className="text-sm text-gray-500">No tasks added.</p>
            ) : (
              deal.tasks.map(task => (
                <div key={task.id} className="border-b py-2">
                  <p className="font-semibold">{task.title}</p>
                  <p className="text-sm text-gray-500">{task.status}</p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-4">
            {notes.length === 0 ? (
              <p className="text-sm text-gray-500">No notes added.</p>
            ) : (
              notes.map(note => (
                <div key={note.id} className="relative bg-info p-3 rounded">
                  <button
                    className="btn btn-xs btn-circle absolute top-1 right-1 text-warning bg-base-100"
                    onClick={() => setDeletingNoteId(note.id)}
                  >
                    ✕
                  </button>
                  <p className="text-sm whitespace-pre-line break-words">{note.content}</p>
                  <label className="label text-xs mt-1 text-right">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </label>
                </div>
              ))
            )}

            <div className="form-control">
              <label className="label">Add Note</label>
              <textarea
                className="textarea textarea-bordered min-h-[100px] whitespace-pre-wrap"
                placeholder="Write a note..."
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                onClick={handleAddNote}
                type="button"
                className={`btn btn-sm btn-primary mt-2 ${loadingNote ? 'loading' : ''}`}
                disabled={loadingNote}
              >
                {loadingNote ? 'Adding...' : '+ Add Note'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Tag Modal */}
      {addTagModal && (
        <dialog open className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Add Tags</h3>
            <InputTags tags={tags} onTagsInput={setTags} />
            <div className="modal-action">
              <button className="btn" onClick={() => setAddTagModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleTagSubmit}>
                Save
              </button>
            </div>
          </div>
        </dialog>
      )}

      {/* Delete Note Modal */}
      {deletingNoteId && (
        <dialog open className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Delete this note?</h3>
            <p className="py-2">Are you sure you want to permanently delete this note?</p>
            <div className="modal-action">
              <button className="btn btn-outline" onClick={() => setDeletingNoteId(null)}>
                Cancel
              </button>
              <button className="btn btn-error" onClick={confirmDeleteNote}>
                Delete
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  )
}
