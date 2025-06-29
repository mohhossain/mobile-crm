'use client';
import React, {useState} from "react";

import {  useRouter } from "next/navigation";
// import { useSession } from "next-auth/react";

const Dock = () => {

    // const { data: session, status } = useSession();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState("home")
    const tabs = ["home", "task", "search", "settings"];
    const isActive = (tab: string) => {
        return activeTab === tab ? "dock-active" : "";
    }

    const handleTabClick = (tab: string) => {
        setActiveTab(tab);
        switch (tab) {
            case "home":
                router.push("/");
                break;
            case "task":
                router.push("/tasks");
                break;
            case "search":
                router.push("/contacts");
                break;
            case "settings":
                router.push("/deals");
                break;
            default:
                router.push("/");
        }
    };


  return (
    <div>
      <div className="dock dock-xs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`dock-item dock-item-xs ${isActive(tab)}`}
            onClick={() => handleTabClick(tab)}
          >
            <span className="material-symbols-outlined">
              {tab === "home" ? "home" : tab === "task" ? "task_alt" : tab === "search" ? "search" : "settings"}
            </span>
          </button>
        ))}
        
      </div>
    </div>
  );
};

export default Dock;
