import React from 'react'
import AddLeads from '../components/AddLeads'; 
import Contacts from '../components/Contacts';

const Leads = async () => { 
  return (
    <div>
        <div className="leads-list flex flex-col gap-4">
            <Contacts />
            <AddLeads />
        </div>
    </div>
    
  )
}

export default Leads;
