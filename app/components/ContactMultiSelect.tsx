"use client";

import { useState, useRef, useEffect } from "react";
import { XMarkIcon, MagnifyingGlassIcon } from "@heroicons/react/20/solid";

// FIXED: Added 'export' to allow importing in other components
export interface Contact {
  id: string;
  name: string;
  email: string | null;
  imageUrl?: string | null;
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
  const dropdownRef = useRef<HTMLUListElement>(null);

  // Safe filtering
  const filtered = (contacts || []).filter(
    (c) =>
      (c.name?.toLowerCase() || "").includes(query.toLowerCase()) ||
      (c.email?.toLowerCase() || "").includes(query.toLowerCase())
  ).filter((c) => !selected.some((s) => s.id === c.id)); // Remove already selected

  const handleAdd = (contact: Contact) => {
    onChange([...selected, contact]);
    setQuery("");
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const handleRemove = (id: string) => {
    onChange(selected.filter((c) => c.id !== id));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="w-full relative">
      <label className="label font-semibold">Assign Contacts</label>

      {/* Selected Chips */}
      <div className="flex flex-wrap gap-2 mb-2">
        {selected.map((contact) => (
          <span
            key={contact.id}
            className="flex items-center bg-base-200 border border-base-300 text-sm px-2 py-1 rounded-full animate-in fade-in zoom-in duration-200"
          >
            {contact.imageUrl ? (
              <img
                src={contact.imageUrl}
                className="w-5 h-5 rounded-full mr-2 object-cover"
                alt={contact.name}
              />
            ) : (
              <div className="w-5 h-5 rounded-full mr-2 bg-neutral text-neutral-content flex items-center justify-center text-[10px] font-bold">
                {contact.name.charAt(0)}
              </div>
            )}
            {contact.name}
            <button
              type="button"
              onClick={() => handleRemove(contact.id)}
              className="ml-2 hover:text-error rounded-full p-0.5 hover:bg-base-100 transition"
            >
              <XMarkIcon className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => setShowDropdown(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          placeholder={selected.length === 0 ? "Search contacts..." : "Add another..."}
          className="input input-bordered w-full pl-9"
        />

        {/* Dropdown Results */}
        {showDropdown && (
          <ul 
            ref={dropdownRef}
            className="absolute z-50 mt-1 w-full bg-base-100 border border-base-200 rounded-md shadow-lg max-h-60 overflow-auto"
          >
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-gray-500 text-center">
                {query ? "No contacts found" : "Type to search..."}
              </li>
            ) : (
              filtered.map((contact) => (
                <li
                  key={contact.id}
                  onClick={() => handleAdd(contact)}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-base-200 cursor-pointer transition-colors"
                >
                  {contact.imageUrl ? (
                    <img
                      src={contact.imageUrl}
                      alt={contact.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-neutral text-neutral-content flex items-center justify-center font-bold">
                      {contact.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-sm">{contact.name}</p>
                    <p className="text-xs text-gray-500">{contact.email}</p>
                  </div>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
}