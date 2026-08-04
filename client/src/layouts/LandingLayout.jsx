import Navbar from "@/components/layout/Navbar";

function LandingLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main>{children}</main>
    </div>
  );
}

export default LandingLayout;
