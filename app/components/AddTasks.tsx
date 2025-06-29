'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ContactMultiSelect from './ContactMultiSelect'

export interface Contact {
  id: string
  name: string
  email: string
}
export interface ContactOption {
  id: string
  name: string
  email: string
  imageUrl?: string
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

  

  // Fetch contacts on mount
   useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await fetch("/api/leads");
        const data = await res.json();
        const contacts = Array.isArray(data) ? data : data.contacts;
        setContactOptions(contacts);
      } catch (err) {
        console.error("Failed to fetch contacts", err);
      }
    };

    fetchContacts();
  }, []);


  // Debounced deals search
  useEffect(() => {
    if (!dealQuery) return setDealResults([])
    const handle = setTimeout(async () => {
      const res = await fetch(`/api/deals/search?query=${encodeURIComponent(dealQuery)}`)
      const data = await res.json()
      setDealResults(data)
      // populate selected contacts if a deal is selected
      
    }, 300)
    return () => clearTimeout(handle)
  }, [dealQuery])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          priority,
          startDate: startDate ? `${startDate}T${startTime}` : null,
          dueDate: dueDate ? `${dueDate}T${dueTime}` : null,
          dealId: selectedDeal?.id || null,
          contactIds: selectedContacts.map(c => c.id) || [],
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to add task')
      }

      setTitle('')
      setDescription('')
      setPriority('1')
      setStartDate('')
      setStartTime('')
      setDueDate('')
      setDueTime('')
      setSelectedDeal(null)
      setSelectedContacts([])

      router.refresh()
    } catch (error) {
      console.error('Error adding task:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form-control space-y-4 w-full max-w-xs mx-auto">
      {/* Basic Inputs */}
      <input type="text" placeholder="Task Title" className="input input-bordered w-full" value={title} onChange={e => setTitle(e.target.value)} required />

      <textarea placeholder="Task Description" className="textarea textarea-bordered w-full" value={description} onChange={e => setDescription(e.target.value)} rows={3} />

      {/* Start and Due Date */}
      <label className="label">Start Date & Time</label>
      <div className="flex gap-2">
        <input type="date" className="input input-bordered w-1/2" value={startDate} onChange={e => setStartDate(e.target.value)} />
        <input type="time" className="input input-bordered w-1/2" value={startTime} onChange={e => setStartTime(e.target.value)} />
      </div>

      <label className="label">Due Date & Time</label>
      <div className="flex gap-2">
        <input type="date" className="input input-bordered w-1/2" value={dueDate} onChange={e => setDueDate(e.target.value)} />
        <input type="time" className="input input-bordered w-1/2" value={dueTime} onChange={e => setDueTime(e.target.value)} />
      </div>

      {/* Priority */}
      <label className="label">Priority</label>
      <select className="select select-bordered w-full" value={priority} onChange={e => setPriority(e.target.value)}>
        <option value="1">Low</option>
        <option value="2">Medium</option>
        <option value="3">High</option>
      </select>

      {/* Deal Search */}
      <div className="relative">
        <label className="label">Assign to Deal</label>
        <input
          type="text"
          placeholder="Search Deals..."
          className="input input-bordered w-full"
          value={dealQuery}
          onChange={e => {
            setDealQuery(e.target.value)
            setSelectedDeal(null)
          }}
        />
        {dealResults.length > 0 && (
          <ul className="border bg-base-100 absolute w-full z-10 max-h-48 overflow-y-auto">
            {dealResults.map(d => (
              <li
                key={d.id}
                className="hover:bg-base-200 p-2 cursor-pointer"
                onClick={() => {
                  setSelectedDeal(d)
                  setDealQuery(d.title)
                  setDealResults([])

                  // Optionally, you can also set selected contacts based on the deal
                  setSelectedContacts(d.contacts || [])
                }}
              >
                {d.title}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Contact Search */}
      <ContactMultiSelect
        contacts={contactOptions}
        selected={selectedContacts}
        onChange={(newSelected) => setSelectedContacts(newSelected)}
      />
      

      {/* Submit */}
      <button type="submit" className={`btn btn-primary w-full ${loading ? 'loading' : ''}`} disabled={loading}>
        {loading ? 'Adding...' : 'Add Task'}
      </button>
    </form>
  )
}
