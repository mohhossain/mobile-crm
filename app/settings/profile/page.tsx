"use client";

import { useState, useEffect } from "react";
import BackButton from "@/app/components/BackButton";
import { useUser } from "@clerk/nextjs"; // Import Clerk hook for default image
import { 
  LinkIcon, 
  GlobeAltIcon, 
  CameraIcon, 
  PhotoIcon,
  CheckBadgeIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

interface Product {
  id: string;
  name: string;
  unitPrice: number;
  isPublic: boolean;
}

export default function ProfileSettings() {
  const { user } = useUser(); // Get Clerk User Data directly
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    website: "",
    avatar: "",
    isProfileLive: false
  });

  // Fetch initial data
  useEffect(() => {
    // Fetch User
    fetch("/api/sync-user").then(res => res.json()).then(data => {
      if (data.user) {
        setFormData({
          username: data.user.username || "",
          bio: data.user.bio || "",
          website: data.user.website || "",
          avatar: data.user.avatar || "",
          isProfileLive: data.user.isProfileLive || false
        });
      }
    });

    // Fetch Products
    fetch("/api/products").then(res => res.json()).then(data => {
      if (Array.isArray(data)) setProducts(data);
    });
  }, []);

  // Helper: Resize Image Client-Side
  const resizeImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const MAX_SIZE = 800;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(new File([blob], file.name, { type: "image/jpeg", lastModified: Date.now() }));
                } else {
                    reject(new Error("Failed to compress"));
                }
            }, "image/jpeg", 0.8); 
        } else {
            reject(new Error("Canvas error"));
        }
      };
      img.onerror = (error) => reject(error);
    });
  };

  // Image Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const resizedFile = await resizeImage(file);
      const uploadData = new FormData();
      uploadData.append("image", resizedFile);

      const res = await fetch("/api/upload", { method: "POST", body: uploadData });
      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({ ...prev, avatar: data.url }));
      } else {
        alert("Failed to upload image");
      }
    } catch (error) {
      console.error(error);
      alert("Error uploading image");
    } finally {
      setUploading(false);
    }
  };

  const handleRevertToDefault = () => {
    if (confirm("Remove custom avatar and use your default profile picture?")) {
        setFormData(prev => ({ ...prev, avatar: "" })); // Clearing it will fall back to Clerk in UI logic (though API update needs to clear it too)
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        // Update products
        await Promise.all(products.map(p => 
          fetch(`/api/products/${p.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isPublic: p.isPublic })
          })
        ));
        alert("Profile updated successfully!");
      } else {
        const err = await res.json();
        alert(err.error || "Failed");
      }
    } catch (e) {
      alert("Error saving profile");
    } finally {
      setLoading(false);
    }
  };

  const toggleProductPublic = (id: string) => {
    setProducts(products.map(p => 
      p.id === id ? { ...p, isPublic: !p.isPublic } : p
    ));
  };

  // Display Logic: Use Custom -> Fallback to Clerk -> Fallback to Placeholder
  const displayAvatar = formData.avatar || user?.imageUrl;

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-8 pb-24">
      <BackButton />
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold mt-4">Public Profile</h1>
          <p className="text-base-content/60 text-sm">
            Manage your public presence and service offerings.
          </p>
        </div>
        {formData.username && (
          <a href={`/p/${formData.username}`} target="_blank" className="btn btn-sm btn-outline gap-2">
            <LinkIcon className="w-4 h-4" /> View Live
          </a>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* 1. Branding Section */}
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body">
             <h3 className="font-bold text-sm uppercase opacity-60 mb-4">Branding</h3>
             
             <div className="flex flex-col sm:flex-row gap-6 items-start">
               
               {/* Avatar Area */}
               <div className="flex flex-col items-center gap-2">
                 <div className="relative group cursor-pointer shrink-0">
                   <div className="w-24 h-24 rounded-full bg-base-200 border-2 border-dashed border-base-300 flex items-center justify-center overflow-hidden relative shadow-sm">
                      {displayAvatar ? (
                        // FIX: object-top prevents the "face cut off" issue
                        <img src={displayAvatar} alt="Profile" className="w-full h-full object-cover object-top" />
                      ) : (
                        <PhotoIcon className="w-8 h-8 opacity-20" />
                      )}
                      {uploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="loading loading-spinner loading-xs text-white"></span>
                        </div>
                      )}
                   </div>
                   <label className="absolute bottom-0 right-0 btn btn-xs btn-circle btn-primary shadow-lg border-2 border-base-100">
                     <CameraIcon className="w-3 h-3" />
                     <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                   </label>
                 </div>
                 
                 {/* Revert Button */}
                 {formData.avatar && (
                   <button 
                     type="button"
                     onClick={handleRevertToDefault}
                     className="btn btn-xs btn-ghost text-xs opacity-60 hover:opacity-100"
                   >
                     <ArrowPathIcon className="w-3 h-3" /> Use Default
                   </button>
                 )}
               </div>

               <div className="space-y-4 flex-1 w-full">
                  {/* Toggle Live */}
                  <div className="form-control bg-base-200/50 p-3 rounded-lg">
                    <label className="label cursor-pointer justify-between">
                      <span className="label-text font-medium flex items-center gap-2">
                        {formData.isProfileLive ? <CheckBadgeIcon className="w-4 h-4 text-success" /> : <span className="w-2 h-2 rounded-full bg-neutral"></span>}
                        {formData.isProfileLive ? "Profile is Public" : "Profile is Private"}
                      </span>
                      <input 
                        type="checkbox" 
                        className="toggle toggle-success toggle-sm" 
                        checked={formData.isProfileLive}
                        onChange={e => setFormData({...formData, isProfileLive: e.target.checked})}
                      />
                    </label>
                  </div>

                  {/* Username */}
                  <div className="form-control">
                      <label className="label text-xs font-bold opacity-60">Username URL</label>
                      <div className="join w-full">
                        <div className="btn btn-sm join-item no-animation bg-base-200 border-base-300 text-base-content/50">pulse.com/p/</div>
                        <input 
                          className="input input-sm input-bordered join-item w-full font-mono" 
                          value={formData.username}
                          onChange={e => setFormData({...formData, username: e.target.value.toLowerCase().replace(/\s/g, '-')})}
                          placeholder="yourname"
                        />
                      </div>
                  </div>
               </div>
             </div>

             {/* Bio & Links */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
               <div className="form-control">
                  <label className="label text-xs font-bold opacity-60">Bio</label>
                  <textarea 
                    className="textarea textarea-bordered h-24" 
                    placeholder="Freelance Designer based in NYC."
                    value={formData.bio}
                    onChange={e => setFormData({...formData, bio: e.target.value})}
                  ></textarea>
               </div>
               <div className="form-control">
                  <label className="label text-xs font-bold opacity-60">Website</label>
                  <div className="relative">
                    <GlobeAltIcon className="w-5 h-5 absolute left-3 top-3 text-base-content/40" />
                    <input 
                      className="input input-bordered w-full pl-10" 
                      placeholder="https://yourportfolio.com"
                      value={formData.website}
                      onChange={e => setFormData({...formData, website: e.target.value})}
                    />
                  </div>
               </div>
             </div>
          </div>
        </div>

        {/* 2. Service Visibility */}
        <div className="card bg-base-100 shadow-sm border border-base-200">
           <div className="card-body">
             <div className="flex justify-between items-center mb-4">
               <div>
                 <h3 className="font-bold text-sm uppercase opacity-60">Featured Services</h3>
                 <p className="text-xs text-base-content/50">Select which services appear on your public page.</p>
               </div>
               <a href="/settings/products" className="btn btn-xs btn-ghost">Manage Catalog</a>
             </div>

             <div className="space-y-2">
               {products.length === 0 && (
                 <div className="text-center py-8 border border-dashed border-base-300 rounded-lg text-xs opacity-50">
                   No services found. Add them in your catalog first.
                 </div>
               )}
               {products.map(product => (
                 <div key={product.id} className="flex items-center justify-between p-3 bg-base-200/30 rounded-lg border border-base-200">
                   <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${product.isPublic ? 'bg-success' : 'bg-base-300'}`}></div>
                      <div className="font-medium text-sm">{product.name}</div>
                      <div className="badge badge-sm badge-ghost font-mono text-xs">${product.unitPrice}</div>
                   </div>
                   <input 
                     type="checkbox" 
                     className="toggle toggle-xs toggle-primary" 
                     checked={product.isPublic}
                     onChange={() => toggleProductPublic(product.id)}
                   />
                 </div>
               ))}
             </div>
           </div>
        </div>

        <button type="submit" className="btn btn-primary w-full shadow-lg shadow-primary/20" disabled={loading}>
           {loading ? <span className="loading loading-spinner"></span> : "Save Changes"}
        </button>

      </form>
    </div>
  );
}