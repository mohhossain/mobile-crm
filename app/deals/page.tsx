import React from 'react'

import AddDeals from '../components/AddDeals';

const Deals = () => {
  return (
    <div>
        <div className="deals-list flex flex-col gap-4">
            <h1 className="text-2xl font-bold mb-4">Deals</h1>
            <p className="text-gray-600">Manage your deals here.</p>
            {/* Add your deals components or content here */}
            <AddDeals />
        </div>
    </div>
  )
}

export default Deals;