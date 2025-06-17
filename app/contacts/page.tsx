import React from 'react'
import AddLeads from '../components/AddLeads'; 
import Contacts from '../components/Contacts';
import { ToastContainer, Bounce } from "react-toastify";

const Leads = async () => { 
  return (
    <div>
        <div className="flex flex-col gap-4">
            <ToastContainer
                position="top-right"
                autoClose={1000}
                hideProgressBar={false}
                closeOnClick
                pauseOnHover
                draggable
                theme="dark"
                transition={Bounce}
            />
            <Contacts />
            <AddLeads />
        </div>
    </div>
    
  )
}

export default Leads;
