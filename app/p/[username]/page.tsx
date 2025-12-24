import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { GlobeAltIcon, CheckBadgeIcon, ArrowTopRightOnSquareIcon, SparklesIcon } from "@heroicons/react/24/solid";
import PublicInquiryForm from "@/app/components/PublicInquiryForm";
import Link from "next/link";
import { clerkClient } from "@clerk/nextjs/server";
import { Key, ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from "react";

export const dynamic = 'force-dynamic';

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    select: {
      name: true,
      bio: true,
      website: true,
      avatar: true,
      clerkId: true, // Fetch Clerk ID for fallback
      isProfileLive: true,
      username: true,
      products: {
        where: { isPublic: true },
        orderBy: { unitPrice: 'asc' }
      }
    }
  });

  if (!user) return notFound();
  if (!user.isProfileLive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100 text-center p-4">
        <div>
          <h1 className="text-2xl font-bold opacity-40">Profile Unavailable</h1>
          <p className="text-sm opacity-30 mt-2">This page is currently private.</p>
        </div>
      </div>
    );
  }

  // Logic: Use custom avatar if set, otherwise fetch Clerk avatar
  let displayAvatar = user.avatar;
  
  if (!displayAvatar && user.clerkId) {
    try {
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(user.clerkId);
      displayAvatar = clerkUser.imageUrl;
    } catch (e) {
      console.error("Failed to fetch Clerk avatar", e);
    }
  }

  return (
    <div className="min-h-screen bg-base-100 font-sans text-base-content">
      
      {/* Header Banner Area */}
      <div className="relative bg-gradient-to-b from-primary/5 to-transparent pt-24 pb-12 px-6">
        <div className="max-w-3xl mx-auto text-center relative z-10">
          
          {/* Avatar */}
          <div className="relative inline-block mb-6">
             <div className="w-32 h-32 rounded-full p-1 bg-base-100 ring-1 ring-base-200 shadow-2xl mx-auto">
               <div className="w-full h-full rounded-full overflow-hidden bg-neutral text-neutral-content flex items-center justify-center text-4xl font-bold">
                  {displayAvatar ? (
                    // Added 'object-top' to prioritize faces if the image is cropped
                    <img src={displayAvatar} alt={user.name} className="w-full h-full object-cover object-top" />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
               </div>
             </div>
             {/* Verified Badge */}
             <div className="absolute bottom-2 right-2 bg-base-100 rounded-full p-1 text-primary shadow-sm" title="Verified Pro">
               <CheckBadgeIcon className="w-6 h-6" />
             </div>
          </div>

          <h1 className="text-4xl font-black tracking-tight mb-3">{user.name}</h1>
          
          {user.bio && (
            <p className="text-lg text-base-content/60 leading-relaxed max-w-lg mx-auto">
              {user.bio}
            </p>
          )}

          {user.website && (
            <div className="mt-6">
              <a href={user.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-base-100 border border-base-200 shadow-sm hover:shadow-md transition-all text-sm font-medium text-primary group">
                <GlobeAltIcon className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                {user.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                <ArrowTopRightOnSquareIcon className="w-3 h-3 opacity-30" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-5xl mx-auto px-6 pb-24">
        
        {user.products.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8 justify-center opacity-40">
               <div className="h-px w-12 bg-current"></div>
               <span className="text-xs font-bold uppercase tracking-widest">Services</span>
               <div className="h-px w-12 bg-current"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {user.products.map((product: { id: Key | null | undefined; name: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; unitPrice: { toLocaleString: () => string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; }; description: any; }) => (
                <div key={product.id} className="group relative bg-base-100 rounded-3xl border border-base-200 hover:border-primary/30 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
                  <div className="p-8 flex-1">
                    <div className="flex justify-between items-start mb-4">
                       <h3 className="font-bold text-xl">{product.name}</h3>
                       <div className="badge badge-lg badge-primary badge-outline font-mono">
                         ${product.unitPrice.toLocaleString()}
                       </div>
                    </div>
                    <p className="text-sm text-base-content/60 leading-relaxed">
                      {product.description || "Professional service tailored to your needs."}
                    </p>
                  </div>
                  
                  <div className="p-6 pt-0 mt-auto">
                    <label 
                      htmlFor={`inquire-${product.id}`} 
                      className="btn btn-primary w-full shadow-lg shadow-primary/20 group-hover:scale-[1.02] transition-transform"
                    >
                      Book Now <SparklesIcon className="w-4 h-4 opacity-50" />
                    </label>
                  </div>

                  {/* Modal */}
                  <input type="checkbox" id={`inquire-${product.id}`} className="modal-toggle" />
                  <div className="modal modal-bottom sm:modal-middle bg-black/60 backdrop-blur-sm z-50">
                    <div className="modal-box">
                      <h3 className="font-bold text-lg mb-4">Inquire about {product.name}</h3>
                      <PublicInquiryForm 
                        ownerUsername={user.username!} 
                        serviceId={product.id?.toString()}
                        serviceName={String(product.name)}
                      />
                      <div className="modal-action">
                        <label htmlFor={`inquire-${product.id}`} className="btn btn-ghost btn-sm">Cancel</label>
                      </div>
                    </div>
                    <label className="modal-backdrop" htmlFor={`inquire-${product.id}`}>Close</label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* General Contact */}
        <div className="max-w-xl mx-auto text-center bg-base-200/50 rounded-3xl p-10 border border-base-200/50">
          <h3 className="text-xl font-bold mb-2">Got a custom project?</h3>
          <p className="text-base-content/60 mb-6">Let's discuss your unique needs.</p>
          <label htmlFor="general-contact" className="btn btn-outline px-8">
            Get in Touch
          </label>
        </div>

        {/* General Modal */}
        <input type="checkbox" id="general-contact" className="modal-toggle" />
        <div className="modal modal-bottom sm:modal-middle bg-black/60 backdrop-blur-sm z-50">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Contact {user.name}</h3>
            <PublicInquiryForm ownerUsername={user.username!} />
            <div className="modal-action">
              <label htmlFor="general-contact" className="btn btn-ghost btn-sm">Close</label>
            </div>
          </div>
          <label className="modal-backdrop" htmlFor="general-contact">Close</label>
        </div>

        <div className="mt-16 text-center opacity-20 hover:opacity-100 transition-opacity">
           <Link href="/" className="text-[10px] font-black tracking-[0.2em] uppercase flex items-center justify-center gap-2">
             Powered by <span className="bg-primary text-primary-content px-1 rounded">Pulse</span>
           </Link>
        </div>

      </div>
    </div>
  );
}