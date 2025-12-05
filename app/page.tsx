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
  BellAlertIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  UserIcon,
  ChevronRightIcon
} from "@heroicons/react/24/solid";
import ContactCard from "./components/Contact";
import DealCard from "./components/DealCard";
import TaskCard from "./components/TaskCard";
import FinancialPulseCard from "./components/FinancialPulseCard";
import ContactListWidget from "./components/ContactListWidget";
import HomeActions from "./components/HomeActions";
import LandingPage from "./components/LandingPage";

// --- TYPES ---
type AlertType = 'CRITICAL' | 'WARNING' | 'INFO' | 'SUCCESS';

interface SmartAlert {
  id: string;
  type: AlertType;
  message: string;
  subtext?: string;
  link: string;
  icon: any;
}

async function getSmartDashboardData(userId: string) {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  // Safe aggregation helper
  const safeAggregate = async () => {
    try {
      const result = await prisma.expense.aggregate({
        where: { userId },
        _sum: { amount: true }
      });
      return result._sum.amount || 0;
    } catch (e) {
      console.error("Expense aggregation failed:", e);
      return 0;
    }
  };

  const [deals, tasks, rawContacts, rawNotes, rawExpenses, expenseTotal] = await Promise.all([
    prisma.deal.findMany({
      where: { userId },
      include: { 
        tags: true, 
        contacts: { select: { id: true, name: true, imageUrl: true } } 
      },
      orderBy: { updatedAt: 'desc' }
    }),
    prisma.task.findMany({
      where: { userId, status: { not: 'DONE' } },
      include: { deal: true },
      orderBy: { dueDate: 'asc' }
    }),
    // FIX: Include company relation to access the name
    prisma.contact.findMany({
      where: { userId },
      include: { 
        tags: true,
        company: true 
      },
      orderBy: { lastContactedAt: 'desc' }
    }),
    prisma.note.findMany({
      where: { userId },
      take: 20, 
      orderBy: { createdAt: 'desc' },
      include: { deal: true, contact: true }
    }),
    prisma.expense.findMany({
      where: { userId },
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: { deal: true }
    }),
    safeAggregate()
  ]);

  // --- 0. DATA TRANSFORMATION (Fix Type Error) ---
  const contacts = rawContacts.map(c => ({
    ...c,
    company: c.company?.name || c.companyName || null,
    tags: c.tags.map(t => ({ id: t.id, name: t.name })) 
  }));

  // --- 1. GENERATE SMART ALERTS ---
  const alerts: SmartAlert[] = [];

  // A. Urgent Tasks Logic (Overdue + Due Today)
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const urgentTasks = tasks.filter(t => {
    if (!t.dueDate) return false;
    const due = new Date(t.dueDate);
    return due <= endOfToday;
  });

  if (urgentTasks.length > 0) {
    alerts.push({
      id: 'overdue-tasks',
      type: 'CRITICAL',
      message: `You have ${urgentTasks.length} urgent tasks.`,
      subtext: "Due today or overdue.",
      link: '/tasks?filter=active',
      icon: ExclamationCircleIcon
    });
  }

  // B. Closing Soon (Info)
  const closingDeals = deals.filter(d => d.closeDate && new Date(d.closeDate) <= threeDaysFromNow && new Date(d.closeDate) >= now && d.status !== 'WON' && d.status !== 'LOST');
  if (closingDeals.length > 0) {
    alerts.push({
      id: 'closing-soon',
      type: 'INFO',
      message: `${closingDeals.length} deals scheduled to close soon.`,
      subtext: "Review them to ensure they land.",
      link: '/deals',
      icon: CalendarDaysIcon
    });
  }

  // C. Stale Deals (Warning)
  const staleDeals = deals.filter(
    d => ['NEGOTIATION', 'PENDING'].includes(d.status) && 
    new Date(d.updatedAt) < sevenDaysAgo
  );
  if (staleDeals.length > 0) {
    alerts.push({
      id: 'stale-deals',
      type: 'WARNING',
      message: `${staleDeals.length} deals are stalling.`,
      subtext: "No activity in 7+ days.",
      link: '/deals',
      icon: ClockIcon
    });
  }

  // D. Slipping Contacts (Warning)
  const slippingContacts = contacts.filter(c => 
    c.lastContactedAt && new Date(c.lastContactedAt) < fourteenDaysAgo
  ).slice(0, 3); 
  
  if (slippingContacts.length > 0) {
    alerts.push({
      id: 'slipping-contacts',
      type: 'WARNING',
      message: `${slippingContacts.length} contacts are slipping away.`,
      subtext: "Reconnect with your network.",
      link: '/contacts',
      icon: UserIcon
    });
  }

  // --- 2. CLEAN & MIX ACTIVITIES ---
  const activities = [
    ...rawNotes
      .filter(n => {
        if (n.dealId && !n.deal) return false;
        if (n.contactId && !n.contact) return false;
        if (!n.deal && !n.contact) return false;
        return true;
      })
      .map(n => ({ type: 'NOTE', date: n.createdAt, data: n, deal: n.deal })),

    ...rawExpenses
      .filter(e => {
        if (e.dealId && !e.deal) return false;
        return !!e.deal;
      })
      .map(e => ({ type: 'EXPENSE', date: e.createdAt, data: e, deal: e.deal }))
  ]
  .sort((a, b) => b.date.getTime() - a.date.getTime())
  .slice(0, 6);

  // --- 3. FINANCIALS ---
  const wonRevenue = deals.filter(d => d.status === 'WON').reduce((sum, d) => sum + d.amount, 0);
  const totalExpenses = expenseTotal;
  const netProfit = wonRevenue - totalExpenses;
  const activeDeals = deals.filter(d => ['NEGOTIATION', 'PENDING', 'OPEN'].includes(d.status));
  const pipelineValue = activeDeals.reduce((sum, d) => sum + d.amount, 0);

  // FIX: Use the transformed 'contacts' array for the active list
  const activeContacts = contacts.filter(c => c.lastContactedAt && new Date(c.lastContactedAt) >= sevenDaysAgo).slice(0, 10);

  return {
    alerts,
    activeDealsCount: activeDeals.length,
    pipelineValue,
    staleDeals, 
    activeContacts,
    activities, 
    recentDeals: deals.slice(0, 3),
    urgentTasks,
    financials: {
      revenue: wonRevenue,
      expenses: totalExpenses,
      profit: netProfit,
    }
  };
}

export default async function Home() {
  const user = await getCurrentUser();
  if (!user) return <LandingPage />

  const data = await getSmartDashboardData(user.id);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  // Helper for Alert Styling
  const getAlertStyle = (type: AlertType) => {
    switch (type) {
      case 'CRITICAL': return 'text-error';
      case 'WARNING': return 'text-warning';
      case 'INFO': return 'text-info';
      case 'SUCCESS': return 'text-success';
      default: return 'text-base-content';
    }
  };

  return (
    <div className="space-y-8 pb-24">
      
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-base-content">
            {greeting}, {user.name.split(' ')[0]}
          </h1>
          <p className="text-base-content/60 mt-1 font-medium">
            {data.alerts.length > 0 
              ? `You have ${data.alerts.length} items needing attention.` 
              : "You are all caught up. Great work!"}
          </p>
        </div>
        
        <div className="w-full md:w-auto flex justify-end">
          {/* FIX: Removed alerts prop */}
          <HomeActions />
        </div>
      </div>

      {/* 2. MAIN GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* RIGHT COLUMN (Insights) */}
        <div className="lg:col-span-4 lg:col-start-9 space-y-6">
           <FinancialPulseCard financials={data.financials} />

           <div className="card bg-base-100 shadow-sm border border-base-200">
             <div className="card-body p-5">
               <h3 className="text-xs font-bold uppercase text-base-content/40 flex items-center gap-2 mb-4 tracking-widest"><ChartBarIcon className="w-4 h-4" /> Active Pipeline</h3>
               <div className="text-2xl font-bold text-base-content mb-1">${data.pipelineValue.toLocaleString()}</div>
               <div className="text-xs text-base-content/60 mb-4">Potential value across {data.activeDealsCount} active deals</div>
               <Link href="/deals" className="btn btn-xs btn-outline w-full">Go to Pipeline</Link>
             </div>
           </div>

           {/* This widget now receives the correctly typed, flattened contact data */}
           <ContactListWidget contacts={data.activeContacts} />
        </div>

        {/* LEFT COLUMN (Main Feed) */}
        <div className="lg:col-span-8 lg:col-start-1 lg:row-start-1 space-y-6">
          
          {/* SMART ALERTS (Replaces Dropdown, displayed inline) */}
          {data.alerts.length > 0 && (
             <div className="bg-base-100 rounded-2xl border border-base-200 shadow-sm overflow-hidden">
                <div className="px-4 py-2 bg-base-200/30 border-b border-base-200 flex justify-between items-center">
                  <h3 className="font-bold text-xs uppercase tracking-widest text-base-content/60 flex items-center gap-2">
                    <BellAlertIcon className="w-4 h-4" /> Morning Briefing
                  </h3>
                  <span className="badge badge-sm badge-neutral">{data.alerts.length}</span>
                </div>
                <div className="divide-y divide-base-100">
                  {data.alerts.map((alert) => (
                    <Link href={alert.link} key={alert.id} className="flex items-center gap-4 p-4 hover:bg-base-50 transition-colors group">
                       <div className={`p-2 rounded-xl shrink-0 ${
                         alert.type === 'CRITICAL' ? 'bg-error/10 text-error' :
                         alert.type === 'WARNING' ? 'bg-warning/10 text-warning' :
                         alert.type === 'INFO' ? 'bg-info/10 text-info' :
                         'bg-success/10 text-success'
                       }`}>
                         <alert.icon className="w-5 h-5" />
                       </div>
                       <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm text-base-content group-hover:text-primary transition-colors truncate">
                            {alert.message}
                          </div>
                          <p className="text-xs text-base-content/60 truncate">{alert.subtext}</p>
                       </div>
                       <ChevronRightIcon className="w-5 h-5 text-base-content/20 group-hover:text-primary self-center transition-colors" />
                    </Link>
                  ))}
                </div>
             </div>
          )}

          {/* TASKS */}
          <div>
             <div className="flex justify-between items-center px-1 mb-2">
               <h3 className="font-bold text-sm text-base-content/70">Upcoming Tasks</h3>
               <Link href="/tasks" className="text-xs link link-hover opacity-50">View All</Link>
             </div>
             <div className="space-y-2">
               {data.urgentTasks?.length === 0 ? (
                 <div className="text-center py-8 border border-dashed border-base-300 rounded-xl text-xs opacity-50">No pending tasks</div>
               ) : (
                 data.urgentTasks?.map(task => <TaskCard key={task.id} task={task} />)
               )}
             </div>
          </div>

          {/* ACTIVITY FEED */}
          <div>
             <h3 className="font-bold text-sm text-base-content/70 px-1 mb-2">Recent Activity</h3>
             <div className="bg-base-100 rounded-xl border border-base-200 shadow-sm divide-y divide-base-100">
                {data.activities.length === 0 && <div className="p-6 text-center text-xs opacity-50">No recent activity</div>}
                {data.activities.map((activity, i) => {
                   const isNote = activity.type === 'NOTE';
                   const noteData = isNote ? activity.data as any : null;
                   const expData = !isNote ? activity.data as any : null;
                   const linkHref = activity.deal ? `/deals/${activity.deal.id}` : (isNote && noteData.contact ? `/contacts/${noteData.contact.id}` : '#');

                   return (
                     <Link key={i} href={linkHref} className={`p-3 flex gap-3 items-start hover:bg-base-50 transition-colors`}>
                        <div className={`mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${isNote ? 'bg-primary' : 'bg-error'}`}></div>
                        <div className="flex-1 min-w-0">
                           <p className="text-sm line-clamp-2">{isNote ? noteData.content : `Expense: ${expData.description} (-$${expData.amount})`}</p>
                           <div className="text-[10px] opacity-40 mt-1 flex gap-2">
                              <span>{new Date(activity.date).toLocaleDateString()}</span>
                              {activity.deal && <span>• {activity.deal.title}</span>}
                           </div>
                        </div>
                     </Link>
                   )
                })}
             </div>
          </div>

           {data.staleDeals.length > 0 && (
             <div className="bg-base-100 rounded-xl border border-warning/30 shadow-sm p-4">
                <h3 className="text-xs font-bold text-warning uppercase flex items-center gap-2 mb-3">
                   <ClockIcon className="w-4 h-4" /> Needs Attention
                </h3>
                <div className="space-y-2">
                  {data.staleDeals.map(deal => (
                     <Link href={`/deals/${deal.id}`} key={deal.id} className="block p-2 bg-base-200/50 rounded-lg hover:bg-base-200 transition-colors">
                        <div className="font-bold text-sm truncate">{deal.title}</div>
                        <div className="text-[10px] opacity-50">Last update: {new Date(deal.updatedAt).toLocaleDateString()}</div>
                     </Link>
                  ))}
                </div>
             </div>
           )}
        </div>

      </div>
    </div>
  );
}