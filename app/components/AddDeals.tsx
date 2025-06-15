"use client";

import { useState, useEffect, Fragment } from "react";
import { useRouter } from "next/navigation";
import { Listbox, Transition } from "@headlessui/react";
import { CheckCircleIcon, ChevronUpDownIcon } from "@heroicons/react/24/outline"; 
import InputTags from "./InputTags";
import AddLeads from "./AddLeads";

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

          {/* HEADLESS UI MULTISELECT */}
          <div className="w-full text-left">
            <label className="label font-semibold">Assign Contacts</label>
            {contactOptions.length > 0 ? (
              <Listbox
                value={selectedContacts}
                onChange={(newSelected) => {
                  // This gets called with a single contact, so handle toggle manually below
                }}
              >
                {({ open }) => (
                  <>
                    <div className="relative mt-1">
                      <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white border border-gray-300 py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                        <span className="block truncate">
                          {selectedContacts.length === 0
                            ? "Select contacts"
                            : selectedContacts
                                .map((c) => c.name)
                                .join(", ")}
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                          <ChevronUpDownIcon
                            className="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                          />
                        </span>
                      </Listbox.Button>

                      <Transition
                        show={open}
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                      >
                        <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                          {contactOptions.map((contact) => {
                            const selected = selectedContacts.some(
                              (c) => c.id === contact.id
                            );
                            return (
                              <Listbox.Option
                                key={contact.id}
                                className={({ active }) =>
                                  `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                    active
                                      ? "bg-blue-600 text-white"
                                      : "text-gray-900"
                                  }`
                                }
                                value={contact}
                                onClick={(e) => {
                                  e.preventDefault();
                                  toggleContact(contact);
                                }}
                              >
                                {({ selected, active }) => (
                                  <>
                                    <span
                                      className={`block truncate ${
                                        selected ? "font-semibold" : ""
                                      }`}
                                    >
                                      {contact.name} —{" "}
                                      <span className="text-gray-500 text-sm">
                                        {contact.email}
                                      </span>
                                    </span>
                                    {selected && (
                                      <span
                                        className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                          active ? "text-white" : "text-blue-600"
                                        }`}
                                      >
                                        <CheckCircleIcon
                                          className="h-5 w-5"
                                          aria-hidden="true"
                                        />
                                      </span>
                                    )}
                                  </>
                                )}
                              </Listbox.Option>
                            );
                          })}
                        </Listbox.Options>
                      </Transition>
                    </div>
                  </>
                )}
              </Listbox>
            ) : (
              <p className="text-sm italic text-gray-500">
                No contacts available.
              </p>
            )}

            <button
              type="button"
              className="btn btn-outline btn-sm mt-2"
              onClick={() => setShowAddContactModal(true)}
            >
              + Add New Contact
            </button>
          </div>

          {/* TAGS */}
          <InputTags tags={tags} onTagsInput={setTags} />

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            className={`btn btn-primary ${loading ? "loading" : ""} w-full`}
            disabled={loading}
          >
            {loading ? "Adding Deal..." : "Add Deal"}
          </button>
        </div>
      </form>

      {/* MODAL TO ADD CONTACT */}
      {showAddContactModal && (
        <dialog open className="modal">
          <div className="modal-box relative">
            <button
              onClick={() => setShowAddContactModal(false)}
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
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
