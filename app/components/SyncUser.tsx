"use client";
import React, { useEffect } from "react";

const SyncUser = () => {
  useEffect(() => {
    fetch("/api/sync-user")
      .then((res) => res.json())
      .then((data) => console.log("Synced user:", data));
  }, []);

  return <div></div>;
};

export default SyncUser;
