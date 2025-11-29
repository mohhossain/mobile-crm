'use client';
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  HomeIcon, 
  ClipboardDocumentCheckIcon, 
  UserGroupIcon, 
  BriefcaseIcon 
} from "@heroicons/react/24/outline";

const Dock = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("home");

  // Sync active tab with current URL path
  useEffect(() => {
    if (pathname === "/") setActiveTab("home");
    else if (pathname.includes("/tasks")) setActiveTab("tasks");
    else if (pathname.includes("/contacts")) setActiveTab("contacts");
    else if (pathname.includes("/deals")) setActiveTab("deals");
  }, [pathname]);

  const handleTabClick = (tab: string, route: string) => {
    setActiveTab(tab);
    router.push(route);
  };

  const getDockItemClass = (tab: string) => {
    return activeTab === tab ? "dock-active text-primary" : "text-neutral-content";
  };

  return (
    <div className="dock dock-xs bg-base-300 border-t border-base-100 pb-safe">
      <button
        className={`dock-item dock-item-xs ${getDockItemClass("home")}`}
        onClick={() => handleTabClick("home", "/")}
      >
        <HomeIcon className="h-6 w-6 mx-auto" />
        <span className="dock-label">Home</span>
      </button>

      <button
        className={`dock-item dock-item-xs ${getDockItemClass("contacts")}`}
        onClick={() => handleTabClick("contacts", "/contacts")}
      >
        <UserGroupIcon className="h-6 w-6 mx-auto" />
        <span className="dock-label">Contacts</span>
      </button>

      <button
        className={`dock-item dock-item-xs ${getDockItemClass("deals")}`}
        onClick={() => handleTabClick("deals", "/deals")}
      >
        <BriefcaseIcon className="h-6 w-6 mx-auto" />
        <span className="dock-label">Deals</span>
      </button>

      <button
        className={`dock-item dock-item-xs ${getDockItemClass("tasks")}`}
        onClick={() => handleTabClick("tasks", "/tasks")}
      >
        <ClipboardDocumentCheckIcon className="h-6 w-6 mx-auto" />
        <span className="dock-label">Tasks</span>
      </button>
    </div>
  );
};

export default Dock;