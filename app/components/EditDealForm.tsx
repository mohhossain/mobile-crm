"use client";

import React, { useState, useEffect, useMemo } from "react";
import AddLeads from "./AddLeads";
import { useRouter } from "next/navigation";

interface Contact {
  id: string;
  name: string;
  email: string;
  imageUrl?: string;
}

interface DealEditFormProps {
  dealId: string;
  initialTitle: string;
  initialAmount: number;
  initialStatus: string;
  initialCloseDate: string | null; // ISO date string or null
  initialContacts: Contact[]; 

}

const STATUS_OPTIONS = ["OPEN", "WON", "LOST", "NEGOTIATION", "PENDING"];

export default function EditDealForm({
  dealId,
  initialTitle,
  initialAmount,
  initialStatus,
  initialCloseDate,
  initialContacts,
}: DealEditFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [amount, setAmount] = useState(initialAmount.toString());
  const [status, setStatus] = useState(initialStatus);
  const [closeDate, setCloseDate] = useState(initialCloseDate || "");
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddContactModal, setShowAddContactModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const router = useRouter();

  // Fetch all contacts to search from
  useEffect(() => {
    async function fetchContacts() {
      try {
        const res = await fetch("/api/leads");
        const data = await res.json();
        setAllContacts(data);
      } catch {
        // silently fail
      }
    }
    fetchContacts();
  }, []);

  // Filter contacts for search dropdown
  const filteredContacts = useMemo(() => {
    const lower = searchTerm.toLowerCase();
    return allContacts.filter(
      (c) =>
        c.name.toLowerCase().includes(lower) ||
        c.email.toLowerCase().includes(lower)
    );
  }, [allContacts, searchTerm]);

  // Check if a contact is selected
  function isSelected(contactId: string) {
    return contacts?.some((c) => c.id === contactId);
  }

  // Add or remove contact on selection click
  function toggleContact(contact: Contact) {
    if (isSelected(contact.id)) {
      setContacts((prev) => prev.filter((c) => c.id !== contact.id));
    } else {
      setContacts((prev) => [...prev, contact]);
    }
  }

  // Handle add new contact success from modal
  function handleAddContactSuccess(newContact: Contact) {
    setAllContacts((prev) => [...prev, newContact]);
    setContacts((prev) => [...prev, newContact]);
    setShowAddContactModal(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch(`/api/deals/${dealId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          amount: parseFloat(amount),
          status,
          closeDate: closeDate || null,
          contactIds: contacts.map((c) => c.id),
        }),
      });
      if (!res.ok) throw new Error("Failed to update deal");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);

      // Optionally redirect or refresh after success
      router.push(`/deals/${dealId}`);
    }
  }

  return (
    <>
      <form
        className="max-w-md mx-auto space-y-4 p-4 bg-base-200 rounded-lg shadow"
        onSubmit={handleSubmit}
      >
        <h2 className="text-xl font-semibold">Edit Deal</h2>

        {error && <p className="text-red-500">{error}</p>}
        {success && (
          <p className="text-green-600 font-semibold">
            Deal updated successfully!
          </p>
        )}

        <div>
          <label className="label font-semibold">Title</label>
          <input
            className="input input-bordered w-full"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="label font-semibold">Amount</label>
          <input
            className="input input-bordered w-full"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="label font-semibold">Status</label>
          <select
            className="select select-bordered w-full"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label font-semibold">Close Date</label>
          <input
            className="input input-bordered w-full"
            type="date"
            value={closeDate}
            onChange={(e) => setCloseDate(e.target.value)}
          />
        </div>

        {/* Contacts search and selection */}
        <div>
          <label className="label font-semibold">Assign Contacts</label>
          <div className="contact-chips flex flex-wrap gap-2 mb-2">
            {contacts.map((contact) => (
              <span
                key={contact.id}
                className="flex items-center bg-primary text-primary-content text-sm px-2 py-1 rounded-full"
              >
                {contact.imageUrl && (
                  <img
                    src={contact.imageUrl}
                    className="w-5 h-5 rounded-full mr-2"
                    alt={contact.name}
                  />
                )}
                {contact.name}
                <button
                  type="button"
                  onClick={() =>
                    setContacts((prev) =>
                      prev.filter((c) => c.id !== contact.id)
                    )
                  }
                  className="ml-1 hover:text-red-500"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            className="input input-bordered w-full mb-2"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="max-h-40 overflow-y-auto border rounded p-2 bg-base-100">
            {filteredContacts.length === 0 && (
              <p className="text-sm text-gray-500">No contacts found.</p>
            )}
            {filteredContacts.map((contact) => (
              <button
                key={contact.id}
                type="button"
                className={`flex items-center gap-2 w-full p-1 rounded hover:bg-primary hover:text-primary-content ${
                  isSelected(contact.id)
                    ? "bg-primary text-primary-content"
                    : ""
                }`}
                onClick={() => toggleContact(contact)}
              >
                {contact.imageUrl ? (
                  <img
                    src={contact.imageUrl}
                    alt={contact.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs font-semibold">
                    {contact.name.charAt(0)}
                  </div>
                )}
                <div className="text-left flex-grow truncate">
                  <div className="font-semibold truncate">{contact.name}</div>
                  <div className="text-xs truncate">{contact.email}</div>
                </div>
              </button>
            ))}
          </div>

          <button
            type="button"
            className="btn btn-outline btn-sm mt-2"
            onClick={() => setShowAddContactModal(true)}
          >
            + Add New Contact
          </button>
        </div>

        <button
          type="submit"
          className={`btn btn-primary w-full mt-4 ${loading ? "loading" : ""}`}
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Deal"}
        </button>
      </form>

      {/* Modal to add new contact */}
      {showAddContactModal && (
        <dialog open className="modal">
          <div className="modal-box relative">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => setShowAddContactModal(false)}
            >
              ✕
            </button>
            <h3 className="text-lg font-bold mb-2">Add New Contact</h3>
            <AddLeads
              onSuccess={handleAddContactSuccess}
              onCancel={() => setShowAddContactModal(false)}
            />
          </div>
        </dialog>
      )}
    </>
  );
}
