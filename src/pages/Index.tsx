
import { useAuth } from "@/contexts/AuthContext";
import { AdminDashboard } from "@/components/AdminDashboard";
import { DriverPortal } from "@/components/DriverPortal";

const Index = () => {
  const { userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (userRole === 'admin') {
    return <AdminDashboard />;
  }

  return <DriverPortal />;
};

export default Index;
