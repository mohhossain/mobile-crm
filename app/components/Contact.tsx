import React from "react";
import Image from "next/image";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  imageUrl: string;
  tags: string[];
}

interface ContactProps {
  contact: Contact;
}

export default function ContactCard({ contact }: ContactProps) {
  const isHotLead = contact.tags.includes("Hot Lead");

  return (
    <div className="rounded-2xl p-5 bg-[#0e0e11] text-white w-[280px] h-[190px] flex flex-col justify-between shadow-lg border border-[#2c2c32] relative">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#1f1f24]">
          <Image
            src={contact.imageUrl || "/default-avatar.png"}
            alt={contact.name}
            width={56}
            height={56}
            className="object-cover"
          />
        </div>
        <div className="flex-1 overflow-hidden">
          <h3 className="text-sm font-bold text-white truncate">
            {contact.name}
          </h3>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide truncate">
            {contact.status}
          </p>
        </div>
      </div>

      {isHotLead && (
        <div className="absolute top-3 right-3 text-[10px] font-semibold uppercase bg-orange-600 text-white px-2 py-0.5 rounded-full shadow">
          🔥 Hot Lead
        </div>
      )}

      <div className="mt-4">
        <p className="text-xs text-gray-400 mb-1">Source</p>
        <div className="flex gap-2">
          <span className="bg-white text-black text-xs px-2 py-0.5 rounded-full font-semibold shadow">
            LinkedIn
          </span>
          <span className="bg-white text-black text-xs px-2 py-0.5 rounded-full font-semibold shadow">
            Dribbble
          </span>
        </div>
      </div>
    </div>
  );
}
