import { getCurrentUser } from "@/lib/currentUser";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { 
  PlusIcon, 
  ExclamationCircleIcon,
  ClockIcon,
  FireIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BanknotesIcon,
  UserIcon,
  ChevronRightIcon
} from "@heroicons/react/24/solid";
import ContactCard from "./components/Contact";
import DealCard from "./components/DealCard";
import TaskCard from "./components/TaskCard";

async function getSmartDashboardData(userId: string) {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Fetch contacts sorted by interaction time
  // FIX: Removed any conflicting 'select' and 'include'
  const [deals, tasks, activeContacts, rawNotes, rawExpenses, expenseStats] = await Promise.all([
    prisma.deal.findMany({ 
      where: { userId }, 
      include: { 
        tags: true, 
        // Valid nested select within include
        contacts: { 
          select: { 
            id: true, 
            name: true, 
            imageUrl: true,
            jobTitle: true, // Added context fields
            company: true 
          } 
        } 
      }, 
      orderBy: { updatedAt: 'desc' } 
    }),
    prisma.task.findMany({ 
      where: { userId, status: { not: 'DONE' } }, 
      include: { deal: true }, 
      orderBy: { dueDate: 'asc' } 
    }),
    
    // SMART LIST: Fetch 10 most recently contacted people
    // FIX: Pure 'include' here. No 'select' to avoid conflicts.
    prisma.contact.findMany({
      where: { userId, lastContactedAt: { gte: sevenDaysAgo } },
      include: { tags: true },
      orderBy: { lastContactedAt: 'desc' },
      take: 10
    }),
    
    prisma.note.findMany({
      where: { userId, OR: [{ deal: { isNot: null } }, { contact: { isNot: null } }] },
      take: 6, orderBy: { createdAt: 'desc' }, include: { deal: true, contact: true }
    }),
    prisma.expense.findMany({
      where: { userId, deal: { isNot: null } },
      take: 6, orderBy: { createdAt: 'desc' }, include: { deal: true }
    }),
    prisma.expense.aggregate({ where: { userId }, _sum: { amount: true } })
  ]);

  const activities = [
    ...rawNotes.map(n => ({ type: 'NOTE', date: n.createdAt, data: n, deal: n.deal })),
    ...rawExpenses.map(e => ({ type: 'EXPENSE', date: e.createdAt, data: e, deal: e.deal }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 6);

  const staleDeals = deals.filter(d => ['NEGOTIATION', 'PENDING'].includes(d.status) && new Date(d.updatedAt) < sevenDaysAgo);
  const urgentTasks = tasks.filter(t => {
    if (!t.dueDate) return false;
    const due = new Date(t.dueDate);
    return due <= now || due.toDateString() === now.toDateString();
  });

  const wonRevenue = deals.filter(d => d.status === 'WON').reduce((sum, d) => sum + d.amount, 0);
  const totalExpenses = expenseStats._sum.amount || 0;
  const netProfit = wonRevenue - totalExpenses;
  const activeDeals = deals.filter(d => ['NEGOTIATION', 'PENDING', 'OPEN'].includes(d.status));
  const pipelineValue = activeDeals.reduce((sum, d) => sum + d.amount, 0);

  return {
    activeDealsCount: activeDeals.length,
    pipelineValue,
    staleDeals,
    urgentTasks,
    activeContacts,
    activities, 
    financials: {
      revenue: wonRevenue,
      expenses: totalExpenses,
      profit: netProfit,
    }
  };
}

export default async function Home() {
  const user = await getCurrentUser();
  if (!user) return <div className="p-8 text-center text-gray-500">Please sign in to access your smart dashboard.</div>;

  const data = await getSmartDashboardData(user.id);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-base-content">
            {greeting}, {user.name.split(' ')[0]}
          </h1>
          <p className="text-base-content/60 mt-1 font-medium">
            Here's what's happening with your business today.
          </p>
        </div>
        <div className="flex gap-2">
           <Link href="/deals" className="btn btn-primary btn-sm gap-2 shadow-lg">
             <PlusIcon className="w-4 h-4" /> New Deal
           </Link>
           <Link href="/tasks" className="btn btn-neutral btn-sm gap-2">
             <PlusIcon className="w-4 h-4" /> New Task
           </Link>
        </div>
      </div>

      <div className="card bg-base-100 shadow-md border border-base-200">
        <div className="card-body p-6">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="flex-1 w-full text-center lg:text-left border-b lg:border-b-0 lg:border-r border-base-200 pb-4 lg:pb-0 lg:pr-6">
              <div className="text-sm font-bold uppercase text-base-content/40 tracking-wider flex items-center justify-center lg:justify-start gap-2 mb-1">
                <BanknotesIcon className="w-4 h-4" /> Net Profit
              </div>
              <div className={`text-4xl font-black tracking-tight ${data.financials.profit >= 0 ? 'text-success' : 'text-error'}`}>
                {data.financials.profit >= 0 ? '+' : '-'}${Math.abs(data.financials.profit).toLocaleString()}
              </div>
              <div className="mt-2 text-sm font-medium">
                {data.financials.profit >= 0 ? (
                  <span className="text-success bg-success/10 px-2 py-1 rounded-full inline-flex items-center gap-1"><ArrowTrendingUpIcon className="w-3 h-3" /> Profitable</span>
                ) : (
                  <span className="text-error bg-error/10 px-2 py-1 rounded-full inline-flex items-center gap-1"><ArrowTrendingDownIcon className="w-3 h-3" /> Burning Cash</span>
                )}
              </div>
            </div>
            <div className="flex-1 w-full grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-xs uppercase font-bold text-base-content/40 mb-1">Revenue</div>
                <div className="text-xl font-bold text-base-content">${data.financials.revenue.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs uppercase font-bold text-base-content/40 mb-1">Expenses</div>
                <div className="text-xl font-bold text-error">${data.financials.expenses.toLocaleString()}</div>
              </div>
            </div>
            <div className="flex-none w-full lg:w-auto">
              <Link href="/finance" className="btn btn-outline btn-block lg:btn-wide group">
                Financial Dashboard <ChevronRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {data.urgentTasks.length > 0 ? (
            <div className="card bg-base-100 shadow-sm border border-error/20 ring-1 ring-error/5">
              <div className="card-body p-5">
                <h2 className="text-xs font-bold uppercase text-error flex items-center gap-2 mb-3 tracking-wider">
                  <ExclamationCircleIcon className="w-4 h-4" /> Urgent Tasks
                </h2>
                <div className="space-y-2">
                  {data.urgentTasks.slice(0, 3).map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
                {data.urgentTasks.length > 3 && <Link href="/tasks" className="text-center text-xs text-base-content/50 mt-2">+ {data.urgentTasks.length - 3} more</Link>}
              </div>
            </div>
          ) : (
            <div className="card bg-base-100 shadow-sm border border-base-200">
               <div className="card-body p-6 flex flex-row items-center gap-4">
                  <div className="p-3 bg-success/10 text-success rounded-full"><ClockIcon className="w-6 h-6" /></div>
                  <div><h3 className="font-bold">All caught up!</h3><p className="text-xs opacity-60">No overdue tasks.</p></div>
               </div>
            </div>
          )}

          {/* ACTIVITY FEED */}
          <div>
             <h3 className="font-bold text-lg flex items-center gap-2 px-1 mb-4 text-base-content">
               <ChatBubbleLeftRightIcon className="w-5 h-5 text-base-content/40" /> Recent Activity
             </h3>
             {data.activities.length === 0 ? (
               <div className="text-center py-10 border border-dashed border-base-300 rounded-xl text-sm text-base-content/40">No recent activity.</div>
             ) : (
               <div className="bg-base-100 rounded-2xl shadow-sm border border-base-200 divide-y divide-base-100 overflow-hidden">
                 {data.activities.map((activity, i) => {
                   const isNote = activity.type === 'NOTE';
                   const noteData = isNote ? activity.data as any : null;
                   const expenseData = !isNote ? activity.data as any : null;
                   const linkHref = activity.deal ? `/deals/${activity.deal.id}` : (isNote && noteData.contact ? `/contacts/${noteData.contact.id}` : '#');
                   
                   return (
                     <Link key={i} href={linkHref} className={`p-4 flex gap-4 ${linkHref !== '#' ? 'hover:bg-base-50' : ''}`}>
                        <div className="mt-1">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isNote ? 'bg-primary/10 text-primary' : 'bg-error/10 text-error'}`}>
                             {isNote ? <ChatBubbleLeftRightIcon className="w-4 h-4" /> : <BanknotesIcon className="w-4 h-4" />}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                             <span className={`text-[10px] font-bold uppercase ${isNote ? 'text-primary' : 'text-error'}`}>{isNote ? 'New Note' : 'Expense'}</span>
                             <span className="text-[10px] opacity-40">{new Date(activity.date).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm font-medium mt-0.5 line-clamp-1">{isNote ? noteData.content : `${expenseData.description} (-$${expenseData.amount})`}</p>
                          {activity.deal && <div className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-base-200 text-[10px] font-bold opacity-60"><span className="truncate">Deal: {activity.deal.title}</span></div>}
                        </div>
                     </Link>
                   );
                 })}
               </div>
             )}
          </div>
        </div>

        <div className="space-y-8">
           <div className="card bg-base-100 shadow-sm border border-base-200">
             <div className="card-body p-5">
               <h3 className="text-xs font-bold uppercase text-base-content/40 flex items-center gap-2 mb-4 tracking-widest"><ChartBarIcon className="w-4 h-4" /> Active Pipeline</h3>
               <div className="text-2xl font-bold text-base-content mb-1">${data.pipelineValue.toLocaleString()}</div>
               <div className="text-xs text-base-content/60 mb-4">Potential value across {data.activeDealsCount} active deals</div>
               <Link href="/deals" className="btn btn-xs btn-outline w-full">Go to Pipeline</Link>
             </div>
           </div>

           {/* RECENTLY ACTIVE CONTACTS (Replaces Manual Hot Leads) */}
           <div>
             <div className="flex items-center justify-between px-1 mb-3">
                <div className="flex items-center gap-2">
                  <FireIcon className="w-4 h-4 text-orange-500" />
                  <h3 className="font-bold text-xs uppercase text-base-content/50 tracking-wider">Recently Active</h3>
                </div>
                <Link href="/contacts" className="text-[10px] link link-hover text-base-content/40">View All</Link>
             </div>
             {data.activeContacts.length === 0 ? (
               <div className="p-6 bg-base-200/50 border border-dashed border-base-300 rounded-xl text-center">
                 <p className="text-base-content/40 text-xs">No recent interactions.</p>
               </div>
             ) : (
               <div className="flex gap-3 overflow-x-auto pb-4 pt-1 no-scrollbar snap-x">
                 {data.activeContacts.map(contact => (
                    <div key={contact.id} className="snap-start shrink-0">
                      <ContactCard contact={{...contact, imageUrl: contact.imageUrl, tags: contact.tags.map(t => t.name)}} />
                    </div>
                 ))}
               </div>
             )}
           </div>
           
           {data.staleDeals.length > 0 && (
             <div className="card bg-base-100 shadow-sm border border-warning/30">
               <div className="card-body p-5">
                 <h2 className="text-xs font-bold uppercase text-warning flex items-center gap-2 mb-4"><ClockIcon className="w-4 h-4" /> Stalling Deals</h2>
                 <div className="space-y-2">
                   {data.staleDeals.map(deal => (
                     <DealCard key={deal.id} deal={{...deal, contacts: deal.contacts.map(c => ({ id: c.id, name: c.name, imageUrl: c.imageUrl || undefined }))}} />
                   ))}
                 </div>
               </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}