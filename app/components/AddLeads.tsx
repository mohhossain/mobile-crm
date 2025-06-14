"use client";

import { useState, useEffect } from "react";

import { useRouter } from "next/navigation";
import { UserCircleIcon } from '@heroicons/react/24/solid'




//  make a POST request to the server to add a contact, with status dropdown, area input for tags hashtag and enter will make a tag visually

const AddLeads = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("NEW"); // default status is NEW
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  // image upload state
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [imageUrl, setImageUrl] = useState<string | null>(null);


  const router = useRouter();

  // image upload handler
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      
      // upload image to server
      const formData = new FormData();
      formData.append("image", file);

      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to upload image");
        }

        const data = await response.json();
        setImageUrl(data.url); // assuming the server returns the image URL
        console.log("Image uploaded successfully:", data.url);
        
      } catch (err) {
        console.error("Image upload error:", err);
        setError("Failed to upload image");
      }
    }

  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {

      console.log("Submitting lead:", { name, email, phone, status, tags });

      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, phone, status, tags, imageUrl }),
      });

      if (!response.ok) {
        throw new Error("Failed to add lead");
      }

      setSuccess(true);
      setName("");
      setEmail("");
      setPhone("");
      setStatus("");
      setTags([]);
      setImage(null);
      setImagePreview(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      // do a refresh of the page to show the new lead
      router.refresh();
      setLoading(false);
    }
  };

  return (

    // make the form center of the page 
    
    // daisyUI 
    <form className="max-w-md mx-auto p-6 rounded-lg shadow-md space-y-4"
      onSubmit={handleSubmit}
    > 
      <h2 className="text-2xl font-bold text-center mb-4">Add New Lead</h2>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && <p className="text-green-500 text-sm">Lead added successfully!</p>}
      <div className="form-control">
        <label className="label">
          <span className="label-text">Name</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="input input-bordered w-full"
        />
      </div>
      </form>
  )
}



export default AddLeads;
