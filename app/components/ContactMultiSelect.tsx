"use client";

import { useState, useRef, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/20/solid";

interface Contact {
  id: string;
  name: string;
  email: string;
  imageUrl?: string;
}

export default function ContactMultiSelect({
  contacts,
  selected,
  onChange,
}: {
  contacts: Contact[];
  selected: Contact[];
  onChange: (newSelected: Contact[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = contacts.filter(
    (c) =>
      (c.name + c.email).toLowerCase().includes(query.toLowerCase()) &&
      !selected.some((s) => s.id === c.id)
  );

  const handleAdd = (contact: Contact) => {
    onChange([...selected, contact]);
    setQuery("");
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const handleRemove = (id: string) => {
    onChange(selected.filter((c) => c.id !== id));
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.parentElement?.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="w-78">
      <label className="block mb-1 font-semibold text-sm">Assign Contacts</label>

      {/* Selected chips */}
      <div className="flex flex-wrap gap-2 mb-2 ">
        {selected.map((contact) => (
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
              onClick={() => handleRemove(contact.id)}
              className="ml-1 hover:text-red-500"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </span>
        ))}
      </div>

      {/* Search input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          placeholder="Search contacts..."
          className=" input"
        />

        {/* Dropdown */}
        {showDropdown && filtered.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full bg-base-100 border border-warning rounded-md shadow-md max-h-60 overflow-auto">
            {filtered.map((contact) => (
              <li
                key={contact.id}
                onClick={() => handleAdd(contact)}
                className="flex items-center gap-3 px-4 py-2 hover:bg-blue-100 cursor-pointer"
              >
                {contact.imageUrl && (
                  <img
                    src={contact.imageUrl}
                    alt={contact.name}
                    className="w-6 h-6 rounded-full"
                  />
                )}
                <div>
                  <p className="font-medium text-sm text-base-content">{contact.name}</p>
                  <p className="text-xs text-base-content">{contact.email}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
