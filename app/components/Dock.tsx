'use client';
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  HomeIcon, 
  ClipboardDocumentCheckIcon, 
  UserGroupIcon, 
  BriefcaseIcon,
  Cog6ToothIcon
} from "@heroicons/react/24/outline";

const Dock = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("home");

  // Sync active state with the current URL
  useEffect(() => {
    if (pathname === "/") setActiveTab("home");
    else if (pathname.includes("/tasks")) setActiveTab("tasks");
    else if (pathname.includes("/contacts")) setActiveTab("contacts");
    else if (pathname.includes("/deals")) setActiveTab("deals");
    else if (pathname.includes("/settings")) setActiveTab("settings");
  }, [pathname]);

  const handleTabClick = (tab: string, route: string) => {
    setActiveTab(tab);
    router.push(route);
  };

  const getDockItemClass = (tab: string) => {
    return activeTab === tab 
      ? "text-primary bg-primary/10 scale-105 shadow-sm" 
      : "text-base-content/60 hover:text-base-content hover:bg-base-200/50 hover:scale-105";
  };

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-auto max-w-[95vw]">
      <div className="flex items-center gap-1 sm:gap-2 bg-base-100/80 backdrop-blur-xl border border-base-content/5 shadow-2xl rounded-full px-3 py-2 ring-1 ring-base-content/5">
        <button 
          className={`p-3 rounded-full transition-all duration-300 flex flex-col items-center justify-center ${getDockItemClass("home")}`} 
          onClick={() => handleTabClick("home", "/")}
          aria-label="Home"
        >
          <HomeIcon className="h-6 w-6" />
        </button>

        <button 
          className={`p-3 rounded-full transition-all duration-300 flex flex-col items-center justify-center ${getDockItemClass("contacts")}`} 
          onClick={() => handleTabClick("contacts", "/contacts")}
          aria-label="Contacts"
        >
          <UserGroupIcon className="h-6 w-6" />
        </button>

        <button 
          className={`p-3 rounded-full transition-all duration-300 flex flex-col items-center justify-center ${getDockItemClass("deals")}`} 
          onClick={() => handleTabClick("deals", "/deals")}
          aria-label="Deals"
        >
          <BriefcaseIcon className="h-6 w-6" />
        </button>
        
        <button 
          className={`p-3 rounded-full transition-all duration-300 flex flex-col items-center justify-center ${getDockItemClass("tasks")}`} 
          onClick={() => handleTabClick("tasks", "/tasks")}
          aria-label="Tasks"
        >
          <ClipboardDocumentCheckIcon className="h-6 w-6" />
        </button>

        <div className="w-px h-6 bg-base-content/10 mx-1"></div>

        <button 
          className={`p-3 rounded-full transition-all duration-300 flex flex-col items-center justify-center ${getDockItemClass("settings")}`} 
          onClick={() => handleTabClick("settings", "/settings")}
          aria-label="Settings"
        >
          <Cog6ToothIcon className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export default Dock;