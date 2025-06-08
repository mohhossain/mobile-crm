import React from 'react'

// this is the contact card that takes a contact object and displays it

interface Contact{
    id: string;
    name: string;
    email: string;
    phone: string;
    status: string;
    tags: string[];
}

interface ContactProps {
    contact: Contact;
}

const Contact = ({ contact }: ContactProps) => {
  return (
    <div  className='contact-card border p-4 rounded shadow-md m-2 h-40 hover:shadow-lg transition-shadow duration-200 bg-white '> 
        <h3 className='text-lg font-semibold'>{contact.name}</h3>
        <p className='text-sm text-gray-600'>Email: {contact.email}</p>
        <p className='text-sm text-gray-600'>Phone: {contact.phone}</p>
        <p className='text-sm text-gray-600'>Status: {contact.status}</p>
        <div className='mt-2'>
            {contact.tags.map((tag, index) => (
            <span key={index} className='inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2'>
                #{tag}
            </span>
            ))}
        </div>
    </div>
  )
}

export default Contact