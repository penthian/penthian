
import AdminStats from "./AdminStats";
import AdminTable from "./AdminTable";
import AdminDashboard from "@/app/components/AdminDashboard";

const Page = () => {
  return (
    <AdminDashboard>
      <div className="space-y-6">
        <AdminStats />
        <AdminTable />
      </div>
    </AdminDashboard>
  );
};

export default Page;
