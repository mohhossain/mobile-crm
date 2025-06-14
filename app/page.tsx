

import { currentUser } from "@clerk/nextjs/server";

import { getCurrentUser } from "@/lib/currentUser";

import { CldImage } from "next-cloudinary";

export default async function Home() {

  const user = await getCurrentUser(); // Fetch the current user using the helper function

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 ">
      
      Hello {user?.name}
     
    </main>
  );
}
