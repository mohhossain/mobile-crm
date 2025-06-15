"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import InputTags from "./InputTags";

interface AddLeadsProps {
  onSuccess?: (contact: {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: string;
  }) => void;
}

const AddLeads: React.FC<AddLeadsProps> = ({ onSuccess }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("NEW");
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const router = useRouter();

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));

      const formData = new FormData();
      formData.append("image", file);

      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("Failed to upload image");

        const data = await response.json();
        setImageUrl(data.url);
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
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, status, tags, imageUrl }),
      });

      if (!response.ok) throw new Error("Failed to add lead");

      const data = await response.json();

      setSuccess(true);
      setName("");
      setEmail("");
      setPhone("");
      setStatus("NEW");
      setTags([]);
      setImage(null);
      setImagePreview(null);
      setImageUrl(null);

      // optional callback for parent component
      onSuccess?.(data.contact);

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="max-w-md mx-auto p-6 rounded-lg shadow-md space-y-4"
      onSubmit={handleSubmit}
    >
      <h2 className="text-2xl font-bold text-center mb-4">Add New Lead</h2>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && (
        <p className="text-green-500 text-sm">Lead added successfully!</p>
      )}
      <div className="form-control space-y-4 justify-center items-center text-center w-full">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          required
          className="input"
        />

        <input
          className="input validator"
          type="email"
          placeholder="mail@site.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="input validator"
          type="tel"
          placeholder="123-456-7890"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <select
          className="select select-bordered"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="NEW">New</option>
          <option value="CONTACTED">Contacted</option>
          <option value="QUALIFIED">Qualified</option>
          <option value="LOST">Lost</option>
          <option value="CONVERTED">Converted</option>
          <option value="HOT">Hot</option>
          <option value="COLD">Cold</option>
        </select>

        <div className="flex flex-col items-center w-full">
          <fieldset className="fieldset">
            <legend className="fieldset-legend text-left">
              Pick a profile picture
            </legend>
            <input
              type="file"
              className="file-input"
              accept="image/*"
              onChange={handleImageChange}
            />
            <label className="label">Max size 10MB</label>
          </fieldset>
        </div>

        <div className="flex flex-col text-center w-full items-center ">
          <InputTags tags={tags} onTagsInput={setTags} />
        </div>

        <button
          type="submit"
          className={`btn btn-primary ${loading ? "loading" : ""} w-78`}
          disabled={loading}
        >
          {loading ? "Adding Lead..." : "Add Lead"}
        </button>
      </div>
    </form>
  );
};

export default AddLeads;
