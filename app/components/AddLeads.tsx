"use client";

import { useState, useEffect } from "react";

import { useRouter } from "next/navigation";
import { PhotoIcon, UserCircleIcon } from '@heroicons/react/24/solid'
import { ChevronDownIcon } from '@heroicons/react/16/solid'



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
    
    <form onSubmit={handleSubmit} className="space-y-20 divide-y divide-gray-200 max-w-5xl mx-auto p-2 justify-center space-x-10">
      {error && ( 
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}
      <div className="space-y-8 container mx-auto">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base/7 font-semibold text-gray-900">Setup client profile</h2>

          <div className=" mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-8">
              <label htmlFor="username" className="block text-sm/6 font-medium text-gray-900">
                Name
              </label>
              <div className="mt-2">
                <div className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                  
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Jane Smith"
                    className="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                  />
                </div>
              </div>
            </div>

            <div className="sm:col-span-8">
              <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                Email
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  name="email"
                  type="email"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 sm:leading-6"

                  /> 

              </div>
            </div>

            <div className="sm:col-span-8">
              <label htmlFor="phone" className="block text-sm/6 font-medium text-gray-900">
                Phone
              </label>
              <div className="mt-2">
                <input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  name="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 sm:leading-6"
                />
              </div>
            </div>

            <div className="sm:col-span-8">
              <label htmlFor="status" className="block text-sm/6 font-medium text-gray-900">
                Status
              </label>
              <div className="mt-2">
                <select
                  id="status"
                  name="status"
                  value={status}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatus(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm/6 sm:leading-6"
                >
                  

                  <option value="NEW" >New</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="QUALIFIED">Qualified</option>
                  <option value="LOST">Lost</option>
                  <option value="CONVERTED">Converted</option>
                  <option value="HOT">Hot</option>
                  <option value="COLD">Cold</option>


                </select>
              </div>
            </div>

            

            <div className="col-span-full">
              <label htmlFor="photo" className="block text-sm/6 font-medium text-gray-900">
                Photo
              </label>
              <div className="mt-2 flex items-center gap-x-3">

                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profile Preview"
                    className="h-12 w-12 rounded-full bg-gray-50"
                  />
                ) : (
                  <UserCircleIcon className="h-12 w-12 text-gray-300" />
                )}

                {/* file size less than  mb */}
               

                <input 
                  onChange={handleImageChange}
                  type="file"
                  id="photo"
                  name="photo"
                  accept="image/*"
                  className="sr-only"
                  
                />
                <label
                  htmlFor="photo"
                  className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50 cursor-pointer"
                >
                  <span>Change</span>       
                </label>
             </div>
            </div>

            
          </div>
        </div>

        
            


      <div className="mt-6 flex items-center justify-end gap-x-6">
        <button type="button" className="text-sm/6 font-semibold text-gray-900">
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Save
        </button>
      </div>
      </div>

    </form>
  )
}



export default AddLeads;
