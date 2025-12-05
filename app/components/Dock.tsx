"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  HomeIcon, 
  ClipboardDocumentCheckIcon, 
  UserGroupIcon, 
  BriefcaseIcon,
  Cog6ToothIcon,
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

export default function Dock() {
  const pathname = usePathname();
  // activeTab is now derived directly from pathname for instant feedback
  const [activeTab, setActiveTab] = useState("home");
  
  const dockRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 4, width: 48, opacity: 0 });

  const navItems = [
    { id: "home", icon: HomeIcon, activeIcon: HomeSolid, route: "/" },
    { id: "deals", icon: BriefcaseIcon, activeIcon: DealSolid, route: "/deals" },
    { id: "finance", icon: BanknotesIcon, activeIcon: BanknotesSolid, route: "/finance" }, 
    { id: "tasks", icon: ClipboardDocumentCheckIcon, activeIcon: TaskSolid, route: "/tasks" },
    { id: "contacts", icon: UserGroupIcon, activeIcon: UserSolid, route: "/contacts" },
    { id: "settings", icon: Cog6ToothIcon, activeIcon: CogSolid, route: "/settings" },
  ];

  useEffect(() => {
    if (pathname === "/") setActiveTab("home");
    else if (pathname.includes("/finance")) setActiveTab("finance");
    else if (pathname.includes("/contacts")) setActiveTab("contacts");
    else if (pathname.includes("/deals")) setActiveTab("deals");
    else if (pathname.includes("/tasks")) setActiveTab("tasks");
    else if (pathname.includes("/settings")) setActiveTab("settings");
  }, [pathname]);

  useEffect(() => {
    if (!dockRef.current) return;
    const activeBtn = dockRef.current.querySelector(`[data-tab="${activeTab}"]`) as HTMLElement;
    if (activeBtn) {
      const { offsetLeft, offsetWidth } = activeBtn;
      setIndicatorStyle({ left: offsetLeft, width: offsetWidth, opacity: 1 });
    }
  }, [activeTab]);

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-[400px] px-4 lg:hidden">
      <div 
        ref={dockRef}
        className="relative bg-[#151516]/90 backdrop-blur-3xl border border-white/10 shadow-2xl shadow-black/50 rounded-2xl p-1.5 flex justify-between items-center ring-1 ring-white/5"
      >
        {/* Sliding Indicator */}
        <div 
          className="absolute top-1.5 bottom-1.5 bg-white/10 rounded-xl transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
          style={{ 
            left: indicatorStyle.left, 
            width: indicatorStyle.width,
            opacity: indicatorStyle.opacity
          }}
        />

        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = isActive ? item.activeIcon : item.icon;
          
          return (
            <Link
              key={item.id}
              href={item.route}
              data-tab={item.id}
              // onClick sets state immediately for instant visual feedback before route change
              onClick={() => setActiveTab(item.id)} 
              className="relative z-10 flex-1 h-12 flex items-center justify-center rounded-xl transition-transform active:scale-90 focus:outline-none"
            >
              <Icon 
                className={`w-6 h-6 transition-all duration-300 ${
                  isActive 
                    ? "text-primary scale-110 drop-shadow-lg" 
                    : "text-gray-400 hover:text-gray-200"
                }`} 
              />
              {isActive && <span className="absolute bottom-1 w-1 h-1 bg-primary rounded-full"></span>}
            </Link>
          );
        })}
      </div>
    </div>
  );
}