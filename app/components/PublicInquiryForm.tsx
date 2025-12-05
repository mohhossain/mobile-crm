"use client";

import { useState } from "react";
import { 
  PaperAirplaneIcon, 
  UserIcon, 
  EnvelopeIcon, 
  ChatBubbleBottomCenterTextIcon 
} from "@heroicons/react/24/outline";

interface Props {
  ownerUsername: string;
  serviceId?: string;
  serviceName?: string;
  onCancel?: () => void;
}

export default function PublicInquiryForm({ ownerUsername, serviceId, serviceName, onCancel }: Props) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/public/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          ownerUsername,
          serviceId
        }),
      });

      if (res.ok) {
        setSent(true);
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error(error);
      alert("Error sending inquiry");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center py-12 space-y-4 animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto">
          <PaperAirplaneIcon className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold">Message Sent!</h3>
        <p className="text-base-content/60">Thanks for reaching out. I'll get back to you shortly.</p>
        <button onClick={onCancel} className="btn btn-ghost btn-sm">Close</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      
      {serviceName && (
        <div className="badge badge-primary badge-outline mb-4">
          Inquiring about: {serviceName}
        </div>
      )}

      <div className="form-control">
        <div className="relative">
          <UserIcon className="w-5 h-5 absolute left-3 top-3 text-base-content/40" />
          <input 
            required 
            placeholder="Your Name" 
            className="input input-bordered w-full pl-10" 
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
        </div>
      </div>

      <div className="form-control">
        <div className="relative">
          <EnvelopeIcon className="w-5 h-5 absolute left-3 top-3 text-base-content/40" />
          <input 
            required 
            type="email" 
            placeholder="Your Email" 
            className="input input-bordered w-full pl-10" 
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
          />
        </div>
      </div>

      <div className="form-control">
        <div className="relative">
          <ChatBubbleBottomCenterTextIcon className="w-5 h-5 absolute left-3 top-3 text-base-content/40" />
          <textarea 
            required 
            placeholder="How can I help you?" 
            className="textarea textarea-bordered w-full pl-10 min-h-[100px]" 
            value={formData.message}
            onChange={e => setFormData({...formData, message: e.target.value})}
          />
        </div>
      </div>

      <button type="submit" className="btn btn-primary w-full" disabled={loading}>
        {loading ? <span className="loading loading-spinner"></span> : "Send Inquiry"}
      </button>
    </form>
  );
}