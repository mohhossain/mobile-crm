"use client";

import React from "react";
import { TrashIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import { toast, Bounce } from "react-toastify";

interface Contact {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  imageUrl: string | null;
  tags: string[];
}

interface ContactProps {
  contact: Contact;
}

export default function ContactCard({ contact }: ContactProps) {
  const router = useRouter();

  const notifySuccess = (message: string) => {
    toast(message, {
      toastId: `success-${contact.id}`,
      position: "top-right",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      transition: Bounce,
    });
  };

  const notifyError = (message: string) => {
    toast.error(message, {
      toastId: `error-${contact.id}`,
      position: "top-right",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      transition: Bounce,
    });
  }

  // handle the delete action

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/leads`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: contact.id }),
      });

      if (response.ok) {
        notifySuccess(`Contact ${contact.name} deleted successfully!`);
        router.refresh() // Delay to allow the toast to show
      }
      else {
        notifyError("Failed to delete contact");
      }

      if (!response.ok) {
        throw new Error("Failed to delete contact");
      }

      // Redirect or update the UI after deletion
       // This will refresh the current page to reflect the deletion

      // Optionally, you can refresh the contacts list or show a success message
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
  };

  // background color base content from daisyUI
  return (
    <div className={`card bg-base-100 min-w-70 shadow-sm`}>
      {/* add a delete icon button */}

      <div className="card-actions justify-end">
        <button
          onClick={() =>
            // log the contact object
            (console.log("Deleting contact:", contact.name),
            document.getElementById(
              `modal-${contact.id}`
            ) as HTMLDialogElement | null)?.showModal()
          }
          className="btn btn-ghost btn-sm"
        >
          <TrashIcon className="h-5 w-5 text-gray-500 hover:text-red-500" />
        </button>
        <dialog id={`modal-${contact.id}`} className="modal">
          <div className="modal-box bg-warning text-warning-content">
            <h3 className="font-bold text-lg">Delete Confirmation</h3>
            <p className="py-4">
              Are you sure you want to delete{" "}
              <span className="text-error-content">{contact.name}</span>?
            </p>
            <form method="dialog" className="modal-action">
              <button onClick={handleDelete} className="btn btn-error">
                Yes
              </button>
              <button className="btn btn-primary">No</button>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
      </div>

      <div className="card-body max-w w-full">
        {contact.imageUrl ? (
          <div className="avatar">
            <div className="w-16 rounded-full">
              <img
                src={contact.imageUrl}
                alt={contact.name ?? undefined}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </div>
        ) : (
          <div className="avatar avatar-placeholder">
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-base-200">
              <span className="text-gray-500 text-lg">
                {(contact.name?.charAt(0)?.toUpperCase() ?? "")}
              </span>
            </div>
          </div>
        )}
        <h2 className="card-title">{contact.name}</h2>
        <p className="text-sm text-gray-500">{contact.email}</p>
        <p className="text-sm text-gray-500">{contact.phone}</p>
        <div className="flex flex-wrap gap-2 mt-2">
          {contact.tags.map((tag) => (
            <span
              key={tag}
              className="badge badge-primary badge-outline text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
        <p className="text-sm text-primary"> {contact.status}</p>
      </div>
    </div>
  );
}
