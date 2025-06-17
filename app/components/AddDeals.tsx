"use client";

import { useState, useEffect, Fragment } from "react";
import { useRouter } from "next/navigation";
import { Listbox, Transition } from "@headlessui/react";
import {
  CheckCircleIcon,
  ChevronUpDownIcon,
} from "@heroicons/react/24/outline";
import InputTags from "./InputTags";
import AddLeads from "./AddLeads";
import ContactMultiSelect from "./ContactMultiSelect";

interface Contact {
  id: string;
  name: string;
  email: string;
}

const AddDeals = () => {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("OPEN");
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [contactOptions, setContactOptions] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [showAddContactModal, setShowAddContactModal] = useState(false);

  const router = useRouter();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/deals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          amount: parseFloat(amount),
          status,
          tags,
          contactIds: selectedContacts.map((c) => c.id),
        }),
      });

      if (!response.ok) throw new Error("Failed to add deal");

      setSuccess(true);
      setTitle("");
      setAmount("");
      setStatus("OPEN");
      setTags([]);
      setSelectedContacts([]);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  // Helper: toggle contact in selection
  const toggleContact = (contact: Contact) => {
    if (selectedContacts.some((c) => c.id === contact.id)) {
      setSelectedContacts(selectedContacts.filter((c) => c.id !== contact.id));
    } else {
      setSelectedContacts([...selectedContacts, contact]);
    }
  };

  return (
    <>
      <form
        className="max-w-md mx-auto p-6 rounded-lg shadow-md space-y-4"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold text-center mb-4">Add New Deal</h2>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && (
          <p className="text-green-500 text-sm">Deal added successfully!</p>
        )}

        <div className="form-control space-y-4 text-center w-full items-center">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Deal Title"
            required
            className="input"
          />

          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            required
            className="input"
          />

          <select
            className="select select-bordered"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="OPEN">Open</option>
            <option value="WON">Won</option>
            <option value="LOST">Lost</option>
            <option value="NEGOTIATION">Negotiation</option>
            <option value="PENDING">Pending</option>
          </select>

          {/* CONTACT MULTISELECT */}
          <div className="flex flex-col text-center w-full items-center ">
          <ContactMultiSelect
            contacts={contactOptions}
            selected={selectedContacts}
            onChange={(newSelected) =>
              setSelectedContacts(newSelected)
            }
          />

          <button
            type="button"
            className="btn btn-outline btn-sm mt-2"
            onClick={() => setShowAddContactModal(true)}
          >
            + Add New Contact
          </button>
        <InputTags tags={tags} onTagsInput={setTags} />
        <button
          type="submit"
          className={`btn btn-primary ${loading ? "loading" : ""} w-78`}
          disabled={loading}
        >
          {loading ? "Adding Deal..." : "Add Deal"}
        </button>
        </div>
        </div>

        {/* TAGS */}

        {/* SUBMIT BUTTON */}
      </form>

      {/* MODAL TO ADD CONTACT */}
      {showAddContactModal && (
        <dialog open className="modal">
          <div className="modal-box relative">
            <button
              onClick={() => setShowAddContactModal(false)}
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-left"
            >
              ✕
            </button>
            <h3 className="text-lg font-bold mb-2">Add New Contact</h3>
            <AddLeads
              onSuccess={(newContact: Contact) => {
                setContactOptions((prev) => [...prev, newContact]);
                setSelectedContacts((prev) => [...prev, newContact]);
                setShowAddContactModal(false);
              }}
            />
          </div>
        </dialog>
      )}
    </>
  );
};

export default AddDeals;
