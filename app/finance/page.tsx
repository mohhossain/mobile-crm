import { getCurrentUser } from "@/lib/currentUser";
import { prisma } from "@/lib/prisma";
import FinanceControls from "@/app/components/FinanceControls";
import FinanceBarChart from "@/app/components/FinanceBarChart";
import FinanceCategoryDonut from "@/app/components/FinanceCategoryDonut";
import GeneralLedger, { LedgerItem } from "@/app/components/GeneralLedger";
import { 
  BanknotesIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  InformationCircleIcon,
  ChartPieIcon
} from "@heroicons/react/24/solid";
import { 
  startOfWeek, endOfWeek, 
  startOfMonth, endOfMonth, 
  startOfYear, endOfYear, 
  eachDayOfInterval, eachMonthOfInterval, eachYearOfInterval,
  format, parseISO, isSameDay, isSameMonth, isSameYear, isValid,
  sub
} from "date-fns";

// --- TYPES ---
type Period = 'week' | 'month' | 'year' | 'all';

// --- DATA FETCHING & PROCESSING ---
async function getFinanceData(userId: string, period: Period, dateStr?: string) {
  
  // 1. Determine Date Range (Current & Previous for comparison)
  const referenceDate = dateStr && isValid(parseISO(dateStr)) ? parseISO(dateStr) : new Date();
  
  let startDate = new Date();
  let endDate = new Date();
  let prevStartDate = new Date();
  let prevEndDate = new Date();

  switch (period) {
    case 'week':
      startDate = startOfWeek(referenceDate, { weekStartsOn: 1 }); 
      endDate = endOfWeek(referenceDate, { weekStartsOn: 1 });
      prevStartDate = sub(startDate, { weeks: 1 });
      prevEndDate = sub(endDate, { weeks: 1 });
      break;
    case 'month':
      startDate = startOfMonth(referenceDate);
      endDate = endOfMonth(referenceDate);
      prevStartDate = sub(startDate, { months: 1 });
      prevEndDate = sub(endDate, { months: 1 });
      break;
    case 'year':
      startDate = startOfYear(referenceDate);
      endDate = endOfYear(referenceDate);
      prevStartDate = sub(startDate, { years: 1 });
      prevEndDate = sub(endDate, { years: 1 });
      break;
    case 'all':
      startDate = new Date('2020-01-01'); 
      endDate = new Date(); 
      prevStartDate = new Date('1970-01-01'); // N/A
      prevEndDate = new Date('1970-01-01');
      break;
  }

  // 2. Fetch Data (Filtered by Range)
  // We separate fetches into two groups to ensure TypeScript correctly infers the aggregate types.
  
  // Group A: Current Period Lists
  const [currDeals, currExpenses, currInvoices] = await Promise.all([
    prisma.deal.findMany({
      where: { userId, status: 'WON', OR: [{ closeDate: { gte: startDate, lte: endDate } }, { closeDate: null, updatedAt: { gte: startDate, lte: endDate } }] },
      select: { id: true, amount: true, closeDate: true, updatedAt: true, title: true }
    }),
    prisma.expense.findMany({
      where: { userId, date: { gte: startDate, lte: endDate } },
      orderBy: { date: 'desc' },
      include: { deal: { select: { title: true } } }
    }),
    prisma.invoice.findMany({
      where: { userId, issueDate: { gte: startDate, lte: endDate } },
      include: { deal: { select: { title: true, contacts: true } } }
    })
  ]);

  // Group B: Previous Period Aggregates (Strict Type Inference)
  const [prevDeals, prevExpenses] = await Promise.all([
    prisma.deal.aggregate({
      where: { userId, status: 'WON', OR: [{ closeDate: { gte: prevStartDate, lte: prevEndDate } }, { closeDate: null, updatedAt: { gte: prevStartDate, lte: prevEndDate } }] },
      _sum: { amount: true }
    }),
    prisma.expense.aggregate({
      where: { userId, date: { gte: prevStartDate, lte: prevEndDate } },
      _sum: { amount: true }
    })
  ]);

  // 3. Aggregate Totals & Trends
  const totalRevenue = currDeals.reduce((sum, d) => sum + d.amount, 0);
  const totalExpenses = currExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // FIX: Cast _sum to any to prevent "Property 'amount' does not exist on type '{}'" error during build
  const prevRevenue = (prevDeals._sum as any)?.amount || 0;
  const prevExp = (prevExpenses._sum as any)?.amount || 0;
  
  // Calculate % change
  const calcTrend = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    // FIX: Use absolute value of previous period to correctly handle sign flips (Negative -> Positive)
    return ((curr - prev) / Math.abs(prev)) * 100;
  };

  const trends = {
    revenue: calcTrend(totalRevenue, prevRevenue),
    expenses: calcTrend(totalExpenses, prevExp),
    profit: calcTrend(netProfit, prevRevenue - prevExp)
  };

  // 4. Generate Chart Buckets
  let buckets: Date[] = [];
  let formatLabel = (d: Date) => "";
  let isSame = (d1: Date, d2: Date) => false;

  if (period === 'week' || period === 'month') {
    buckets = eachDayOfInterval({ start: startDate, end: endDate });
    formatLabel = (d) => format(d, "d"); 
    isSame = isSameDay;
  } else if (period === 'year') {
    buckets = eachMonthOfInterval({ start: startDate, end: endDate });
    formatLabel = (d) => format(d, "MMM");
    isSame = isSameMonth;
  } else {
    buckets = eachYearOfInterval({ start: startDate, end: endDate });
    formatLabel = (d) => format(d, "yyyy");
    isSame = isSameYear;
  }

  const chartData = buckets.map(bucketDate => {
    const revenue = currDeals
      .filter(d => isSame(d.closeDate || d.updatedAt, bucketDate))
      .reduce((sum, d) => sum + d.amount, 0);
    const expense = currExpenses
      .filter(e => isSame(e.date, bucketDate))
      .reduce((sum, e) => sum + e.amount, 0);
    return { label: formatLabel(bucketDate), dateStr: bucketDate.toISOString(), revenue, expense };
  });

  // 5. Build General Ledger (Unified List)
  const ledger: LedgerItem[] = [
    // Add Invoices (Income)
    ...currInvoices.map(inv => ({
      id: inv.id,
      date: inv.issueDate,
      type: 'INCOME' as const,
      entity: inv.deal?.contacts?.[0]?.name || inv.deal?.title || "Unknown Client",
      category: "Sales",
      amount: inv.amount,
      status: inv.status,
      reference: inv.number
    })),
    // Add Expenses (Expense)
    ...currExpenses.map(exp => ({
      id: exp.id,
      date: exp.date,
      type: 'EXPENSE' as const,
      entity: exp.description,
      category: exp.category,
      amount: exp.amount,
      status: 'PAID', // Expenses logged are usually paid
      reference: exp.deal?.title
    }))
  ];

  return {
    totals: { revenue: totalRevenue, expenses: totalExpenses, profit: netProfit, margin },
    trends,
    chartData,
    expenses: currExpenses,
    ledger
  };
}

// --- PAGE COMPONENT ---
export default async function FinancePage({ searchParams }: { searchParams: Promise<{ period?: string, date?: string }> }) {
  const user = await getCurrentUser();
  if (!user) return <div className="p-10 text-center">Please sign in.</div>;

  const { period = 'month', date } = await searchParams;
  const safePeriod = (['week', 'month', 'year', 'all'].includes(period) ? period : 'month') as Period;

  const data = await getFinanceData(user.id, safePeriod, date);

  // Trend Badge Helper
  const TrendBadge = ({ value }: { value: number }) => {
    if (value === 0) return <span className="text-xs opacity-50">-</span>;
    const isPositive = value > 0;
    return (
      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${isPositive ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
        {isPositive ? '↑' : '↓'} {Math.abs(value).toFixed(0)}%
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-32">
      
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Overview</h1>
          <p className="text-base-content/60 text-sm">Analyze cash flow, profitability, and trends.</p>
        </div>
        <FinanceControls />
      </div>

      {/* 1. EDUCATED TILES (With Trends) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
         
         <div className="stat bg-base-100 shadow-sm border border-base-200 rounded-2xl relative group">
            <div className="tooltip tooltip-bottom absolute top-2 right-2 z-10" data-tip="Total revenue from Won Deals.">
               <InformationCircleIcon className="w-4 h-4 text-base-content/20 hover:text-primary transition-colors cursor-help" />
            </div>
            <div className="stat-title text-xs font-bold uppercase opacity-60 flex justify-between">
              Revenue <TrendBadge value={data.trends.revenue} />
            </div>
            <div className="stat-value text-success text-2xl lg:text-3xl mt-1">${data.totals.revenue.toLocaleString()}</div>
         </div>

         <div className="stat bg-base-100 shadow-sm border border-base-200 rounded-2xl relative group">
            <div className="tooltip tooltip-bottom absolute top-2 right-2 z-10" data-tip="Total expenses logged.">
               <InformationCircleIcon className="w-4 h-4 text-base-content/20 hover:text-primary transition-colors cursor-help" />
            </div>
            <div className="stat-title text-xs font-bold uppercase opacity-60 flex justify-between">
              Expenses <TrendBadge value={data.trends.expenses} />
            </div>
            <div className="stat-value text-error text-2xl lg:text-3xl mt-1">-${data.totals.expenses.toLocaleString()}</div>
         </div>

         <div className="stat bg-base-100 shadow-sm border border-base-200 rounded-2xl relative group">
            <div className="tooltip tooltip-bottom absolute top-2 right-2 z-10" data-tip="Revenue - Expenses.">
               <InformationCircleIcon className="w-4 h-4 text-base-content/20 hover:text-primary transition-colors cursor-help" />
            </div>
            <div className="stat-title text-xs font-bold uppercase opacity-60 flex justify-between">
              Net Profit <TrendBadge value={data.trends.profit} />
            </div>
            <div className={`stat-value text-2xl lg:text-3xl mt-1 ${data.totals.profit >= 0 ? 'text-base-content' : 'text-error'}`}>
              ${data.totals.profit.toLocaleString()}
            </div>
         </div>

         <div className="stat bg-base-100 shadow-sm border border-base-200 rounded-2xl relative group">
            <div className="tooltip tooltip-bottom tooltip-left absolute top-2 right-2 z-10" data-tip="Profit Margin %">
               <InformationCircleIcon className="w-4 h-4 text-base-content/20 hover:text-primary transition-colors cursor-help" />
            </div>
            <div className="stat-title text-xs font-bold uppercase opacity-60">Margin</div>
            <div className="stat-value text-secondary text-2xl lg:text-3xl mt-1">{data.totals.margin.toFixed(1)}%</div>
         </div>
      </div>

      {/* 2. SPLIT VIEW: Chart & Breakdown */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Main Chart (66%) */}
        <div className="xl:col-span-2 card bg-base-100 shadow-sm border border-base-200">
          <div className="card-body p-4 sm:p-6">
             <div className="flex justify-between items-center mb-6">
                <h2 className="card-title text-sm uppercase opacity-50">Cash Flow Timeline</h2>
                <div className="flex items-center gap-4 text-xs font-bold">
                   <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-success"></div> Revenue</div>
                   <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-error"></div> Expense</div>
                </div>
             </div>
             <FinanceBarChart data={data.chartData} />
          </div>
        </div>

        {/* Breakdown Donut (33%) */}
        <div className="xl:col-span-1">
           <FinanceCategoryDonut expenses={data.expenses} />
        </div>
      </div>

      {/* 3. GENERAL LEDGER */}
      <GeneralLedger items={data.ledger} />

    </div>
  );
}