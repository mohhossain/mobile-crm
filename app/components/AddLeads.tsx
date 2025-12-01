"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import InputTags from "./InputTags";
import { 
  BriefcaseIcon, 
  BuildingOfficeIcon, 
  MapPinIcon, 
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  PhotoIcon
} from "@heroicons/react/24/outline";

interface AddLeadsProps {
  onSuccess?: (contact: any) => void;
  onCancel?: () => void;
}

const AddLeads: React.FC<AddLeadsProps> = ({ onSuccess, onCancel }) => {
  // Basic Info
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  
  // Context Info
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const router = useRouter();

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = null;

      // Upload image first if exists
      if (image) {
        const formData = new FormData();
        formData.append("image", image);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        if (uploadRes.ok) {
          const data = await uploadRes.json();
          imageUrl = data.url;
        }
      }

      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, email, phone, tags, imageUrl,
          jobTitle, company, location 
        }),
      });

      if (!response.ok) throw new Error("Failed to add contact");

      const data = await response.json();
      
      // Reset
      setName(""); setEmail(""); setPhone("");
      setJobTitle(""); setCompany(""); setLocation("");
      setTags([]); setImage(null); setImagePreview(null);

      onSuccess?.(data.contact);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to create contact");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-6 p-1" onSubmit={handleSubmit}>
      
      {/* Avatar Upload */}
      <div className="flex justify-center">
        <div className="relative group cursor-pointer">
          <div className="w-24 h-24 rounded-full bg-base-200 flex items-center justify-center overflow-hidden border-2 border-dashed border-base-content/20 hover:border-primary transition-colors">
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center text-base-content/40">
                <PhotoIcon className="w-8 h-8 mx-auto" />
                <span className="text-[10px] uppercase font-bold">Upload</span>
              </div>
            )}
          </div>
          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleImageChange} />
        </div>
      </div>

      {/* Main Fields */}
      <div className="space-y-4">
        <div className="form-control">
          <div className="relative">
            <UserIcon className="w-5 h-5 absolute left-3 top-3 text-base-content/40" />
            <input required placeholder="Full Name" className="input input-bordered w-full pl-10" value={name} onChange={e => setName(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <BriefcaseIcon className="w-5 h-5 absolute left-3 top-3 text-base-content/40" />
            <input placeholder="Job Title" className="input input-bordered w-full pl-10" value={jobTitle} onChange={e => setJobTitle(e.target.value)} />
          </div>
          <div className="relative">
            <BuildingOfficeIcon className="w-5 h-5 absolute left-3 top-3 text-base-content/40" />
            <input placeholder="Company" className="input input-bordered w-full pl-10" value={company} onChange={e => setCompany(e.target.value)} />
          </div>
        </div>

        <div className="relative">
           <EnvelopeIcon className="w-5 h-5 absolute left-3 top-3 text-base-content/40" />
           <input type="email" placeholder="Email Address" className="input input-bordered w-full pl-10" value={email} onChange={e => setEmail(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-3">
           <div className="relative">
             <PhoneIcon className="w-5 h-5 absolute left-3 top-3 text-base-content/40" />
             <input type="tel" placeholder="Phone" className="input input-bordered w-full pl-10" value={phone} onChange={e => setPhone(e.target.value)} />
           </div>
           <div className="relative">
             <MapPinIcon className="w-5 h-5 absolute left-3 top-3 text-base-content/40" />
             <input placeholder="Location" className="input input-bordered w-full pl-10" value={location} onChange={e => setLocation(e.target.value)} />
           </div>
        </div>

        <div className="form-control">
           <InputTags tags={tags} onTagsInput={setTags} />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
         {onCancel && <button type="button" onClick={onCancel} className="btn btn-ghost flex-1">Cancel</button>}
         <button type="submit" disabled={loading} className="btn btn-primary flex-1">
            {loading ? <span className="loading loading-spinner"></span> : "Create Contact"}
         </button>
      </div>
    </form>
  );
};

export default AddLeads;