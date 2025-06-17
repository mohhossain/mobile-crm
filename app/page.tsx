
import { getCurrentUser } from "@/lib/currentUser";
import Contacts from "./components/Contacts";
import Deals from "./components/Deals";


export default async function Home() {

  const user = await getCurrentUser(); // Fetch the current user using the helper function

  return (
    <div className="flex flex-col gap-4 container">
      <h1 className="text-2xl font-bold ml-6">Welcome, {user?.name || "User"}!</h1>
      <p className="text-gray-600 ml-6">Manage your contacts and leads here.</p>
      <Contacts /> {/* Pass the user to the Contacts component */}
      <Deals /> 
    </div>
  );
}
