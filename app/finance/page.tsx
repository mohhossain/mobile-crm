// ... imports (keep existing) ...
import { getCurrentUser } from "@/lib/currentUser";
import { prisma } from "@/lib/prisma";
import FinanceTool from "@/app/components/FinanceTool";
import ExpenseList from "@/app/components/ExpenseList";
import DownloadExpensesButton from "@/app/components/DownloadExpensesButton";
import Link from "next/link";
import { 
  BanknotesIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  CreditCardIcon
} from "@heroicons/react/24/solid";

async function getFinanceData(userId: string, range: string = '6m') {
  // FIX: Added 'probability' to the select to prevent crashes in components using this data
  const deals = await prisma.deal.findMany({
    where: { userId },
    select: { 
      id: true, 
      amount: true, 
      status: true, 
      updatedAt: true, 
      closeDate: true, 
      title: true,
      probability: true // Added this field
    }
  });

  // ... expenses query ...
  const expenses = await prisma.expense.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    include: { deal: { select: { title: true } } }
  });

  // ... totals calculation (keep existing) ...
  const totalRevenue = deals
    .filter(d => d.status === 'WON')
    .reduce((sum, d) => sum + d.amount, 0);
    
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // ... month buckets generation (keep existing) ...
  // Generate Monthly Buckets
  let monthCount = 6;
  if (range === '1y') monthCount = 12;
  // ... existing logic for 'all' range ...
  if (range === 'all') {
    // Find the earliest date in data to determine range
    let minDate = new Date();
    
    deals.forEach(d => {
      const dDate = new Date(d.updatedAt);
      if (dDate < minDate) minDate = dDate;
    });
    
    expenses.forEach(e => {
      const eDate = new Date(e.date);
      if (eDate < minDate) minDate = eDate;
    });

    const today = new Date();
    // Calculate difference in months
    monthCount = (today.getFullYear() - minDate.getFullYear()) * 12 + (today.getMonth() - minDate.getMonth()) + 1;
    // Ensure at least 6 months show for aesthetics
    if (monthCount < 6) monthCount = 6;
  }

  const today = new Date();
  const months = Array.from({ length: monthCount }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    return {
      label: d.toLocaleString('default', { month: 'short', year: range !== '6m' ? '2-digit' : undefined }),
      monthIdx: d.getMonth(),
      year: d.getFullYear()
    };
  }).reverse();

  const chartData = months.map(({ label, monthIdx, year }) => {
    const monthRevenue = deals
      .filter(d => {
        // FIX: Use closeDate for WON deals if available, otherwise fallback to updatedAt
        const targetDate = d.status === 'WON' && d.closeDate ? new Date(d.closeDate) : new Date(d.updatedAt);
        return d.status === 'WON' && targetDate.getMonth() === monthIdx && targetDate.getFullYear() === year;
      })
      .reduce((sum, d) => sum + d.amount, 0);
      
    // ... existing expense filter ...
    const monthExpenses = expenses
      .filter(e => {
        const date = new Date(e.date);
        return date.getMonth() === monthIdx && date.getFullYear() === year;
      })
      .reduce((sum, e) => sum + e.amount, 0);

    return { month: label, revenue: monthRevenue, expense: monthExpenses };
  });

  // ... return data ...
  return {
    totals: { revenue: totalRevenue, expenses: totalExpenses, profit: netProfit, margin },
    chartData,
    deals,
    expenses
  };
}

export default async function FinancePage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  // ... (keep existing render logic) ...
  const user = await getCurrentUser();
  if (!user) return <div>Unauthorized</div>;

  const { range = '6m' } = await searchParams;
  const data = await getFinanceData(user.id, range);

  // Prepare SVG Path Data
  const maxVal = Math.max(...data.chartData.map(d => Math.max(d.revenue, d.expense))) || 1000;
  const getY = (val: number) => 98 - (val / maxVal) * 98;
  const getX = (index: number) => (index / (Math.max(data.chartData.length - 1, 1))) * 100;
  const revenuePoints = data.chartData.map((d, i) => `${getX(i)},${getY(d.revenue)}`).join(" ");
  const expensePoints = data.chartData.map((d, i) => `${getX(i)},${getY(d.expense)}`).join(" ");

  const getTabClass = (r: string) => `tab tab-xs ${range === r ? 'tab-active font-bold' : ''}`;

  // ... return JSX (Identical to previous version, just ensure getFinanceData uses new logic) ...
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Financial Overview</h1>
        <p className="text-gray-500">Track revenue, manage burn rate, and forecast profits.</p>
      </div>
      {/* ... Top Cards ... */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         {/* ... Cards ... */}
         <div className="stats shadow bg-base-100 border border-base-200">
            <div className="stat"><div className="stat-title">Total Revenue</div><div className="stat-value text-success">${data.totals.revenue.toLocaleString()}</div></div>
         </div>
         <div className="stats shadow bg-base-100 border border-base-200">
            <div className="stat"><div className="stat-title">Total Expenses</div><div className="stat-value text-error">${data.totals.expenses.toLocaleString()}</div></div>
         </div>
         <div className="stats shadow bg-base-100 border border-base-200">
            <div className="stat"><div className="stat-title">Net Profit</div><div className="stat-value text-primary">${data.totals.profit.toLocaleString()}</div></div>
         </div>
          <div className="stats shadow bg-base-100 border border-base-200">
            <div className="stat"><div className="stat-title">Margin</div><div className="stat-value text-secondary">{data.totals.margin.toFixed(1)}%</div></div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="card bg-base-100 shadow border border-base-200">
            <div className="card-body">
              <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <h2 className="card-title text-sm uppercase text-gray-500">Performance Trend</h2>
                <div className="tabs tabs-boxed tabs-xs bg-base-200">
                  <Link href="/finance?range=6m" className={getTabClass('6m')}>6 Months</Link>
                  <Link href="/finance?range=1y" className={getTabClass('1y')}>1 Year</Link>
                  <Link href="/finance?range=all" className={getTabClass('all')}>All Time</Link>
                </div>
              </div>
              <div className="h-64 w-full relative">
                <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                   {[0, 25, 50, 75, 100].map(y => <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="currentColor" strokeOpacity="0.05" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />)}
                   <polyline fill="none" strokeWidth="3" points={revenuePoints} vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" className="stroke-success drop-shadow-sm" />
                   <polyline fill="none" strokeWidth="3" points={expensePoints} vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 4" className="stroke-error drop-shadow-sm opacity-80" />
                </svg>
                 {/* Interaction Layer */}
                <div className="absolute inset-0 flex justify-between items-end z-10">
                  {data.chartData.map((item, i) => (
                    <div key={i} className="relative flex-1 h-full group flex flex-col justify-end items-center cursor-crosshair hover:bg-base-content/5 transition-colors rounded-lg">
                       <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-base-300 text-base-content text-xs p-2 rounded pointer-events-none transition-all shadow-xl border border-base-content/10 z-30 w-28 text-center">
                         <div className="font-bold mb-1">{item.month}</div>
                         <div className="text-success">Rev: ${item.revenue.toLocaleString()}</div>
                         <div className="text-error">Exp: ${item.expense.toLocaleString()}</div>
                       </div>
                       <div className="absolute w-2 h-2 bg-success rounded-full shadow-sm opacity-0 group-hover:opacity-100 z-20" style={{ top: `${getY(item.revenue)}%`, marginTop: '-4px' }}></div>
                       <div className="absolute w-2 h-2 bg-error rounded-full shadow-sm opacity-0 group-hover:opacity-100 z-20" style={{ top: `${getY(item.expense)}%`, marginTop: '-4px' }}></div>
                       {(data.chartData.length <= 12 || i % Math.ceil(data.chartData.length / 6) === 0) && <div className="mb-2 text-[10px] font-bold text-base-content/40 group-hover:text-base-content/70 whitespace-nowrap">{item.month}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <ExpenseList initialExpenses={data.expenses} />
        </div>
        <div className="space-y-8">
           <FinanceTool deals={data.deals} />
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