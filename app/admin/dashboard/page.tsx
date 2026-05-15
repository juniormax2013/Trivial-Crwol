'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  LineChart, 
  HelpCircle, 
  Layers, 
  Users, 
  Gamepad2, 
  Trophy, 
  Medal, 
  Gavel, 
  BookOpen, 
  Settings,
  Search,
  Bell,
  Download as DownloadIcon,
  Zap,
  CheckCircle2,
  Hourglass,
  AlertTriangle,
  Pencil,
  ArrowRight,
  GraduationCap,
  Loader2,
  LogOut
} from 'lucide-react';
import { 
  getDashboardMetrics, 
  getUserGrowthData, 
  getDailyChallengeGrowth,
  getRecentActivity, 
  DashboardMetrics, 
  GrowthDataPoint 
} from '@/lib/admin/analytics';
import { AdminGuard } from '@/components/auth/AdminGuard';
import { useAuthContext } from '@/components/auth/AuthProvider';


export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [growthData, setGrowthData] = useState<GrowthDataPoint[]>([]);
  const [dcGrowthData, setDcGrowthData] = useState<GrowthDataPoint[]>([]);
  const [activeChart, setActiveChart] = useState<'users' | 'challenges'>('users');
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { user, signOut } = useAuthContext();

  useEffect(() => {
    async function fetchData() {
      try {
        const [m, g, d, a] = await Promise.all([
          getDashboardMetrics(),
          getUserGrowthData(),
          getDailyChallengeGrowth(),
          getRecentActivity()
        ]);
        setMetrics(m);
        setGrowthData(g);
        setDcGrowthData(d);
        setRecentActivity(a);
      } catch (error) {
        console.error("Dashboard initialization failed. Check individual query errors in console.", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <AdminGuard>
      <div className="bg-[#f5f3f7] text-[#1b1b1e] min-h-screen font-sans selection:bg-[#eddcff]">
      
      {/* SideNavBar Shell */}
      <aside className="h-screen w-64 fixed left-0 top-0 border-r border-[#1b1b1e]/5 bg-[#faf9fc] flex flex-col py-6 gap-2 z-50 shadow-[4px_0_24px_rgba(49,0,101,0.02)]">
        <div className="mb-6 px-6">
          <h1 className="font-serif text-[22px] font-black text-[#310065] tracking-tight">Kingdom Panel</h1>
          <p className="text-[10px] font-bold text-[#7c7483] uppercase tracking-widest mt-1">Ecclesiastical Oversight</p>
        </div>
        
        <nav className="flex flex-col gap-1 overflow-y-auto px-4 flex-1">
          {/* Active State: Analytics */}
          <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-[#310065] bg-[#310065]/5 font-bold text-[13px] relative overflow-hidden group">
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#cba72f] rounded-l-full"></div>
            <LineChart className="w-5 h-5" strokeWidth={2.5} />
            Analytics
          </Link>
          
          <Link href="/admin/dashboard/questions" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-[#7c7483] hover:text-[#310065] hover:bg-[#310065]/5 font-semibold text-[13px]">
            <HelpCircle className="w-5 h-5" strokeWidth={2} />
            Questions
          </Link>
          
          <Link href="/admin/dashboard/categories" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-[#7c7483] hover:text-[#310065] hover:bg-[#310065]/5 font-semibold text-[13px]">
            <Layers className="w-5 h-5" strokeWidth={2} />
            Categories
          </Link>
          
          <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-[#7c7483] hover:text-[#310065] hover:bg-[#310065]/5 font-semibold text-[13px]">
            <Users className="w-5 h-5" strokeWidth={2} />
            Users
          </Link>
          
          <Link href="/admin/dashboard/game-engine" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-[#7c7483] hover:text-[#310065] hover:bg-[#310065]/5 font-semibold text-[13px]">
            <Gamepad2 className="w-5 h-5" strokeWidth={2} />
            Game Engine
          </Link>
          
          <Link href="/admin/dashboard/tournaments" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-[#7c7483] hover:text-[#310065] hover:bg-[#310065]/5 font-semibold text-[13px]">
            <Trophy className="w-5 h-5" strokeWidth={2} />
            Tournaments
          </Link>

          <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-[#7c7483] hover:text-[#310065] hover:bg-[#310065]/5 font-semibold text-[13px]">
            <Medal className="w-5 h-5" strokeWidth={2} />
            Rewards
          </Link>

          <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-[#7c7483] hover:text-[#310065] hover:bg-[#310065]/5 font-semibold text-[13px]">
            <Gavel className="w-5 h-5" strokeWidth={2} />
            Moderation
          </Link>

          <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-[#7c7483] hover:text-[#310065] hover:bg-[#310065]/5 font-semibold text-[13px]">
            <BookOpen className="w-5 h-5" strokeWidth={2} />
            Spiritual Content
          </Link>

          <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-[#7c7483] hover:text-[#310065] hover:bg-[#310065]/5 font-semibold text-[13px] mt-4">
            <Settings className="w-5 h-5" strokeWidth={2} />
            Settings
          </Link>
        </nav>
        
        <div className="mt-auto pt-6 border-t border-[#1b1b1e]/5">
          <div className="flex items-center gap-3 px-6">
            <div className="h-10 w-10 rounded-full border-2 border-[#1b1b1e]/5 overflow-hidden bg-[#f5f3f7] flex items-center justify-center">
              {user?.photoURL ? (
                <Image 
                  src={user.photoURL}
                  alt="Administrator Avatar"
                  width={40} height={40}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Users className="w-5 h-5 text-[#cdc3d4]" />
              )}
            </div>
            <div>
              <p className="text-[13px] font-bold text-[#310065] truncate max-w-[140px]">
                {user?.fullName || 'Admin Profile'}
              </p>
              <p className="text-[11px] font-medium text-[#7c7483] capitalize">
                {(user?.role || 'Master Overseer').replace('_', ' ')}
              </p>
            </div>
          </div>
          <button 
            onClick={() => signOut()}
            className="mt-4 mx-6 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all font-bold text-[12px] group"
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Cerrar Sesión Real
          </button>
        </div>
      </aside>

      {/* Main Canvas */}
      <main className="ml-64 min-h-screen pb-12">
        {/* TopNavBar Shell */}
        <header className="bg-[#faf9fc]/80 backdrop-blur-2xl flex justify-between items-center w-full px-10 py-5 sticky top-0 z-40 border-b border-[#1b1b1e]/5">
          <div className="flex items-center gap-4">
            <h2 className="font-serif text-[22px] font-black text-[#310065] tracking-tight">Main Dashboard</h2>
            <div className="px-3 py-1 bg-[#fff9e6] border border-[#e9c349]/30 rounded-full flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#cba72f] animate-pulse"></span>
              <span className="text-[9px] font-black tracking-widest text-[#735c00] uppercase">SYSTEM LIVE</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative flex items-center bg-white rounded-full px-4 py-2.5 border border-[#1b1b1e]/5 shadow-sm w-80 focus-within:ring-2 focus-within:ring-[#310065]/20 focus-within:border-[#310065]/10 transition-all">
              <Search className="w-4 h-4 text-[#7c7483]" strokeWidth={2.5} />
              <input 
                type="text" 
                placeholder="Search archives or players..." 
                className="bg-transparent border-none focus:outline-none focus:ring-0 text-[13px] w-full ml-3 placeholder:text-[#cdc3d4] font-medium text-[#1b1b1e]" 
              />
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-2.5 rounded-full hover:bg-[#310065]/5 transition-colors text-[#310065]">
                <Bell className="w-5 h-5" strokeWidth={2.5} />
                <span className="absolute top-2.5 right-2 w-2.5 h-2.5 bg-[#ba1a1a] rounded-full border-2 border-[#faf9fc]"></span>
              </button>
              <button className="p-2.5 rounded-full bg-[#310065] text-white hover:bg-[#4a148c] transition-colors">
                <HelpCircle className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="px-10 mt-10">
          
          {/* Header Section */}
          <div className="flex justify-between items-end mb-8">
            <div>
              <h3 className="text-[32px] font-serif font-black text-[#310065] leading-none mb-2">Ecclesiastical Metrics</h3>
              <p className="text-[#4a4452] font-medium text-[15px]">Real-time oversight of the Bible Crown kingdom activity.</p>
            </div>
            <div className="flex gap-3">
              <button className="bg-white border border-[#1b1b1e]/10 px-5 py-2.5 rounded-xl text-[14px] font-bold flex items-center gap-2 hover:bg-[#f5f3f7] transition-colors shadow-sm active:scale-[0.98]">
                <DownloadIcon className="w-4 h-4" strokeWidth={2.5} />
                Export Report
              </button>
              <button className="bg-gradient-to-r from-[#310065] to-[#4a148c] text-white px-6 py-2.5 rounded-xl text-[14px] font-bold shadow-[0_4px_14px_rgba(49,0,101,0.25)] hover:shadow-[0_6px_20px_rgba(49,0,101,0.3)] transition-all active:scale-[0.98]">
                Update Registry
              </button>
            </div>
          </div>

          {/* Bento Grid of Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-5">
            
            {/* Large Stats Card: Total Users */}
            <div className="lg:col-span-4 bg-white p-7 rounded-[1.5rem] shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#1b1b1e]/5 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[#4a4452] font-semibold text-[13px]">Total Registered Users</p>
                  <h4 className="text-[36px] font-serif font-black text-[#310065] mt-1 tracking-tight">
                    {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : formatNumber(metrics?.totalUsers || 0)}
                  </h4>
                </div>
                <div className="bg-[#f5f3f7] p-3.5 rounded-[1rem]">
                  <Users className="w-6 h-6 text-[#310065]" strokeWidth={2.5} />
                </div>
              </div>
              <div className="mt-8 flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#059669] bg-[#ecfdf5] px-2.5 py-1 rounded-lg">+12% from last month</span>
                <span className="text-[11px] text-[#7c7483] font-medium">vs 1.1M avg.</span>
              </div>
            </div>

            {/* Large Stats Card: DAU */}
            <div className="lg:col-span-4 bg-white p-7 rounded-[1.5rem] shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#1b1b1e]/5 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[#4a4452] font-semibold text-[13px]">Daily Active Users (DAU)</p>
                  <h4 className="text-[36px] font-serif font-black text-[#310065] mt-1 tracking-tight">
                    {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : formatNumber(metrics?.dau || 0)}
                  </h4>
                </div>
                <div className="bg-[#fff9e6] p-3.5 rounded-[1rem]">
                  <Zap className="w-6 h-6 text-[#cba72f] fill-[#cba72f]" strokeWidth={1.5} />
                </div>
              </div>
              <div className="mt-8 flex items-center gap-3">
                <div className="flex -space-x-2.5">
                  <Image src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTOvJxB8DrURToCtG_xfI1WIGXa95sRRgZlCfgGBVt8xTTM_XkLvf8xQWXCiqbyalUGchxbIBjTA1GmC8KFVuE81Zts7tYJSQ2qCxz_Y99GCNEzuI85rkQ0U8udww_s2VdDhh6zDW2jLzLkfJ51PjQoFKKmSgPjYy4crs__TQScCrDS050xlbIpfBMCB450KDHsygqjlp0EFKnHm8kx7FE4IlEGa6sCWNidFxegSm5JyjEJoVPdx52SYw-2zEUeNVB62FX6BWcQEs" width={28} height={28} alt="User" className="rounded-full border-2 border-white object-cover shadow-sm bg-[#e3e2e6]" />
                  <Image src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5zS6ba3w6-zEbpSigwV--b6J-HTouHbprQ7sUid5FVMqI2ADJL5MHnymVbJFLYByPpBeK-Af0X48moxuY650TNRuUqpmA60je98aTwur-pVX14nCvcCNLtTBtfd7024VeuNruOlJqT6scfOX-d2HIyXwndT0cAMlX2T1Gve6bb4aALXcBh0wT7bGS0nbUqUgZOqO8eF7PT_w1q3EvSJwdDNBxB09PEK0yM53T3-7IIdhhYAGqsd2ckF7EgCixUJ0G4Ja1qzOHILE" width={28} height={28} alt="User" className="rounded-full border-2 border-white object-cover shadow-sm bg-[#e3e2e6]" />
                  <Image src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzEI6xYs1zAX-8Ztd1CHa06h0ajW61uUkJUF4GEggOeZofM-gyk-3sPJZOzFO-sQvJIy5xKat8EmOChgd5uWHE5OPK5YOZednsnKW9V4hE-IOaEqwaTJ_3ukvlIR4ccK0OHEfRul8cQda5swHgvJ0cr4OIqUSuUIpmZkjHJwKv5i3dKH9U1m8quwIuMIaPBQhZAZLPUJe4QbvIROuWWydNuVcWytY_AdqOdSr_XmMNFc13Iww18zfSk_3i_BFbfJTjv-67Ff_Pmuo" width={28} height={28} alt="User" className="rounded-full border-2 border-white object-cover shadow-sm bg-[#e3e2e6]" />
                </div>
                <span className="text-[11px] text-[#7c7483] font-semibold">Live interaction trending high</span>
              </div>
            </div>

            {/* High Activity Card */}
            <div className="lg:col-span-4 bg-gradient-to-r from-[#310065] to-[#4a148c] text-white p-7 rounded-[1.5rem] shadow-[0_8px_24px_rgba(49,0,101,0.25)] relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-[#d7baff]/90 font-medium text-[13px]">Games Played Today</p>
                  <h4 className="text-[36px] font-serif font-black mt-1 tracking-tight">
                    {loading ? <Loader2 className="w-8 h-8 animate-spin" /> : formatNumber(metrics?.gamesToday || 0)}
                  </h4>
                </div>
                <div className="bg-white/10 p-3.5 rounded-[1rem] backdrop-blur-md border border-white/10">
                  <Gamepad2 className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
              </div>
              <div className="mt-8 relative z-10">
                <div className="w-full bg-black/20 rounded-full h-[6px] overflow-hidden backdrop-blur-sm">
                  <div className="bg-[#e9c349] h-full w-[85%] shadow-[0_0_10px_rgba(233,195,73,0.8)] rounded-full"></div>
                </div>
                <p className="text-[11px] mt-2.5 text-[#d7baff]/90 font-medium">85% of daily capacity reached</p>
              </div>
            </div>

            {/* Secondary Small Stats Row */}
            <div className="lg:col-span-3 bg-white p-5 rounded-[1.25rem] border border-[#1b1b1e]/5 shadow-[0_2px_10px_rgba(0,0,0,0.015)]">
              <p className="text-[#7c7483] font-bold text-[10px] uppercase tracking-widest">Active Questions</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[24px] font-serif font-black text-[#310065]">
                  {loading ? '...' : formatNumber(metrics?.activeQuestions || 0)}
                </span>
                <div className="h-8 w-8 rounded-lg bg-[#ecfdf5] text-[#059669] flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-3 bg-white p-5 rounded-[1.25rem] border border-[#1b1b1e]/5 shadow-[0_2px_10px_rgba(0,0,0,0.015)]">
              <p className="text-[#7c7483] font-bold text-[10px] uppercase tracking-widest">Pending Review</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[24px] font-serif font-black text-[#310065]">
                  {loading ? '...' : formatNumber(metrics?.pendingReview || 0)}
                </span>
                <div className="h-8 w-8 rounded-lg bg-[#fffbeb] text-[#d97706] flex items-center justify-center">
                  <Hourglass className="w-4 h-4" strokeWidth={2.5} />
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-3 bg-white p-5 rounded-[1.25rem] border border-[#1b1b1e]/5 shadow-[0_2px_10px_rgba(0,0,0,0.015)]">
              <p className="text-[#7c7483] font-bold text-[10px] uppercase tracking-widest">Open Reports</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[24px] font-serif font-black text-[#310065]">
                  {loading ? '...' : formatNumber(metrics?.openReports || 0)}
                </span>
                <div className="h-8 w-8 rounded-lg bg-[#fef2f2] text-[#dc2626] flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" strokeWidth={2.5} />
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-3 bg-white p-5 rounded-[1.25rem] border border-[#1b1b1e]/5 shadow-[0_2px_10px_rgba(0,0,0,0.015)]">
              <p className="text-[#7c7483] font-bold text-[10px] uppercase tracking-widest">Active Tournaments</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[24px] font-serif font-black text-[#310065]">
                  {loading ? '...' : formatNumber(metrics?.activeTournaments || 0)}
                </span>
                <div className="h-8 w-8 rounded-lg bg-[#f5f3f7] text-[#310065] flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-[#310065]" strokeWidth={2.5} />
                </div>
              </div>
            </div>

            {/* SECCIÓN DE ECONOMÍA Y RENDIMIENTO */}
            <div className="lg:col-span-12 mt-4 grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white/40 backdrop-blur-md p-6 rounded-[1.5rem] border border-[#1b1b1e]/5 shadow-sm flex flex-col justify-between group">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[#7c7483] font-bold text-[10px] uppercase tracking-widest">Total XP Distributed</p>
                    <h5 className="text-[28px] font-serif font-black text-[#310065] mt-1">
                      {loading ? '...' : formatNumber(metrics?.totalXPAwarded || 0)}
                    </h5>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-[#f5f3ff] text-[#7c3aed] flex items-center justify-center">
                    <Zap className="w-5 h-5 fill-[#7c3aed]" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-[#ecfdf5] text-[#059669] rounded-md">Balanced</span>
                  <span className="text-[11px] text-[#7c7483] font-medium">Distribution logic active</span>
                </div>
              </div>

              <div className="bg-white/40 backdrop-blur-md p-6 rounded-[1.5rem] border border-[#1b1b1e]/5 shadow-sm flex flex-col justify-between group">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[#7c7483] font-bold text-[10px] uppercase tracking-widest">Total Coins Issued</p>
                    <h5 className="text-[28px] font-serif font-black text-[#310065] mt-1">
                      {loading ? '...' : formatNumber(metrics?.totalCoinsAwarded || 0)}
                    </h5>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-[#fff9e6] text-[#cba72f] flex items-center justify-center">
                    <Medal className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                   <div className="px-2 py-0.5 bg-[#fefce8] text-[#854d0e] text-[10px] font-bold rounded-lg border border-[#854d0e]/10">Stable</div>
                  <span className="text-[11px] text-[#7c7483] font-medium">Liquidity monitored</span>
                </div>
              </div>

              <div className="bg-white/40 backdrop-blur-md p-6 rounded-[1.5rem] border border-[#1b1b1e]/5 shadow-sm flex flex-col justify-between group">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[#7c7483] font-bold text-[10px] uppercase tracking-widest">Participation Rate</p>
                    <h5 className="text-[28px] font-serif font-black text-[#310065] mt-1">
                      {loading ? '...' : (metrics?.challengeCompletionRate || 0)}%
                    </h5>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-[#ecfdf5] text-[#059669] flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-[#f5f3f7] h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-[#059669] to-[#34d399] h-full transition-all"
                      style={{ width: `${metrics?.challengeCompletionRate || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart Section: User Growth */}
            <div className="lg:col-span-8 bg-white p-7 rounded-[1.5rem] shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#1b1b1e]/5">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h5 className="font-serif font-black text-[18px] text-[#310065]">Growth & Engagement</h5>
                  <p className="text-[12px] text-[#7c7483] font-medium mt-0.5">Performance tracking over the last 7 cycles</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setActiveChart('users')}
                    className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${activeChart === 'users' ? 'bg-[#310065] text-white shadow-md' : 'bg-[#f5f3f7] text-[#7c7483] hover:bg-[#310065]/5'}`}
                  >
                    User Growth
                  </button>
                  <button 
                    onClick={() => setActiveChart('challenges')}
                    className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${activeChart === 'challenges' ? 'bg-[#310065] text-white shadow-md' : 'bg-[#f5f3f7] text-[#7c7483] hover:bg-[#310065]/5'}`}
                  >
                    Challenge Engagement
                  </button>
                </div>
              </div>
              
              <div className="h-[220px] flex items-end gap-3 px-4">
                {loading ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader2 className="w-12 h-12 animate-spin text-[#310065]/20" />
                  </div>
                ) : (
                  (activeChart === 'users' ? growthData : dcGrowthData).map((point) => (
                    <div key={point.day} className="flex-1 flex flex-col items-center gap-3 group h-full justify-end relative">
                      {point.isPeak && (
                        <div className="absolute top-[8%] -translate-y-full bg-[#1b1b1e] text-white text-[10px] py-1 px-2.5 rounded-lg font-bold shadow-md z-10">Peak</div>
                      )}
                      <div 
                        className={`w-[80%] rounded-t-[0.5rem] transition-all cursor-pointer ${point.isPeak ? (activeChart === 'users' ? 'bg-[#310065]' : 'bg-[#059669]') + ' shadow-[0_-4px_12px_rgba(0,0,0,0.1)]' : 'bg-[#e3e2e6] group-hover:bg-[#d7baff]'}`}
                        style={{ height: `${Math.max(5, (point.count / (Math.max(...(activeChart === 'users' ? growthData : dcGrowthData).map(d => d.count)) || 1)) * 95)}%` }}
                        title={`${point.count} ${activeChart === 'users' ? 'new users' : 'completions'}`}
                      ></div>
                      <span className={`text-[10px] font-bold ${point.isPeak ? (activeChart === 'users' ? 'text-[#310065]' : 'text-[#059669]') : 'text-[#7c7483]'}`}>{point.day}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Featured Summary Sideboard */}
            <div className="lg:col-span-4 flex flex-col gap-5">
              
              {/* Most Played Category */}
              <div className="bg-white p-6 rounded-[1.5rem] shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#1b1b1e]/5 relative overflow-hidden flex-1 flex flex-col justify-center">
                <div className="absolute -right-6 -top-6 w-32 h-32 bg-[#cba72f]/10 rounded-full blur-2xl"></div>
                <p className="text-[#4a4452] font-semibold text-[13px]">Most Played Category</p>
                <div className="mt-4 flex items-center gap-4">
                  <div className="h-[60px] w-[60px] bg-[#e9c349] text-[#735c00] rounded-2xl flex items-center justify-center shadow-[0_4px_12px_rgba(233,195,73,0.3)]">
                    <BookOpen className="w-8 h-8 fill-[#735c00]" strokeWidth={1} />
                  </div>
                  <div>
                    <h6 className="text-[20px] font-black text-[#310065]">The Epistles</h6>
                    <p className="text-[13px] text-[#735c00] font-bold">42,000+ Runs</p>
                  </div>
                </div>
                <div className="mt-5">
                  <span className="px-3 py-1.5 bg-[#fff9e6] text-[#735c00] border border-[#cba72f]/20 text-[9px] font-black rounded-full uppercase tracking-widest">Global Favorite</span>
                </div>
              </div>
              
              {/* Global Accuracy Rate */}
              <div className="bg-white p-6 rounded-[1.5rem] shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#1b1b1e]/5 flex-1 flex flex-col justify-center">
                <p className="text-[#4a4452] font-semibold text-[13px]">Global Accuracy Rate</p>
                <div className="mt-2 flex items-center justify-between">
                  <div>
                    <h6 className="text-[40px] font-serif font-black text-[#310065] leading-none">
                      {loading ? '...' : (metrics?.globalAccuracy || 0)}<span className="text-[20px] text-[#7c7483]">%</span>
                    </h6>
                    <p className="text-[11px] text-[#7c7483] mt-1.5 font-medium">Standard theological proficiency</p>
                  </div>
                  {/* Circular Progress Simulation */}
                  <div className="relative h-[72px] w-[72px]">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                      <path className="text-[#e3e2e6]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                      <path className="text-[#e9c349]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray={`${metrics?.globalAccuracy || 0}, 100`} strokeLinecap="round" strokeWidth="3"></path>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <GraduationCap className="w-[20px] h-[20px] text-[#735c00]" strokeWidth={2.5} />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="mt-6 bg-white rounded-[1.5rem] shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#1b1b1e]/5 overflow-hidden">
            <div className="px-8 py-5 border-b border-[#1b1b1e]/5 flex justify-between items-center">
              <h5 className="font-serif font-black text-[18px] text-[#310065]">Recent Kingdom Activity</h5>
              <Link href="#" className="text-[#310065] text-[13px] font-bold flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                View All Activity <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[#7c7483] text-[10px] font-bold uppercase tracking-widest bg-[#faf9fc]/50">
                    <th className="px-8 py-4 font-bold">Submission</th>
                    <th className="px-8 py-4 font-bold">Category</th>
                    <th className="px-8 py-4 font-bold">Author</th>
                    <th className="px-8 py-4 font-bold">Complexity</th>
                    <th className="px-8 py-4 font-bold">Status</th>
                    <th className="px-8 py-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1b1b1e]/5 text-[14px]">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-20 text-center">
                        <Loader2 className="w-10 h-10 animate-spin mx-auto text-[#310065]/20" />
                        <p className="text-[12px] text-[#7c7483] mt-3 font-medium">Summoning archives...</p>
                      </td>
                    </tr>
                  ) : recentActivity.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-20 text-center">
                        <p className="text-[14px] text-[#7c7483] font-medium">No recent activity found in the kingdom.</p>
                      </td>
                    </tr>
                  ) : (
                    recentActivity.map((activity) => (
                      <tr key={activity.id} className="hover:bg-[#faf9fc] transition-colors group">
                        <td className="px-8 py-5">
                          <p className="font-bold text-[#1b1b1e]">Duel Match</p>
                          <p className="text-[11px] text-[#7c7483] mt-0.5">{new Date(activity.createdAt).toLocaleString()}</p>
                        </td>
                        <td className="px-8 py-5">
                          <span className="px-3 py-1.5 bg-[#f8d5f9]/40 text-[#4a148c] font-bold rounded-lg text-[11px] capitalize">{activity.category}</span>
                        </td>
                        <td className="px-8 py-5 font-medium text-[#4a4452]">{activity.player1Name}</td>
                        <td className="px-8 py-5">
                          <div className="flex gap-1 pr-4">
                            <div className={`w-2 h-2 rounded-full ${['easy', 'medium', 'hard'].indexOf(activity.difficulty) >= 0 ? 'bg-[#cba72f]' : 'bg-[#e3e2e6]'}`}></div>
                            <div className={`w-2 h-2 rounded-full ${['medium', 'hard'].indexOf(activity.difficulty) >= 0 ? 'bg-[#cba72f]' : 'bg-[#e3e2e6]'}`}></div>
                            <div className={`w-2 h-2 rounded-full ${activity.difficulty === 'hard' ? 'bg-[#cba72f]' : 'bg-[#e3e2e6]'}`}></div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${activity.status === 'completed' ? 'bg-[#059669]' : activity.status === 'active' ? 'bg-[#310065]' : 'bg-[#ea580c]'}`}></div>
                            <span className={`font-bold text-[13px] capitalize ${activity.status === 'completed' ? 'text-[#059669]' : activity.status === 'active' ? 'text-[#310065]' : 'text-[#ea580c]'}`}>
                              {activity.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button className="text-[#310065] hover:bg-[#310065]/5 p-2 rounded-full opacity-50 group-hover:opacity-100 transition-all">
                            <ArrowRight className="w-[18px] h-[18px]" strokeWidth={2.5} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
      </div>
    </AdminGuard>
  );
}
