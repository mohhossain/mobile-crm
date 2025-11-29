"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import InputTags from "./InputTags";

interface ContactData {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
  imageUrl: string | null;
  tags: { name: string }[];
}

export default function EditContactForm({ contact }: { contact: ContactData }) {
  const [name, setName] = useState(contact.name);
  const [email, setEmail] = useState(contact.email || "");
  const [phone, setPhone] = useState(contact.phone || "");
  const [status, setStatus] = useState(contact.status);
  const [tags, setTags] = useState<string[]>(contact.tags.map(t => t.name));
  const [imageUrl, setImageUrl] = useState(contact.imageUrl || "");
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("image", file);
      try {
        const response = await fetch("/api/upload", { method: "POST", body: formData });
        if (response.ok) {
          const data = await response.json();
          setImageUrl(data.url);
        }
      } catch (err) {
        console.error("Image upload failed", err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/leads/${contact.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, status, tags, imageUrl }),
      });
      if (!res.ok) throw new Error("Failed");
      router.push("/contacts");
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if(!confirm("Are you sure you want to delete this contact?")) return;
    setLoading(true);
    try {
      await fetch(`/api/leads/${contact.id}`, { method: "DELETE" });
      router.push("/contacts");
      router.refresh();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl max-w-lg mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Edit Contact</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div className="flex justify-center mb-4">
           <div className="relative w-24 h-24">
             <img src={imageUrl || "https://placehold.co/100"} alt="Avatar" className="w-full h-full rounded-full object-cover border" />
             <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageChange} accept="image/*" />
           </div>
        </div>

        <div className="form-control">
          <label className="label">Name</label>
          <input className="input input-bordered" value={name} onChange={e => setName(e.target.value)} required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label">Email</label>
            <input type="email" className="input input-bordered" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="form-control">
            <label className="label">Phone</label>
            <input className="input input-bordered" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
        </div>

        <div className="form-control">
          <label className="label">Status</label>
          <select className="select select-bordered" value={status} onChange={e => setStatus(e.target.value)}>
             {["NEW", "CONTACTED", "QUALIFIED", "LOST", "CONVERTED", "HOT", "COLD"].map(s => (
               <option key={s} value={s}>{s}</option>
             ))}
          </select>
        </div>

        <div className="form-control">
           <InputTags tags={tags} onTagsInput={setTags} />
        </div>

        <div className="flex gap-4 mt-6">
          <button type="submit" className="btn btn-primary flex-1" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </button>
          <button type="button" className="btn btn-error btn-outline" onClick={handleDelete} disabled={loading}>
            Delete
          </button>
        </div>
      </form>
    </div>
  );
}