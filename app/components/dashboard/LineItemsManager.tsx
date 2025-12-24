"use client";

import { useState, useEffect } from "react";
import { 
  PlusIcon, TrashIcon, TagIcon, PencilIcon, CheckIcon, XMarkIcon
} from "@heroicons/react/24/outline";

interface LineItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  productId?: string;
}

interface Product {
  id: string;
  name: string;
  unitPrice: number;
}

export default function LineItemsManager({ dealId, initialItems, onUpdate }: { dealId: string, initialItems: LineItem[], onUpdate: () => void }) {
  // Mode State
  const [isEditing, setIsEditing] = useState(false);
  
  // Data State
  const [items, setItems] = useState<LineItem[]>(initialItems);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // Load products catalog
  useEffect(() => {
    fetch('/api/products').then(res => res.json()).then(data => {
      if(Array.isArray(data)) setProducts(data);
    });
  }, []);

  // Sync with server only when NOT editing (to avoid overwriting user work)
  useEffect(() => {
    if (!isEditing) {
      setItems(initialItems || []);
    }
  }, [initialItems, isEditing]);

  // --- ACTIONS ---

  const handleSave = async () => {
    setLoading(true);
    try {
      // Clean data before sending (ensure numbers are numbers)
      const cleanItems = items.map(i => ({
        ...i,
        quantity: Number(i.quantity),
        price: Number(i.price)
      }));

      await fetch(`/api/deals/${dealId}/line-items`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cleanItems })
      });
      
      setIsEditing(false);
      onUpdate(); // Trigger parent refresh ONLY after explicit save
    } catch (e) {
      console.error(e);
      alert("Failed to save.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setItems(initialItems || []); // Revert
    setIsEditing(false);
  };

  const updateItem = (index: number, field: keyof LineItem, value: any) => {
    const newItems = [...items];
    // Unlink product if name is manually changed
    if (field === 'name') newItems[index].productId = undefined;
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const selectProduct = (index: number, pid: string) => {
    const p = products.find(x => x.id === pid);
    if (!p) return;
    const newItems = [...items];
    newItems[index] = { 
        ...newItems[index], 
        productId: p.id, 
        name: p.name, 
        price: p.unitPrice 
    };
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { id: `temp-${Date.now()}`, name: "", quantity: 1, price: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const total = items.reduce((sum, i) => sum + (Number(i.price) * Number(i.quantity)), 0);

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200">
      <div className="card-body p-5">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-sm uppercase opacity-50 flex items-center gap-2">
            <TagIcon className="w-4 h-4" /> Scope of Work
          </h3>
          
          <div className="flex gap-2">
             {isEditing ? (
                 <>
                   <button onClick={handleCancel} className="btn btn-xs btn-ghost text-error" disabled={loading}>
                     <XMarkIcon className="w-3 h-3" /> Cancel
                   </button>
                   <button onClick={handleSave} className="btn btn-xs btn-primary" disabled={loading}>
                     {loading ? <span className="loading loading-spinner"></span> : <><CheckIcon className="w-3 h-3" /> Save Changes</>}
                   </button>
                 </>
             ) : (
                 <button onClick={() => setIsEditing(true)} className="btn btn-xs btn-ghost text-primary hover:bg-primary/10">
                   <PencilIcon className="w-3 h-3" /> Edit Items
                 </button>
             )}
          </div>
        </div>

        {/* --- VIEW MODE --- */}
        {!isEditing && (
            <div className="space-y-1">
                {items.length === 0 ? (
                    <div className="text-center py-6 border-2 border-dashed border-base-200 rounded-xl text-sm opacity-50">
                        No items added yet.
                    </div>
                ) : (
                    <table className="table table-sm w-full">
                        <thead>
                            <tr className="text-xs uppercase opacity-50 border-b border-base-200">
                                <th className="pl-0">Item</th>
                                <th className="text-center">Qty</th>
                                <th className="text-right pr-0">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, idx) => (
                                <tr key={item.id || idx} className="border-b border-base-100 last:border-none">
                                    <td className="pl-0 py-3">
                                        <div className="font-bold">{item.name || "Untitled Item"}</div>
                                        {item.description && <div className="text-xs opacity-50">{item.description}</div>}
                                    </td>
                                    <td className="text-center font-mono opacity-70">{item.quantity}</td>
                                    <td className="text-right pr-0 font-mono">${(Number(item.price) * Number(item.quantity)).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        )}

        {/* --- EDIT MODE --- */}
        {isEditing && (
            <div className="space-y-3 animate-in fade-in">
                {items.map((item, idx) => (
                    <div key={item.id || idx} className="p-3 border border-base-200 rounded-xl bg-base-50/50">
                        <div className="grid grid-cols-12 gap-2 items-end">
                             {/* Product Selector */}
                             <div className="col-span-6">
                                <label className="text-[10px] uppercase font-bold opacity-40">Item / Service</label>
                                
                                {/* FIX IS HERE: Changed bg-white to bg-base-100 text-base-content */}
                                <select 
                                    className="select select-xs select-bordered w-full mb-1 bg-base-100 text-base-content"
                                    value={item.productId || ""}
                                    onChange={(e) => selectProduct(idx, e.target.value)}
                                >
                                    <option value="">Custom Item...</option>
                                    <option disabled>──────────</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name} (${p.unitPrice})</option>)}
                                </select>

                                <input 
                                    className="input input-xs input-bordered w-full font-bold"
                                    placeholder="Name"
                                    value={item.name}
                                    onChange={(e) => updateItem(idx, 'name', e.target.value)}
                                />
                             </div>
                             
                             {/* Qty */}
                             <div className="col-span-2">
                                <label className="text-[10px] uppercase font-bold opacity-40 text-center block">Qty</label>
                                <input 
                                    type="number" min="1"
                                    className="input input-xs input-bordered w-full text-center"
                                    value={item.quantity}
                                    onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                                />
                             </div>

                             {/* Price */}
                             <div className="col-span-3">
                                <label className="text-[10px] uppercase font-bold opacity-40 text-right block">Price</label>
                                <input 
                                    type="number" min="0"
                                    className="input input-xs input-bordered w-full text-right"
                                    value={item.price}
                                    onChange={(e) => updateItem(idx, 'price', e.target.value)}
                                />
                             </div>

                             {/* Delete */}
                             <div className="col-span-1 flex justify-end">
                                <button onClick={() => removeItem(idx)} className="btn btn-xs btn-square btn-ghost text-error">
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                             </div>
                        </div>
                        <div className="mt-2">
                            <input 
                                className="input input-xs w-full bg-transparent placeholder:opacity-50"
                                placeholder="Optional description..."
                                value={item.description || ""}
                                onChange={(e) => updateItem(idx, 'description', e.target.value)}
                            />
                        </div>
                    </div>
                ))}
                
                <button onClick={addItem} className="btn btn-sm btn-outline btn-block border-dashed opacity-50 hover:opacity-100">
                    <PlusIcon className="w-4 h-4" /> Add Line Item
                </button>
            </div>
        )}

        {/* Footer Total */}
        <div className="border-t border-base-200 mt-4 pt-4 flex justify-between items-center">
           <span className="text-xs font-bold uppercase opacity-50">Total Value</span>
           <span className="text-xl font-black">${total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}