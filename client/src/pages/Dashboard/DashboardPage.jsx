import DashboardHeader from "@/components/dashboard/DashboardHeader";
import WelcomeCard from "@/components/dashboard/WelcomeCard";
import StatsCard from "@/components/dashboard/StatsCard";
import { DASHBOARD_STATS } from "@/constants/dashboard";
import AIInsightsCard from "@/components/dashboard/AIInsightsCard";
import QuickActions from "@/components/dashboard/QuickActions";

function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <DashboardHeader />

        <WelcomeCard />

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {DASHBOARD_STATS.map((item) => (
            <StatsCard
              key={item.id}
              title={item.title}
              value={item.value}
              subtitle={item.subtitle}
              icon={item.icon}
              color={item.color}
              bg={item.bg}
            />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <AIInsightsCard />
          </div>

          <QuickActions />
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
