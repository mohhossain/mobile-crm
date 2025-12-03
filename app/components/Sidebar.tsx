"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  HomeIcon, 
  ClipboardDocumentCheckIcon, 
  UserGroupIcon, 
  BriefcaseIcon,
  Cog6ToothIcon,
  PlusIcon,
  BanknotesIcon
} from "@heroicons/react/24/outline";
import { 
  HomeIcon as HomeSolid, 
  ClipboardDocumentCheckIcon as TaskSolid, 
  UserGroupIcon as UserSolid, 
  BriefcaseIcon as DealSolid,
  Cog6ToothIcon as CogSolid,
  BanknotesIcon as BanknotesSolid
} from "@heroicons/react/24/solid";

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { name: "Overview", path: "/", icon: HomeIcon, activeIcon: HomeSolid },
    { name: "Pipeline", path: "/deals", icon: BriefcaseIcon, activeIcon: DealSolid },
    { name: "Finance", path: "/finance", icon: BanknotesIcon, activeIcon: BanknotesSolid }, // Added
    { name: "Tasks", path: "/tasks", icon: ClipboardDocumentCheckIcon, activeIcon: TaskSolid },
    { name: "Contacts", path: "/contacts", icon: UserGroupIcon, activeIcon: UserSolid },
    { name: "Settings", path: "/settings", icon: Cog6ToothIcon, activeIcon: CogSolid },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 border-r border-base-200 bg-base-100/50 backdrop-blur-xl">
      
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-primary rounded-lg shadow-lg shadow-primary/20 flex items-center justify-center">
           <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
        </div>
        <span className="font-black text-xl tracking-tight">Pulse</span>
      </div>

      <nav className="flex-1 px-4 space-y-2 py-4">
        {navItems.map((item) => {
          const active = isActive(item.path);
          const Icon = active ? item.activeIcon : item.icon;
          
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                active 
                  ? "bg-primary/10 text-primary" 
                  : "text-base-content/60 hover:bg-base-200 hover:text-base-content"
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? "text-primary" : "group-hover:text-base-content"}`} />
              {item.name}
              
              {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-base-200">
         <div className="bg-base-200/50 rounded-xl p-4">
            <h4 className="text-xs font-bold uppercase text-base-content/40 mb-2">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-2">
               <Link href="/deals" className="btn btn-xs btn-outline bg-base-100 border-base-300 w-full">
                 <PlusIcon className="w-3 h-3" /> Deal
               </Link>
               <Link href="/tasks" className="btn btn-xs btn-outline bg-base-100 border-base-300 w-full">
                 <PlusIcon className="w-3 h-3" /> Task
               </Link>
            </div>
         </div>
      </div>
    </aside>
  );
}