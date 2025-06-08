import React from 'react'
import AddLeads from '../components/AddLeads'; 
import Contacts from '../components/Contacts';
import { currentUser } from '@clerk/nextjs/server';

const Leads = async () => { 

    const user = await currentUser();

    
    

  return (
    <div>
        <div className="leads-list flex flex-col gap-4">
            <h1 className="text-2xl font-bold mb-4">Leads for {user?.firstName}</h1>
            <Contacts />
            <AddLeads />
        </div>
    </div>
    
  )
}

export default Leads;
