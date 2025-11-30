"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { 
  RocketLaunchIcon, 
  ChartBarIcon, 
  UserGroupIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-base-300 relative overflow-hidden">
      
      {/* 1. TOP NAVIGATION: Easy Access Login */}
      <nav className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center z-50 relative animate-in fade-in slide-in-from-top-4 duration-1000">
        <div className="font-black text-2xl tracking-tighter flex items-center gap-2 text-base-content">
          <div className="w-8 h-8 bg-primary rounded-lg shadow-lg shadow-primary/20 flex items-center justify-center">
            <div className="w-3 h-3 bg-base-100 rounded-full animate-pulse"></div>
          </div>
          Pulse
        </div>
        <div className="flex gap-4 items-center">
          <span className="text-sm font-medium text-base-content/60 hidden sm:block">Already a member?</span>
          <SignInButton mode="modal">
            <button className="btn btn-ghost btn-sm hover:bg-base-content/10">Sign In</button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="btn btn-primary btn-sm shadow-lg shadow-primary/20">Get Started</button>
          </SignUpButton>
        </div>
      </nav>

      {/* Dynamic Background Gradients */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>

      {/* Main Content (Centered vertically in remaining space) */}
      <div className="flex-1 flex items-center z-10 w-full max-w-7xl mx-auto px-6 pb-12">
        <div className="hero-content flex-col lg:flex-row-reverse gap-12 lg:gap-24 w-full">
          
          {/* Right Side: Visual Showcase */}
          <div className="text-center lg:text-left flex-1 w-full max-w-md lg:max-w-none hidden lg:block">
             <div className="relative group perspective-1000">
                {/* Glowing Backdrop */}
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
                
                {/* Glass Card */}
                <div className="relative card bg-base-100/90 backdrop-blur-xl shadow-2xl border border-white/10 p-8 transform transition-all duration-500 hover:scale-[1.02] hover:-rotate-1">
                   {/* Card Header */}
                   <div className="flex items-center gap-4 mb-8">
                      <div className="p-3 bg-gradient-to-br from-primary to-primary-focus rounded-2xl text-primary-content shadow-lg">
                        <RocketLaunchIcon className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="font-bold text-xl text-base-content">Growth Engine</h3>
                        <p className="text-xs opacity-60 text-base-content">Pipeline velocity +300%</p>
                      </div>
                   </div>
                   
                   {/* Feature List */}
                   <div className="space-y-4">
                      {[
                        { icon: ChartBarIcon, text: "Real-time Financial Forecasting", color: "text-success" },
                        { icon: UserGroupIcon, text: "Seamless Contact Management", color: "text-info" },
                        { icon: CheckCircleIcon, text: "Automated Task Tracking", color: "text-warning" }
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-4 bg-base-200/50 rounded-xl hover:bg-base-200 transition-colors cursor-default">
                          <item.icon className={`w-6 h-6 ${item.color}`} />
                          <span className="font-semibold text-sm text-base-content">{item.text}</span>
                        </div>
                      ))}
                   </div>

                   {/* Mock Graph or Data Point */}
                   <div className="mt-8 pt-6 border-t border-base-300 flex justify-between items-end">
                      <div className="text-xs opacity-50 text-base-content">Revenue (This Month)</div>
                      <div className="text-2xl font-black text-primary">+$12,450</div>
                   </div>
                </div>
             </div>
          </div>

          {/* Left Side: Copy & Auth */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-base-200 border border-base-content/10 text-xs font-bold mb-6 tracking-wide animate-in fade-in slide-in-from-bottom-4 duration-700 text-base-content">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
              LIVE PREVIEW v1.0
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black tracking-tight mb-6 leading-[1.1] text-base-content">
              Your Business <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent animate-gradient-x">
                On Pulse
              </span>
            </h1>
            
            <p className="py-6 text-lg text-base-content/70 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Stop juggling spreadsheets. The all-in-one OS designed to help you track leads, manage deals, and forecast revenue without the headache.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mt-4">
              <SignInButton mode="modal">
                <button className="btn btn-primary btn-lg px-8 shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all">
                  Get Started <ArrowRightIcon className="w-5 h-5 ml-1" />
                </button>
              </SignInButton>
              
              <SignUpButton mode="modal">
                <button className="btn btn-ghost btn-lg px-8 border border-base-content/10 hover:bg-base-100 hover:border-base-content/20 text-base-content">
                  Create Account
                </button>
              </SignUpButton>
            </div>

            <div className="mt-12 opacity-40 text-sm font-semibold tracking-widest text-base-content">
               TRUSTED BY MODERN TEAMS
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}