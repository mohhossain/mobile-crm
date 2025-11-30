"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  PencilSquareIcon, 
  TrashIcon, 
  CheckIcon, 
  XMarkIcon,
  EnvelopeIcon,
  PhoneIcon,
  CameraIcon,
  TagIcon
} from "@heroicons/react/24/outline";

interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
  imageUrl: string | null;
  tags: { id?: string; name: string }[];
}

export default function ContactProfile({ initialContact }: { initialContact: Contact }) {
  const [contact, setContact] = useState(initialContact);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialContact);
  const [tagInput, setTagInput] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Controls the custom modal
  const router = useRouter();

  // Handle Form Input Changes
  const handleChange = (field: keyof Contact, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle Tag Adding
  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/^#/, '');
      if (newTag && !formData.tags.some(t => t.name === newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, { name: newTag }]
        }));
        setTagInput("");
      }
    }
  };

  // Handle Tag Removal
  const removeTag = (tagName: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t.name !== tagName)
    }));
  };

  // Handle Image Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append("image", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: uploadData });
      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({ ...prev, imageUrl: data.url }));
      }
    } catch (error) {
      console.error("Image upload failed", error);
    }
  };

  // Save Changes (PUT)
  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leads/${contact.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.map(t => t.name) // API expects array of strings
        }),
      });

      if (!res.ok) throw new Error("Failed to update");

      const updated = await res.json();
      setContact(updated.contact); 
      setFormData(updated.contact);
      setIsEditing(false);
      router.refresh(); // Refreshes server data
    } catch (error) {
      console.error(error);
      alert("Failed to save changes. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // Delete Contact (DELETE)
  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leads/${contact.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      
      router.push("/contacts"); // Redirect to list
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Error deleting contact.");
      setShowDeleteModal(false);
    } finally {
      setLoading(false);
    }
  };

  const statusColors: Record<string, string> = {
    NEW: 'badge-primary',
    CONTACTED: 'badge-info',
    QUALIFIED: 'badge-success',
    LOST: 'badge-ghost',
    CONVERTED: 'badge-accent',
    HOT: 'badge-error',
    COLD: 'badge-neutral'
  };

  return (
    <>
      <div className="card bg-base-100 shadow-sm border border-base-200 overflow-visible">
        {/* Banner */}
        <div className="h-24 bg-gradient-to-r from-base-200 to-base-300 rounded-t-xl"></div>
        
        <div className="card-body pt-0 relative">
          {/* Avatar Section */}
          <div className="absolute -top-12 left-6">
            <div className="relative group">
              <div className={`avatar ${isEditing ? 'cursor-pointer' : ''}`}>
                <div className="w-24 h-24 rounded-full ring ring-base-100 ring-offset-base-100 ring-offset-2 shadow-lg bg-neutral text-neutral-content flex items-center justify-center text-3xl font-bold overflow-hidden">
                   {formData.imageUrl ? (
                     <img src={formData.imageUrl} alt={formData.name} className="object-cover" />
                   ) : (
                     formData.name.charAt(0).toUpperCase()
                   )}
                </div>
              </div>
              {isEditing && (
                <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full cursor-pointer text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <CameraIcon className="w-8 h-8" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              )}
            </div>
          </div>

          {/* Top Right Action Buttons */}
          <div className="flex justify-end gap-2 mt-4">
            {isEditing ? (
              <>
                <button onClick={() => { setIsEditing(false); setFormData(contact); }} className="btn btn-sm btn-ghost" disabled={loading}>
                  Cancel
                </button>
                <button onClick={handleSave} className="btn btn-sm btn-primary" disabled={loading}>
                  {loading ? <span className="loading loading-spinner loading-xs"></span> : <><CheckIcon className="w-4 h-4" /> Save</>}
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setShowDeleteModal(true)} className="btn btn-sm btn-ghost text-error hover:bg-error/10">
                  <TrashIcon className="w-4 h-4" />
                </button>
                <button onClick={() => setIsEditing(true)} className="btn btn-sm btn-outline">
                  <PencilSquareIcon className="w-4 h-4" /> Edit Profile
                </button>
              </>
            )}
          </div>

          {/* Main Info Section */}
          <div className="mt-6 space-y-4">
            
            {/* Name & Status */}
            <div className="flex flex-col md:flex-row md:items-center gap-3">
               {isEditing ? (
                 <input 
                   className="input input-bordered input-lg font-bold w-full max-w-md" 
                   value={formData.name}
                   onChange={(e) => handleChange('name', e.target.value)}
                   placeholder="Contact Name"
                 />
               ) : (
                 <h1 className="text-3xl font-bold">{contact.name}</h1>
               )}

               {isEditing ? (
                 <select 
                   className="select select-bordered" 
                   value={formData.status}
                   onChange={(e) => handleChange('status', e.target.value)}
                 >
                   {["NEW", "CONTACTED", "QUALIFIED", "LOST", "CONVERTED", "HOT", "COLD"].map(s => (
                     <option key={s} value={s}>{s}</option>
                   ))}
                 </select>
               ) : (
                 <span className={`badge badge-lg ${statusColors[contact.status] || 'badge-ghost'}`}>{contact.status}</span>
               )}
            </div>

            <div className="divider my-0"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Contact Info Inputs */}
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label py-0"><span className="label-text flex items-center gap-2"><EnvelopeIcon className="w-4 h-4" /> Email</span></label>
                  {isEditing ? (
                    <input type="email" className="input input-bordered input-sm mt-1" value={formData.email || ""} onChange={(e) => handleChange('email', e.target.value)} />
                  ) : (
                    <div className="font-medium pl-1">{contact.email || <span className="text-gray-400 italic">No email</span>}</div>
                  )}
                </div>

                <div className="form-control">
                  <label className="label py-0"><span className="label-text flex items-center gap-2"><PhoneIcon className="w-4 h-4" /> Phone</span></label>
                  {isEditing ? (
                    <input type="tel" className="input input-bordered input-sm mt-1" value={formData.phone || ""} onChange={(e) => handleChange('phone', e.target.value)} />
                  ) : (
                    <div className="font-medium pl-1">{contact.phone || <span className="text-gray-400 italic">No phone</span>}</div>
                  )}
                </div>
              </div>

              {/* Tag Management */}
              <div className="space-y-2">
                <label className="label py-0"><span className="label-text flex items-center gap-2"><TagIcon className="w-4 h-4" /> Tags</span></label>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <span key={tag.name} className="badge badge-lg badge-secondary badge-outline gap-1 pl-3">
                      {tag.name}
                      {isEditing && (
                        <button onClick={() => removeTag(tag.name)} className="btn btn-ghost btn-xs btn-circle h-5 w-5 min-h-0">
                          <XMarkIcon className="w-3 h-3" />
                        </button>
                      )}
                    </span>
                  ))}
                  {formData.tags.length === 0 && !isEditing && <span className="text-gray-400 text-sm italic">No tags</span>}
                </div>
                {isEditing && (
                  <input className="input input-bordered input-sm w-full mt-2" placeholder="Type tag & press Enter..." value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={addTag} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Delete Modal (No browser alerts) */}
      {showDeleteModal && (
        <dialog open className="modal modal-bottom sm:modal-middle bg-black/50">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-error">Delete Contact?</h3>
            <p className="py-4">Are you sure you want to permanently delete <strong>{contact.name}</strong>? This will also remove them from any associated deals.</p>
            <div className="modal-action">
              <button className="btn" onClick={() => setShowDeleteModal(false)} disabled={loading}>Cancel</button>
              <button className="btn btn-error" onClick={handleDelete} disabled={loading}>
                {loading ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
             <button onClick={() => setShowDeleteModal(false)}>close</button>
          </form>
        </dialog>
      )}
    </>
  );
}