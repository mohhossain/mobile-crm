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
  TagIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  ClockIcon,
  PhotoIcon
} from "@heroicons/react/24/outline";

interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  jobTitle: string | null;
  company: string | null;
  location: string | null;
  imageUrl: string | null;
  lastContactedAt: Date | string | null;
  tags: { id?: string; name: string }[];
}

export default function ContactProfile({ initialContact }: { initialContact: Contact }) {
  const [contact, setContact] = useState(initialContact);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialContact);
  const [tagInput, setTagInput] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  // Image upload states
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const router = useRouter();

  // ... handleChange, addTag, removeTag ... (Keep these same)
  const handleChange = (field: keyof Contact, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/^#/, '');
      if (newTag && !formData.tags.some(t => t.name === newTag)) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, { name: newTag }] }));
        setTagInput("");
      }
    }
  };

  const removeTag = (tagName: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t.name !== tagName) }));
  };

  // Helper to resize and compress image before upload
  const resizeImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        
        // Max dimensions: 800x800 is plenty for a profile avatar
        const MAX_WIDTH = 800; 
        const MAX_HEIGHT = 800;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        
        if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            
            // Compress to JPEG at 80% quality
            canvas.toBlob((blob) => {
                if (blob) {
                    const resizedFile = new File([blob], file.name, {
                        type: "image/jpeg",
                        lastModified: Date.now(),
                    });
                    resolve(resizedFile);
                } else {
                    reject(new Error("Failed to compress image"));
                }
            }, "image/jpeg", 0.8); 
        } else {
            reject(new Error("Could not get canvas context"));
        }
      };
      img.onerror = (error) => reject(error);
    });
  };

  // Improved Image Handler with Resizing
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);

    try {
      // 1. Resize image client-side to save bandwidth/storage
      const resizedFile = await resizeImage(file);

      const uploadData = new FormData();
      uploadData.append("image", resizedFile);

      const res = await fetch("/api/upload", { method: "POST", body: uploadData });
      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({ ...prev, imageUrl: data.url }));
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Image upload failed", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leads/${contact.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.map(t => t.name)
        }),
      });

      if (!res.ok) throw new Error("Failed to update");

      const updated = await res.json();
      setContact(updated.contact);
      setFormData(updated.contact);
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to save changes.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await fetch(`/api/leads/${contact.id}`, { method: "DELETE" });
      router.push("/contacts");
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  };

  const getLastContactedLabel = () => {
    if (!contact.lastContactedAt) return { label: "New", color: "badge-primary" };
    const days = Math.floor((new Date().getTime() - new Date(contact.lastContactedAt).getTime()) / (1000 * 3600 * 24));
    if (days < 7) return { label: "Active", color: "badge-success" };
    if (days < 30) return { label: "Slipping", color: "badge-warning" };
    return { label: "Cold", color: "badge-ghost" };
  };

  const status = getLastContactedLabel();

  return (
    <>
      <div className="card bg-base-100 shadow-sm border border-base-200 overflow-visible">
        <div className="h-24 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-t-xl"></div>
        
        <div className="card-body pt-0 relative">
          {/* Avatar with Edit Overlay */}
          <div className="absolute -top-12 left-6">
             <div className="relative group w-24 h-24">
               <div className={`w-full h-full rounded-full ring ring-base-100 ring-offset-2 bg-neutral text-neutral-content flex items-center justify-center text-3xl font-bold overflow-hidden ${isEditing ? 'ring-primary' : ''}`}>
                  {formData.imageUrl ? (
                    <img src={formData.imageUrl} alt={formData.name} className="object-cover w-full h-full" />
                  ) : (
                    formData.name.charAt(0).toUpperCase()
                  )}
               </div>
               
               {/* Upload Overlay - Visible when Editing */}
               {isEditing && (
                 <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer text-white transition-opacity hover:bg-black/60">
                   {uploadingImage ? (
                     <span className="loading loading-spinner loading-sm"></span>
                   ) : (
                     <CameraIcon className="w-8 h-8" />
                   )}
                   <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                 </label>
               )}
             </div>
          </div>

          {/* ... Rest of the component ... */}
          <div className="flex justify-end gap-2 mt-4">
            {isEditing ? (
              <>
                <button onClick={() => setIsEditing(false)} className="btn btn-sm btn-ghost" disabled={loading}>Cancel</button>
                <button onClick={handleSave} className="btn btn-sm btn-primary" disabled={loading}>Save</button>
              </>
            ) : (
              <>
                <button onClick={() => setShowDeleteModal(true)} className="btn btn-sm btn-ghost text-error"><TrashIcon className="w-4 h-4" /></button>
                <button onClick={() => setIsEditing(true)} className="btn btn-sm btn-outline"><PencilSquareIcon className="w-4 h-4" /> Edit</button>
              </>
            )}
          </div>

          {/* Header Info */}
          <div className="mt-6 space-y-6">
             <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
               <div className="flex-1">
                  {isEditing ? (
                    <input className="input input-lg font-bold w-full" value={formData.name} onChange={e => handleChange('name', e.target.value)} placeholder="Name" />
                  ) : (
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                      {contact.name}
                      <span className={`badge badge-lg ${status.color} self-center`}>{status.label}</span>
                    </h1>
                  )}
                  
                  <div className="flex flex-wrap gap-4 mt-2 text-base-content/60">
                     <div className="flex items-center gap-1">
                       <BriefcaseIcon className="w-4 h-4" />
                       {isEditing ? (
                         <input className="input input-xs input-bordered" value={formData.jobTitle || ""} onChange={e => handleChange('jobTitle', e.target.value)} placeholder="Job Title" />
                       ) : (
                         <span>{contact.jobTitle || "No Job Title"}</span>
                       )}
                     </div>
                     <div className="flex items-center gap-1">
                       <BuildingOfficeIcon className="w-4 h-4" />
                       {isEditing ? (
                         <input className="input input-xs input-bordered" value={formData.company || ""} onChange={e => handleChange('company', e.target.value)} placeholder="Company" />
                       ) : (
                         <span>{contact.company || "No Company"}</span>
                       )}
                     </div>
                  </div>
               </div>
             </div>

             <div className="divider my-0"></div>

             {/* Detailed Grid */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                   <h3 className="font-bold text-sm uppercase text-base-content/40">Contact Info</h3>
                   
                   <div className="form-control">
                     <label className="label py-0 text-xs font-bold text-base-content/60">Email</label>
                     {isEditing ? <input type="email" className="input input-sm input-bordered" value={formData.email || ""} onChange={e => handleChange('email', e.target.value)} /> : <div className="flex gap-2 items-center"><EnvelopeIcon className="w-4 h-4 opacity-50" /> {contact.email || "--"}</div>}
                   </div>

                   <div className="form-control">
                     <label className="label py-0 text-xs font-bold text-base-content/60">Phone</label>
                     {isEditing ? <input type="tel" className="input input-sm input-bordered" value={formData.phone || ""} onChange={e => handleChange('phone', e.target.value)} /> : <div className="flex gap-2 items-center"><PhoneIcon className="w-4 h-4 opacity-50" /> {contact.phone || "--"}</div>}
                   </div>

                   <div className="form-control">
                     <label className="label py-0 text-xs font-bold text-base-content/60">Location</label>
                     {isEditing ? <input className="input input-sm input-bordered" value={formData.location || ""} onChange={e => handleChange('location', e.target.value)} /> : <div className="flex gap-2 items-center"><MapPinIcon className="w-4 h-4 opacity-50" /> {contact.location || "--"}</div>}
                   </div>
                </div>

                <div className="space-y-4">
                   <h3 className="font-bold text-sm uppercase text-base-content/40">Context</h3>
                   
                   <div>
                     <label className="label py-0 text-xs font-bold text-base-content/60 mb-2">Last Interaction</label>
                     <div className="flex items-center gap-2 text-sm">
                       <ClockIcon className="w-4 h-4 text-primary" />
                       {contact.lastContactedAt ? new Date(contact.lastContactedAt).toLocaleDateString() : "Never"}
                     </div>
                   </div>

                   <div>
                     <label className="label py-0 text-xs font-bold text-base-content/60 mb-2">Tags</label>
                     <div className="flex flex-wrap gap-2">
                       {formData.tags.map(tag => (
                         <span key={tag.name} className="badge badge-secondary badge-outline gap-1">
                           {tag.name}
                           {isEditing && <XMarkIcon className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag.name)} />}
                         </span>
                       ))}
                     </div>
                     {isEditing && <input className="input input-sm input-bordered w-full mt-2" placeholder="Add tag..." value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={addTag} />}
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
      
      {/* Delete Modal */}
      {showDeleteModal && (
        <dialog open className="modal modal-bottom sm:modal-middle bg-black/50">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-error">Delete Contact?</h3>
            <p className="py-4">Are you sure you want to permanently delete <strong>{contact.name}</strong>?</p>
            <div className="modal-action">
              <button className="btn" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="btn btn-error" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </dialog>
      )}
    </>
  );
}