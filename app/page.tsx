

import { currentUser } from "@clerk/nextjs/server";

import { CldImage } from "next-cloudinary";

export default async function Home() {

  const user = await currentUser();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 ">
      
      Hello {user?.firstName}
     
    </main>
  );
}
