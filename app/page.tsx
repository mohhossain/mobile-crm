import { getCurrentUser } from "@/lib/currentUser";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { 
  ExclamationCircleIcon,
  ClockIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  ClipboardDocumentListIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  DocumentTextIcon
} from "@heroicons/react/24/solid";
import FinancialPulseCard from "./components/FinancialPulseCard";
import HomeActions from "./components/HomeActions";
import LandingPage from "./components/LandingPage";
import { Key, ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from "react";
import DashboardWrapper from "./components/DashboardWrapper";

// --- TYPES ---
type AlertType = 'CRITICAL' | 'WARNING' | 'INFO' | 'SUCCESS';

async function getSmartDashboardData(userId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  // Parallel Data Fetching
  const [deals, tasks, invoices, expenses, activityNotes] = await Promise.all([
    // 1. Deals
    prisma.deal.findMany({
      where: { userId },
      select: { id: true, title: true, amount: true, status: true, updatedAt: true, probability: true }
    }),
    // 2. Urgent Tasks (Due today or overdue)
    prisma.task.findMany({
      where: { 
        userId, 
        status: { not: 'DONE' },
        dueDate: { lte: endOfToday } 
      },
      orderBy: { dueDate: 'asc' },
      take: 5,
      include: { deal: { select: { title: true } } }
    }),
    // 3. Invoices (For Cash Flow)
    prisma.invoice.findMany({
      where: { userId },
      select: { id: true, number: true, amount: true, status: true, dueDate: true, deal: { select: { title: true } } }
    }),
    // 4. Expenses (For Net Profit)
    prisma.expense.aggregate({
      where: { userId },
      _sum: { amount: true }
    }),
    // 5. Recent Notes (Activity)
    prisma.note.findMany({
      where: { userId },
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: { 
        deal: { select: { title: true, id: true } },
        contact: { select: { name: true, id: true } } // Added Contact for linking
      }
    })
  ]);

  // --- METRIC CALCULATIONS ---

  // 1. Cash & Revenue
  const wonDeals = deals.filter((d: { status: string; }) => d.status === 'WON');
  const revenueYTD = wonDeals.reduce((sum: any, d: { amount: any; }) => sum + d.amount, 0);
  const totalExpenses = expenses._sum.amount || 0;
  
  // 2. "The Chase List" (Money Owed)
  const pendingInvoices = invoices.filter((i: { status: string; }) => i.status === 'SENT' || i.status === 'OVERDUE');
  const pendingCash = pendingInvoices.reduce((sum: any, i: { amount: any; }) => sum + i.amount, 0);
  
  // 3. Pipeline Health
  const activeDeals = deals.filter((d: { status: string; }) => !['WON', 'LOST', 'CANCELLED'].includes(d.status));
  const pipelineValue = activeDeals.reduce((sum: any, d: { amount: any; }) => sum + d.amount, 0);
  const weightedPipeline = activeDeals.reduce((sum: number, d: { amount: number; probability: number; }) => sum + (d.amount * (d.probability / 100)), 0);

  // 4. Stale Deals (No update in 7 days)
  const staleDeals = activeDeals.filter((d: { updatedAt: string | number | Date; }) => new Date(d.updatedAt) < sevenDaysAgo);

  return {
    metrics: {
      revenueYTD,
      netProfit: revenueYTD - totalExpenses,
      pendingCash,
      activeDealCount: activeDeals.length,
      urgentTaskCount: tasks.length,
      pipelineValue,
      weightedPipeline
    },
    lists: {
      urgentTasks: tasks,
      pendingInvoices,
      staleDeals,
      recentActivity: activityNotes
    },
    raw: {
      expenses: totalExpenses
    }
  };
}

export default async function Home() {
  const user = await getCurrentUser();
  if (!user) return <LandingPage />;

  const data = await getSmartDashboardData(user.id);
  const { metrics, lists } = data;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <DashboardWrapper>
    <div className="space-y-8 pb-32">
      
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-base-content">
            {greeting}, {user.name.split(' ')[0]}
          </h1>
          <p className="text-base-content/60 mt-1 font-medium">
            Here's your business pulse for today.
          </p>
        </div>
        <HomeActions />
      </div>

      {/* 2. "THE PULSE" TILES (Top Stats) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Active Pipeline */}
        <div className="stats shadow-sm border border-base-200 bg-base-100">
          <div className="stat p-4">
            <div className="stat-figure text-primary bg-primary/10 p-2 rounded-lg">
              <ChartBarIcon className="w-5 h-5" />
            </div>
            <div className="stat-title text-xs font-bold uppercase opacity-60">Pipeline</div>
            <div className="stat-value text-lg lg:text-2xl">${metrics.pipelineValue.toLocaleString()}</div>
            <div className="stat-desc text-xs">{metrics.activeDealCount} active deals</div>
          </div>
        </div>

        {/* Metric 2: Pending Cash (The Chase) */}
        <div className="stats shadow-sm border border-base-200 bg-base-100">
          <div className="stat p-4">
            <div className={`stat-figure p-2 rounded-lg ${metrics.pendingCash > 0 ? 'text-warning bg-warning/10' : 'text-base-content/20 bg-base-200'}`}>
              <BanknotesIcon className="w-5 h-5" />
            </div>
            <div className="stat-title text-xs font-bold uppercase opacity-60">Pending Cash</div>
            <div className="stat-value text-lg lg:text-2xl">${metrics.pendingCash.toLocaleString()}</div>
            <div className="stat-desc text-xs">{lists.pendingInvoices.length} invoices sent</div>
          </div>
        </div>

        {/* Metric 3: Urgent Tasks */}
        <div className="stats shadow-sm border border-base-200 bg-base-100">
          <div className="stat p-4">
            <div className={`stat-figure p-2 rounded-lg ${metrics.urgentTaskCount > 0 ? 'text-error bg-error/10' : 'text-success bg-success/10'}`}>
              <ClipboardDocumentListIcon className="w-5 h-5" />
            </div>
            <div className="stat-title text-xs font-bold uppercase opacity-60">Urgent</div>
            <div className="stat-value text-lg lg:text-2xl">{metrics.urgentTaskCount}</div>
            <div className="stat-desc text-xs">Tasks due today</div>
          </div>
        </div>

        {/* Metric 4: Net Profit (YTD) */}
        <div className="stats shadow-sm border border-base-200 bg-base-100">
          <div className="stat p-4">
            <div className="stat-figure text-success bg-success/10 p-2 rounded-lg">
              <ArrowTrendingUpIcon className="w-5 h-5" />
            </div>
            <div className="stat-title text-xs font-bold uppercase opacity-60">Net Profit</div>
            <div className="stat-value text-lg lg:text-2xl">${metrics.netProfit.toLocaleString()}</div>
            <div className="stat-desc text-xs">YTD</div>
          </div>
        </div>
      </div>

      {/* 3. MAIN COCKPIT (Split Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* LEFT COLUMN (2/3): Financials & Pipeline */}
        <div className="lg:col-span-2 space-y-6">
           
           {/* Financial Card */}
           <FinancialPulseCard financials={{ 
             revenue: metrics.revenueYTD, 
             expenses: data.raw.expenses, 
             profit: metrics.netProfit 
           }} />

           {/* Pipeline Health (Stale Deals) */}
           <div className="card bg-base-100 shadow-sm border border-base-200">
              <div className="card-body p-5">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold uppercase text-base-content/50 flex items-center gap-2">
                      <BriefcaseIcon className="w-4 h-4" /> Pipeline Health
                    </h3>
                    <Link href="/deals" className="btn btn-xs btn-ghost">View All</Link>
                 </div>

                 {lists.staleDeals.length === 0 ? (
                   <div className="bg-success/5 border border-success/10 rounded-xl p-4 flex items-center gap-3 text-success">
                      <CheckCircleIcon className="w-6 h-6" />
                      <span className="text-sm font-medium">Pipeline is moving! No stalled deals.</span>
                   </div>
                 ) : (
                   <div className="space-y-3">
                      <div className="text-xs text-warning font-bold uppercase tracking-wider">
                        Needs Attention ({lists.staleDeals.length})
                      </div>
                      {lists.staleDeals.slice(0, 3).map((deal: { id: Key | null | undefined; title: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; status: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; amount: { toLocaleString: () => string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; }; }) => (
                        <Link href={`/deals/${deal.id}`} key={deal.id} className="flex justify-between items-center p-3 bg-base-200/50 hover:bg-base-200 rounded-lg transition-colors group">
                           <div>
                             <div className="font-bold text-sm">{deal.title}</div>
                             <div className="text-xs opacity-50">Stuck in {deal.status} for 7+ days</div>
                           </div>
                           <div className="flex items-center gap-3">
                             <span className="font-mono font-bold text-sm">${deal.amount.toLocaleString()}</span>
                             <ChevronRightIcon className="w-4 h-4 opacity-20 group-hover:opacity-100" />
                           </div>
                        </Link>
                      ))}
                   </div>
                 )}
              </div>
           </div>
        </div>

        {/* RIGHT COLUMN (1/3): The "Chase List" (Action Center) */}
        <div className="space-y-6">
           
           {/* Action Center Card - Compact Mode */}
           <div className="card bg-base-100 shadow-sm border border-base-200">
              <div className="card-body p-0">
                 <div className="p-3 border-b border-base-200 bg-base-50/50 rounded-t-xl">
                    <h3 className="font-black text-sm uppercase tracking-wide opacity-70 flex items-center gap-2">
                      <ExclamationCircleIcon className="w-4 h-4 text-secondary" /> Action Center
                    </h3>
                 </div>

                 {/* 1. Unpaid Invoices Section */}
                 <div className="p-3 border-b border-base-200">
                    <div className="text-[10px] font-bold uppercase text-base-content/40 mb-2 flex justify-between">
                       <span>Money Owed</span>
                       <span>${metrics.pendingCash.toLocaleString()}</span>
                    </div>
                    {lists.pendingInvoices.length === 0 ? (
                      <p className="text-xs text-base-content/40 italic">All invoices paid.</p>
                    ) : (
                      <div className="space-y-1">
                        {lists.pendingInvoices.slice(0, 3).map((inv: { id: Key | null | undefined; deal: { title: any; }; number: any; amount: { toLocaleString: () => string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; }; }) => (
                          <Link href={`/deals/${(inv as any).dealId || ''}?tab=invoices`} key={inv.id} className="flex justify-between items-center p-2 rounded-lg hover:bg-base-200 transition text-xs">
                             <div className="flex items-center gap-2">
                                <DocumentTextIcon className="w-3 h-3 text-warning" />
                                <span className="font-medium truncate max-w-[120px]">{inv.deal?.title || inv.number}</span>
                             </div>
                             <span className="font-mono font-bold">${inv.amount.toLocaleString()}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                 </div>

                 {/* 2. Urgent Tasks Section */}
                 <div className="p-3">
                    <div className="text-[10px] font-bold uppercase text-base-content/40 mb-2">
                       Due Today
                    </div>
                    {lists.urgentTasks.length === 0 ? (
                      <p className="text-xs text-base-content/40 italic">No urgent tasks.</p>
                    ) : (
                      <div className="space-y-1">
                        {lists.urgentTasks.map((task: { id: Key | null | undefined; title: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; deal: { title: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; }; dueDate: string | number | Date; }) => (
                          <Link href={`/tasks`} key={task.id} className="flex items-start gap-2 p-2 hover:bg-base-200 rounded-lg transition text-xs group cursor-pointer">
                             <div className="mt-1 w-1.5 h-1.5 rounded-full bg-error shrink-0"></div>
                             <div className="flex-1 min-w-0">
                               <div className="font-medium truncate">{task.title}</div>
                               {task.deal && <div className="text-[10px] opacity-50 truncate">{task.deal.title}</div>}
                             </div>
                             <div className="text-[10px] opacity-40 font-mono whitespace-nowrap self-center">
                               {new Date(task.dueDate!).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                             </div>
                          </Link>
                        ))}
                      </div>
                    )}
                 </div>
              </div>
           </div>

           {/* Activity Feed (Interactive) */}
           <div className="bg-base-100 rounded-xl border border-base-200 p-4">
              <h4 className="text-xs font-bold uppercase opacity-40 mb-3">Recent Activity</h4>
              <div className="space-y-1">
                 {lists.recentActivity.map((note: { deal: { id: any; title: string; }; contact: { id: any; name: string; }; id: Key | null | undefined; content: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; createdAt: string | number | Date; }) => {
                   // Link Logic
                   let href = "#";
                   let context = "";
                   if (note.deal) {
                     href = `/deals/${note.deal.id}?tab=notes`;
                     context = note.deal.title;
                   } else if (note.contact) {
                     href = `/contacts/${note.contact.id}`;
                     context = note.contact.name;
                   }

                   return (
                     <Link href={href} key={note.id} className="flex gap-3 text-xs hover:bg-base-50 p-2 -mx-2 rounded-lg transition-colors group">
                        <div className="w-1.5 h-1.5 rounded-full bg-base-300 mt-1.5 shrink-0 group-hover:bg-primary transition-colors"></div>
                        <div className="min-w-0">
                          <p className="line-clamp-2 text-base-content/80 group-hover:text-base-content">{note.content}</p>
                          <div className="text-[10px] opacity-40 mt-1 flex gap-1 items-center">
                             <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                             {context && (
                               <>
                                 <span>•</span>
                                 <span className="truncate max-w-[150px] font-medium">{context}</span>
                               </>
                             )}
                          </div>
                        </div>
                     </Link>
                   );
                 })}
                 {lists.recentActivity.length === 0 && <p className="text-xs opacity-40 italic">No recent notes.</p>}
              </div>
           </div>

        </div>
      </div>
    </div>
    </DashboardWrapper>
  );
}