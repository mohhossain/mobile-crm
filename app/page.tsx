import { getCurrentUser } from "@/lib/currentUser";
import { prisma } from "@/lib/prisma";
import Contacts from "./components/Contacts";
import Deals from "./components/Deals";
import Link from "next/link";
import { 
  PlusIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon, 
  PresentationChartLineIcon 
} from "@heroicons/react/24/solid";

async function getDashboardStats(userId: string) {
  // Fetch all deals to perform advanced calculations in memory
  // This avoids complex groupBys that might be tricky with different Prisma versions
  const deals = await prisma.deal.findMany({
    where: { userId },
    select: { id: true, amount: true, status: true }
  });

  const taskCount = await prisma.task.count({
    where: { userId, status: { not: 'DONE' } }
  });

  // 1. Pipeline Calculation
  const activeDeals = deals.filter(d => ['NEGOTIATION', 'PENDING'].includes(d.status));
  const pipelineValue = activeDeals.reduce((sum, d) => sum + d.amount, 0);

  // 2. Weighted Projection (Financing Tool)
  // Logic: Negotiation = 50% probability, Pending = 80% probability
  const projectedRevenue = activeDeals.reduce((sum, d) => {
    const probability = d.status === 'PENDING' ? 0.8 : 0.5;
    return sum + (d.amount * probability);
  }, 0);

  // 3. Win Rate Metric
  const closedDeals = deals.filter(d => ['WON', 'LOST'].includes(d.status));
  const wonDeals = closedDeals.filter(d => d.status === 'WON');
  const winRate = closedDeals.length > 0 
    ? Math.round((wonDeals.length / closedDeals.length) * 100) 
    : 0;

  // 4. Average Deal Size
  const avgDealSize = deals.length > 0 
    ? deals.reduce((sum, d) => sum + d.amount, 0) / deals.length 
    : 0;

  // 5. Chart Data: Distribution by Status
  // Normalize values for the bar chart (percentage of total value)
  const totalValue = deals.reduce((sum, d) => sum + d.amount, 0) || 1;
  const chartData = [
    { 
      label: 'Won', 
      amount: wonDeals.reduce((sum, d) => sum + d.amount, 0), 
      color: 'bg-success',
      width: `${(wonDeals.reduce((sum, d) => sum + d.amount, 0) / totalValue) * 100}%`
    },
    { 
      label: 'Pending', 
      amount: deals.filter(d => d.status === 'PENDING').reduce((sum, d) => sum + d.amount, 0), 
      color: 'bg-warning',
      width: `${(deals.filter(d => d.status === 'PENDING').reduce((sum, d) => sum + d.amount, 0) / totalValue) * 100}%`
    },
    { 
      label: 'Negotiation', 
      amount: deals.filter(d => d.status === 'NEGOTIATION').reduce((sum, d) => sum + d.amount, 0), 
      color: 'bg-info',
      width: `${(deals.filter(d => d.status === 'NEGOTIATION').reduce((sum, d) => sum + d.amount, 0) / totalValue) * 100}%`
    }
  ].filter(d => d.amount > 0);

  return {
    pipelineValue,
    activeDealsCount: activeDeals.length,
    pendingTasks: taskCount,
    projectedRevenue,
    winRate,
    avgDealSize,
    chartData
  };
}

export default async function Home() {
  const user = await getCurrentUser();

  if (!user) return <div className="p-4">Please sign in.</div>;

  const stats = await getDashboardStats(user.id);

  return (
    <div className="flex flex-col gap-6 p-4 pb-24 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-500 text-sm">Welcome back, {user.name.split(' ')[0]}</p>
        </div>
        <Link href="/deals" className="btn btn-circle btn-primary btn-sm shadow-lg">
          <PlusIcon className="w-5 h-5" />
        </Link>
      </div>

      {/* Top Level Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Pipeline */}
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-5">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <ChartBarIcon className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Total Pipeline</span>
            </div>
            <div className="text-3xl font-bold text-primary">
              ${stats.pipelineValue.toLocaleString()}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Across {stats.activeDealsCount} active deals
            </div>
          </div>
        </div>

        {/* Card 2: Projected Revenue (Financing Tool) */}
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-5">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <PresentationChartLineIcon className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Projected Revenue</span>
            </div>
            <div className="text-3xl font-bold text-secondary">
              ${stats.projectedRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Weighted by deal probability
            </div>
          </div>
        </div>

        {/* Card 3: Performance */}
        <div className="card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-5">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <CurrencyDollarIcon className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Avg Deal Size</span>
            </div>
            <div className="flex justify-between items-end">
              <div className="text-3xl font-bold">
                ${stats.avgDealSize.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <div className="badge badge-lg badge-outline gap-1">
                Win Rate: <span className="font-bold text-success">{stats.winRate}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Pipeline Distribution */}
      {stats.chartData.length > 0 && (
        <div className="card bg-base-100 shadow-sm border border-base-200 p-6">
          <h3 className="font-bold text-sm text-gray-500 uppercase mb-4">Pipeline Distribution</h3>
          
          {/* Bar Chart Container */}
          <div className="flex w-full h-8 rounded-full overflow-hidden mb-4 bg-base-200">
            {stats.chartData.map((item) => (
              <div 
                key={item.label} 
                className={`h-full ${item.color} hover:opacity-80 transition-opacity`} 
                style={{ width: item.width }}
                title={`${item.label}: $${item.amount.toLocaleString()}`}
              />
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-6">
            {stats.chartData.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold">{item.label}</span>
                  <span className="text-xs text-gray-500">${item.amount.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Sections */}
      <div className="flex flex-col gap-8">
        <div>
          <Contacts />
        </div>
        
        <div>
           <div className="flex justify-between items-center mb-3 px-1">
             <h2 className="text-lg font-bold flex items-center gap-2">
               Active Deals
               <span className="badge badge-neutral badge-sm">{stats.activeDealsCount}</span>
             </h2>
             <Link href="/deals" className="text-xs btn btn-ghost btn-xs">View All</Link>
           </div>
           <Deals /> 
        </div>
      </div>
    </div>
  );
}