import Sidebar from "./Sidebar";
import Header from "./Header";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative flex min-h-screen bg-[#0a0a0a] text-white">
      {/* Ambient gradient glow — fixed so it follows scroll */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[520px] w-[520px] rounded-full bg-[#e74c3c]/10 blur-[140px]" />
        <div className="absolute -bottom-40 -left-40 h-[480px] w-[480px] rounded-full bg-amber-500/[0.04] blur-[140px]" />
      </div>

      <Sidebar />

      {/* Main content shifted right by sidebar width */}
      <div className="relative z-10 flex-1 flex flex-col min-h-screen ml-60">
        <Header />
        <main className="flex-1 p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
