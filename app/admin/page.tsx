import { IsAdmin } from "@/lib/admin";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";

// Dynamic import without ssr:false (will work in server component)
const App = dynamic(() => import("./app"));

const AdminPage = async () => {
    const isAdmin = await IsAdmin();
    
    if (!isAdmin) {
        redirect("/");
    }
    
    return <App />;
};

export default AdminPage;
//TODO somehow implement test mode where clicks and user responses are collected
