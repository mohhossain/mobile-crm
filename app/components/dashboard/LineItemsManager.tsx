"use client";

import { useState, useEffect } from "react";
import { 
  PlusIcon, 
  TrashIcon, 
  PencilSquareIcon, 
  TagIcon,
  ShoppingCartIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

interface LineItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  unitPrice: number;
}

export default function LineItemsManager({ dealId, initialItems, onUpdate }: { dealId: string, initialItems: LineItem[], onUpdate: () => void }) {
  const [items, setItems] = useState<LineItem[]>(initialItems);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [showCatalog, setShowCatalog] = useState(false);

  // Edit State
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editQty, setEditQty] = useState(1);
  const [editPrice, setEditPrice] = useState(0);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  // Fetch products on first catalog open
  const openCatalog = async () => {
    setShowCatalog(true);
    if (products.length === 0) {
      try {
        const res = await fetch('/api/products');
        if (res.ok) setProducts(await res.json());
      } catch (e) { console.error("Failed to load products"); }
    }
  };

  const startEdit = (item: LineItem) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditDesc(item.description || "");
    setEditQty(item.quantity);
    setEditPrice(item.price);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveToBackend = async (newItems: LineItem[]) => {
    setLoading(true);
    try {
      await fetch(`/api/deals/${dealId}/line-items`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: newItems })
      });
      onUpdate();
    } catch (e) {
      console.error(e);
      alert("Failed to save changes");
    } finally {
      setLoading(false);
    }
  };

  const saveEdit = async () => {
    const updatedItems = items.map(i => i.id === editingId ? { ...i, name: editName, description: editDesc, quantity: editQty, price: editPrice } : i);
    setItems(updatedItems);
    setEditingId(null);
    await saveToBackend(updatedItems);
  };

  const addBlankItem = async () => {
    const newItem = { id: `temp-${Date.now()}`, name: "New Service", quantity: 1, price: 0, description: "" };
    const newItems = [...items, newItem];
    setItems(newItems);
    await saveToBackend(newItems);
  };

  const addProductFromCatalog = async (product: Product) => {
    const newItem = { 
        id: `prod-${Date.now()}`, 
        name: product.name, 
        quantity: 1, 
        price: product.unitPrice, 
        description: product.description || "" 
    };
    const newItems = [...items, newItem];
    setItems(newItems);
    setShowCatalog(false);
    await saveToBackend(newItems);
  };

  const deleteItem = async (id: string) => {
    if(!confirm("Remove this item?")) return;
    const newItems = items.filter(i => i.id !== id);
    setItems(newItems);
    await saveToBackend(newItems);
  };

  const total = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200">
      <div className="card-body p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-sm uppercase opacity-50 flex items-center gap-2">
            <TagIcon className="w-4 h-4" /> Scope of Work
          </h3>
          <div className="flex gap-2">
             <button onClick={openCatalog} className="btn btn-xs btn-outline gap-2">
               <ShoppingCartIcon className="w-3 h-3" /> Catalog
             </button>
             <button onClick={addBlankItem} disabled={loading} className="btn btn-xs btn-ghost text-primary hover:bg-primary/10">
               <PlusIcon className="w-3 h-3" /> Add Custom
             </button>
          </div>
        </div>

        {/* Catalog Modal (Inline) */}
        {showCatalog && (
           <div className="mb-4 bg-base-50 p-3 rounded-xl border border-base-200 animate-in fade-in slide-in-from-top-2">
              <div className="flex justify-between items-center mb-2">
                 <span className="text-xs font-bold uppercase opacity-50">Select Product</span>
                 <button onClick={() => setShowCatalog(false)}><XMarkIcon className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto custom-scrollbar">
                 {products.map(p => (
                    <button key={p.id} onClick={() => addProductFromCatalog(p)} className="flex justify-between items-center p-2 bg-white rounded border border-base-200 hover:border-primary text-left text-xs">
                       <span className="font-bold truncate">{p.name}</span>
                       <span className="font-mono">${p.unitPrice}</span>
                    </button>
                 ))}
                 {products.length === 0 && <div className="text-xs opacity-50 p-2">No products found.</div>}
              </div>
           </div>
        )}

        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="p-3 border border-base-200 rounded-xl hover:border-base-300 transition bg-base-50/30 group">
              {editingId === item.id ? (
                <div className="space-y-3">
                   <div className="flex gap-2">
                      <input 
                        className="input input-sm input-bordered flex-1 font-bold" 
                        value={editName} 
                        onChange={e => setEditName(e.target.value)} 
                        placeholder="Service Name"
                      />
                      <input 
                        className="input input-sm input-bordered w-20 text-center" 
                        type="number" 
                        value={editQty} 
                        onChange={e => setEditQty(Number(e.target.value))} 
                        placeholder="Qty"
                      />
                      <input 
                        className="input input-sm input-bordered w-24 text-right" 
                        type="number" 
                        value={editPrice} 
                        onChange={e => setEditPrice(Number(e.target.value))} 
                        placeholder="Price"
                      />
                   </div>
                   <textarea 
                      className="textarea textarea-sm textarea-bordered w-full" 
                      value={editDesc} 
                      onChange={e => setEditDesc(e.target.value)} 
                      placeholder="Description (optional)"
                   />
                   <div className="flex justify-end gap-2">
                      <button onClick={cancelEdit} className="btn btn-xs btn-ghost">Cancel</button>
                      <button onClick={saveEdit} className="btn btn-xs btn-primary">Save</button>
                   </div>
                </div>
              ) : (
                <div className="flex justify-between items-start">
                   <div className="flex-1">
                      <div className="flex items-center gap-2">
                         <span className="font-bold text-sm">{item.name}</span>
                         {item.quantity > 1 && <span className="badge badge-xs badge-neutral opacity-50">x{item.quantity}</span>}
                      </div>
                      {item.description && <p className="text-xs text-base-content/60 mt-1 line-clamp-1">{item.description}</p>}
                   </div>
                   
                   <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-sm">${(item.price * item.quantity).toLocaleString()}</span>
                      <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                         <button onClick={() => startEdit(item)} className="btn btn-xs btn-square btn-ghost text-base-content/40 hover:text-primary">
                            <PencilSquareIcon className="w-4 h-4" />
                         </button>
                         <button onClick={() => deleteItem(item.id)} className="btn btn-xs btn-square btn-ghost text-base-content/40 hover:text-error">
                            <TrashIcon className="w-4 h-4" />
                         </button>
                      </div>
                   </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="border-t border-base-200 mt-4 pt-4 flex justify-between items-center">
           <span className="text-xs font-bold uppercase opacity-50">Total Value</span>
           <span className="text-xl font-black">${total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}