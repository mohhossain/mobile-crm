'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ContactMultiSelect from './ContactMultiSelect'

export interface Contact {
  id: string
  name: string
  email: string | null
  imageUrl?: string | null
}

interface Deal {
  id: string
  title: string
  contacts?: Contact[]
}

export default function AddTaskForm() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('1')
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [dueTime, setDueTime] = useState('')

  const [contactOptions, setContactOptions] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [dealQuery, setDealQuery] = useState('')
  const [dealResults, setDealResults] = useState<Deal[]>([])
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)

  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await fetch("/api/leads");
        const data = await res.json();
        const contacts = Array.isArray(data) ? data : data.contacts;
        setContactOptions(contacts || []);
      } catch (err) {
        console.error("Failed to fetch contacts", err);
      }
    };
    fetchContacts();
  }, []);

  useEffect(() => {
    if (!dealQuery) return setDealResults([])
    const handle = setTimeout(async () => {
      try {
        const res = await fetch(`/api/deals/search?query=${encodeURIComponent(dealQuery)}`)
        const data = await res.json()
        setDealResults(Array.isArray(data) ? data : [])
      } catch (e) {
        console.error(e)
      }
    }, 300)
    return () => clearTimeout(handle)
  }, [dealQuery])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const startISO = startDate ? (startTime ? `${startDate}T${startTime}` : `${startDate}T09:00`) : null;
      const dueISO = dueDate ? (dueTime ? `${dueDate}T${dueTime}` : `${dueDate}T17:00`) : null;

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          priority,
          startDate: startISO,
          dueDate: dueISO,
          dealId: selectedDeal?.id || null,
          contactIds: selectedContacts.map(c => c.id) || [],
        }),
      })

      if (!response.ok) throw new Error('Failed to add task')

      setTitle('')
      setDescription('')
      setPriority('1')
      setStartDate('')
      setStartTime('')
      setDueDate('')
      setDueTime('')
      setSelectedDeal(null)
      setSelectedContacts([])
      setDealQuery('')

      router.refresh()
    } catch (error) {
      console.error('Error adding task:', error)
      alert("Failed to add task. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // FIX: Added 'pb-32' to ensure submit button is visible above the dock on mobile
  return (
    <form onSubmit={handleSubmit} className="form-control space-y-4 w-full bg-base-100 p-6 pb-32 rounded-xl border border-base-200 shadow-sm">
      <h2 className="text-xl font-bold text-center mb-2">Create Task</h2>
      
      <div className="space-y-2">
        <label className="label font-semibold py-0">Title</label>
        <input 
          type="text" 
          placeholder="e.g. Call Client about Contract" 
          className="input input-bordered w-full" 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          required 
        />
      </div>

      <div className="space-y-2">
        <label className="label font-semibold py-0">Description</label>
        <textarea 
          placeholder="Add details..." 
          className="textarea textarea-bordered w-full" 
          value={description} 
          onChange={e => setDescription(e.target.value)} 
          rows={3} 
        />
      </div>

      <div className="space-y-2">
        <label className="label font-semibold py-0">Priority</label>
        <select className="select select-bordered w-full" value={priority} onChange={e => setPriority(e.target.value)}>
          <option value="1">Low</option>
          <option value="2">Medium</option>
          <option value="3">High</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label font-semibold py-0">Start Date</label>
          <div className="flex gap-2 mt-1">
            <input type="date" className="input input-bordered flex-1 min-w-0" value={startDate} onChange={e => setStartDate(e.target.value)} />
            <input type="time" className="input input-bordered w-28" value={startTime} onChange={e => setStartTime(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="label font-semibold py-0">Due Date</label>
          <div className="flex gap-2 mt-1">
            <input type="date" className="input input-bordered flex-1 min-w-0" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            <input type="time" className="input input-bordered w-28" value={dueTime} onChange={e => setDueTime(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="relative space-y-2">
        <label className="label font-semibold py-0">Link to Deal (Optional)</label>
        <input
          type="text"
          placeholder="Search Deals..."
          className="input input-bordered w-full"
          value={dealQuery}
          onChange={e => {
            setDealQuery(e.target.value)
            if (e.target.value === '') setSelectedDeal(null)
          }}
        />
        {dealResults.length > 0 && dealQuery && !selectedDeal && (
          <ul className="absolute z-20 w-full bg-base-100 border border-base-200 shadow-lg rounded-lg max-h-48 overflow-y-auto mt-1">
            {dealResults.map(d => (
              <li
                key={d.id}
                className="hover:bg-primary/10 p-2 cursor-pointer text-sm"
                onClick={() => {
                  setSelectedDeal(d)
                  setDealQuery(d.title)
                  setDealResults([])
                  if (d.contacts && selectedContacts.length === 0) {
                    setSelectedContacts(d.contacts)
                  }
                }}
              >
                {d.title}
              </li>
            ))}
          </ul>
        )}
      </div>

      <ContactMultiSelect
        contacts={contactOptions}
        selected={selectedContacts}
        onChange={(newSelected) => setSelectedContacts(newSelected)}
      />
      
      <button type="submit" className={`btn btn-primary w-full mt-4 ${loading ? 'loading' : ''}`} disabled={loading}>
        {loading ? 'Adding...' : 'Create Task'}
      </button>
    </form>
  )
}