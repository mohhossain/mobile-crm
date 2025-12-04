"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, TrashIcon, TagIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";

interface Product {
  id: string;
  name: string;
  description: string | null;
  unitPrice: number;
  sku: string | null;
}

export default function ProductManager({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [desc, setDesc] = useState("");
  const [sku, setSku] = useState("");

  const router = useRouter();

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;
    setLoading(true);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, unitPrice: price, description: desc, sku }),
      });

      if (res.ok) {
        const newProduct = await res.json();
        setProducts([...products, newProduct]);
        setName(""); setPrice(""); setDesc(""); setSku("");
        setIsAdding(false);
        router.refresh();
      }
    } catch (e) {
      console.error(e);
      alert("Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      await fetch("/api/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setProducts(products.filter(p => p.id !== id));
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Add Button */}
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg">Service Catalog</h3>
        <button 
          onClick={() => setIsAdding(!isAdding)} 
          className="btn btn-sm btn-primary gap-2"
        >
          {isAdding ? "Cancel" : <><PlusIcon className="w-4 h-4" /> Add Item</>}
        </button>
      </div>

      {/* Add Form */}
      {isAdding && (
        <form onSubmit={handleAdd} className="bg-base-200/50 p-4 rounded-xl border border-base-300 space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label text-xs font-bold opacity-60">Service / Product Name</label>
              <input className="input input-sm input-bordered" placeholder="e.g. SEO Audit" value={name} onChange={e => setName(e.target.value)} required autoFocus />
            </div>
            <div className="form-control">
              <label className="label text-xs font-bold opacity-60">Unit Price ($)</label>
              <input type="number" className="input input-sm input-bordered" placeholder="0.00" value={price} onChange={e => setPrice(e.target.value)} required />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label text-xs font-bold opacity-60">Description (Optional)</label>
              <input className="input input-sm input-bordered" placeholder="Details..." value={desc} onChange={e => setDesc(e.target.value)} />
            </div>
            <div className="form-control">
              <label className="label text-xs font-bold opacity-60">SKU / Code (Optional)</label>
              <input className="input input-sm input-bordered" placeholder="SEO-001" value={sku} onChange={e => setSku(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="btn btn-sm btn-primary" disabled={loading}>
              {loading ? "Saving..." : "Save Item"}
            </button>
          </div>
        </form>
      )}

      {/* Product List */}
      <div className="grid grid-cols-1 gap-3">
        {products.length === 0 && (
          <div className="text-center py-12 border border-dashed border-base-300 rounded-xl">
            <TagIcon className="w-8 h-8 mx-auto opacity-20 mb-2" />
            <p className="text-sm text-base-content/40">No products yet. Add your services to speed up deal creation.</p>
          </div>
        )}
        
        {products.map((p) => (
          <div key={p.id} className="bg-base-100 p-4 rounded-xl border border-base-200 flex justify-between items-center group hover:border-primary/30 transition-colors">
            <div>
              <div className="font-bold flex items-center gap-2">
                {p.name}
                {p.sku && <span className="badge badge-xs badge-ghost">{p.sku}</span>}
              </div>
              {p.description && <div className="text-xs text-base-content/50 mt-0.5">{p.description}</div>}
            </div>
            <div className="flex items-center gap-4">
              <div className="font-mono font-bold text-lg">${p.unitPrice.toLocaleString()}</div>
              <button 
                onClick={() => handleDelete(p.id)} 
                className="btn btn-xs btn-square btn-ghost text-error opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}