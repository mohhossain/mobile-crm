import { getCurrentUser } from "@/lib/currentUser";
import { prisma } from "@/lib/prisma";
import FinanceTool from "@/app/components/FinanceTool";
import ExpenseList from "@/app/components/ExpenseList";
import DownloadExpensesButton from "@/app/components/DownloadExpensesButton"; // Imported
import { 
  BanknotesIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  CreditCardIcon
} from "@heroicons/react/24/solid";

async function getFinanceData(userId: string) {
  const deals = await prisma.deal.findMany({
    where: { userId },
    select: { id: true, amount: true, status: true, updatedAt: true, title: true }
  });

  const expenses = await prisma.expense.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    include: { deal: { select: { title: true } } }
  });

  // --- CALCULATIONS ---

  // 1. Totals
  const totalRevenue = deals
    .filter(d => d.status === 'WON')
    .reduce((sum, d) => sum + d.amount, 0);
    
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // 2. Monthly Breakdown (Last 6 Months)
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return d.toLocaleString('default', { month: 'short' });
  }).reverse();

  const chartData = months.map(month => {
    const monthRevenue = deals
      .filter(d => d.status === 'WON' && new Date(d.updatedAt).toLocaleString('default', { month: 'short' }) === month)
      .reduce((sum, d) => sum + d.amount, 0);
      
    const monthExpenses = expenses
      .filter(e => new Date(e.date).toLocaleString('default', { month: 'short' }) === month)
      .reduce((sum, e) => sum + e.amount, 0);

    return { month, revenue: monthRevenue, expense: monthExpenses };
  });

  return {
    totals: { revenue: totalRevenue, expenses: totalExpenses, profit: netProfit, margin },
    chartData,
    deals,
    expenses
  };
}

export default async function FinancePage() {
  const user = await getCurrentUser();
  if (!user) return <div>Unauthorized</div>;

  const data = await getFinanceData(user.id);

  return (
    <div className="p-4 pb-24 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Financial Overview</h1>
        <p className="text-gray-500">Track revenue, manage burn rate, and forecast profits.</p>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Revenue */}
        <div className="stats shadow bg-base-100 border border-base-200">
          <div className="stat">
            <div className="stat-figure text-success">
              <BanknotesIcon className="w-8 h-8 opacity-20" />
            </div>
            <div className="stat-title">Total Revenue</div>
            <div className="stat-value text-success">${data.totals.revenue.toLocaleString()}</div>
            <div className="stat-desc">Lifetime won deals</div>
          </div>
        </div>

        {/* Expenses */}
        <div className="stats shadow bg-base-100 border border-base-200">
          <div className="stat">
            <div className="stat-figure text-error">
              <CreditCardIcon className="w-8 h-8 opacity-20" />
            </div>
            <div className="stat-title">Total Expenses</div>
            <div className="stat-value text-error">${data.totals.expenses.toLocaleString()}</div>
            <div className="stat-desc">All recorded costs</div>
          </div>
        </div>

        {/* Net Profit */}
        <div className="stats shadow bg-base-100 border border-base-200">
          <div className="stat">
            <div className="stat-figure text-primary">
              <ArrowTrendingUpIcon className="w-8 h-8 opacity-20" />
            </div>
            <div className="stat-title">Net Profit</div>
            <div className={`stat-value ${data.totals.profit >= 0 ? 'text-primary' : 'text-warning'}`}>
              ${data.totals.profit.toLocaleString()}
            </div>
            <div className="stat-desc">
              {data.totals.margin.toFixed(1)}% Margin
            </div>
          </div>
        </div>

        {/* Burn Rate */}
        <div className="stats shadow bg-base-100 border border-base-200">
          <div className="stat">
            <div className="stat-figure text-secondary">
              <ArrowTrendingDownIcon className="w-8 h-8 opacity-20" />
            </div>
            <div className="stat-title">Avg Burn Rate</div>
            <div className="stat-value text-secondary">
              ${Math.round(data.totals.expenses / (data.expenses.length > 0 ? 6 : 1)).toLocaleString()}
            </div>
            <div className="stat-desc">Per month (est)</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Charts & Lists (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Monthly Performance Chart */}
          <div className="card bg-base-100 shadow border border-base-200">
            <div className="card-body">
              <h2 className="card-title text-sm uppercase text-gray-500 mb-6">Monthly Performance (Last 6 Months)</h2>
              <div className="h-64 flex items-end gap-4">
                {data.chartData.map((item) => {
                  const maxVal = Math.max(...data.chartData.map(d => Math.max(d.revenue, d.expense))) || 1;
                  const revHeight = (item.revenue / maxVal) * 100;
                  const expHeight = (item.expense / maxVal) * 100;
                  
                  return (
                    <div key={item.month} className="flex-1 flex flex-col justify-end gap-1 group relative">
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-12 left-1/2 -translate-x-1/2 bg-neutral text-neutral-content text-xs p-2 rounded pointer-events-none transition-opacity z-10 w-24 text-center">
                        <div className="text-success">+$ {item.revenue.toLocaleString()}</div>
                        <div className="text-error">-$ {item.expense.toLocaleString()}</div>
                      </div>
                      <div className="flex gap-1 items-end justify-center h-full">
                        <div style={{ height: `${revHeight}%` }} className="w-3 bg-success/80 rounded-t-sm transition-all hover:bg-success"></div>
                        <div style={{ height: `${expHeight}%` }} className="w-3 bg-error/80 rounded-t-sm transition-all hover:bg-error"></div>
                      </div>
                      <div className="text-center text-xs text-gray-400 mt-2">{item.month}</div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-3 h-3 bg-success/80 rounded-sm"></div> Revenue
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-3 h-3 bg-error/80 rounded-sm"></div> Expenses
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Expense List */}
          <ExpenseList initialExpenses={data.expenses} />

        </div>

        {/* Right Column: Tools (1/3) */}
        <div className="space-y-8">
           {/* Interactive Planner */}
           <FinanceTool deals={data.deals} />
           
           {/* Export Card with Working Button */}
           <div className="card bg-base-200 border border-base-300">
             <div className="card-body">
               <h3 className="font-bold">Tax Season?</h3>
               <p className="text-sm text-gray-500">Export your expense report for your accountant.</p>
               <DownloadExpensesButton expenses={data.expenses} />
             </div>
           </div>
        </div>

      </div>
    </div>
  );
}