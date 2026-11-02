
import { useState } from "react";
import SkinScan from "./SkinScan";
import {
  LayoutDashboard,
  ScanFace,
  TrendingUp,
  Sparkles,
  CalendarDays,
  Settings,
  Bell,
  Search,
  ChevronRight,
  ArrowUpRight,
  Plus,
  Droplets,
  Sun,
  Moon,
  Activity,
  Heart,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import "./App.css";

const trendData = [
  { week: "Week 1", score: 42 },
  { week: "Week 2", score: 48 },
  { week: "Week 3", score: 46 },
  { week: "Week 4", score: 57 },
  { week: "Week 5", score: 65 },
  { week: "Week 6", score: 72 },
];

const navItems = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "My SkinTwin", icon: ScanFace },
  { label: "Skin Evolution", icon: TrendingUp },
  { label: "AI Skin Coach", icon: Sparkles },
  { label: "My Routine", icon: CalendarDays },
];

function App() {
   const [activeTab, setActiveTab] = useState("Overview");

  if (activeTab === "My SkinTwin") {
    return (
      <SkinScan
        onBack={() => setActiveTab("Overview")}
      />
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon"><Sparkles size={21} /></div>
          <span>skin<span className="brand-accent">twin</span></span>
        </div>

        <div className="sidebar-label">WORKSPACE</div>

        <nav>
          {navItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`nav-item ${activeTab === label ? "active" : ""}`}
              onClick={() => setActiveTab(label)}
            >
              <Icon size={18} />
              <span>{label}</span>
              {label === "AI Skin Coach" && <span className="new-dot" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button className="nav-item">
            <Settings size={18} />
            Settings
          </button>
          <div className="profile">
            <div className="avatar">S</div>
            <div>
              <strong>My SkinTwin</strong>
              <span>Personal profile</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">Workspace <ChevronRight size={14} /> {activeTab}</div>
          <div className="top-actions">
            <button className="icon-button"><Search size={19} /></button>
            <button className="icon-button"><Bell size={19} /></button>
            <div className="avatar">S</div>
          </div>
        </header>

        <div className="page-content">
          <section className="welcome-section">
            <div>
              <div className="eyebrow">YOUR PERSONAL SKIN INTELLIGENCE</div>
              <h1>Your skin journey,<br />beautifully understood.</h1>
              <p>Every scan tells a story. Let's discover yours.</p>
            </div>
            <button className="primary-button" onClick={() => setActiveTab("My SkinTwin")}>
              <Plus size={18} /> New skin scan
            </button>
          </section>

          <section className="hero-card">
            <div className="hero-copy">
              <div className="hero-tag"><Sparkles size={14} /> YOUR SKINTWIN</div>
              <h2>Your skin is<br />a journey, not<br />a destination.</h2>
              <p>Understand your skin. Track its evolution.<br />Make every skincare decision count.</p>
              <button className="hero-button" onClick={() => setActiveTab("My SkinTwin")}>
                Explore my SkinTwin <ArrowUpRight size={16} />
              </button>
            </div>
            <div className="hero-art">
              <div className="orbit orbit-one" />
              <div className="orbit orbit-two" />
              <div className="hero-center">
                <ScanFace size={85} strokeWidth={0.8} />
              </div>
              <div className="floating-chip chip-one"><Droplets size={15} /> Skin hydration</div>
              <div className="floating-chip chip-two"><Activity size={15} /> Skin evolution</div>
            </div>
          </section>

          <section className="section-heading">
            <div>
              <h2>Your skin at a glance</h2>
              <p>A snapshot of your personal skin intelligence.</p>
            </div>
            <span className="demo-label">DEMO DATA</span>
          </section>

          <section className="metrics-grid">
            <MetricCard icon={<Droplets />} label="Hydration" value="—" detail="Awaiting first scan" />
            <MetricCard icon={<Activity />} label="Skin texture" value="—" detail="Awaiting first scan" />
            <MetricCard icon={<Heart />} label="Skin concerns" value="—" detail="Awaiting first scan" />
            <MetricCard icon={<Sun />} label="Skin radiance" value="—" detail="Awaiting first scan" />
          </section>

          <section className="dashboard-grid">
            <div className="panel evolution-panel">
              <div className="panel-heading">
                <div>
                  <h3>Skin evolution</h3>
                  <p>Your skin journey over time</p>
                </div>
                <span className="demo-label">ILLUSTRATIVE</span>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="skinGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#9DB89D" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#9DB89D" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAEAE4" />
                    <XAxis dataKey="week" tickLine={false} axisLine={false} tick={{ fill: "#99998F", fontSize: 11 }} />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip />
                    <Area type="monotone" dataKey="score" stroke="#718E73" strokeWidth={2.5} fill="url(#skinGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="chart-note">Illustrative data only — real trends will appear after your scans.</p>
            </div>

            <div className="panel scan-panel">
              <div className="panel-heading">
                <div>
                  <h3>Begin your journey</h3>
                  <p>Create your first SkinTwin</p>
                </div>
                <ScanFace size={22} color="#718E73" />
              </div>
              <div className="scan-illustration">
                <ScanFace size={55} strokeWidth={1} />
                <span>Your skin story starts here</span>
              </div>
              <button className="primary-button full-button" onClick={() => setActiveTab("My SkinTwin")}>
                Start first skin scan <ArrowUpRight size={16} />
              </button>
            </div>
          </section>

          <section className="bottom-grid">
            <div className="panel routine-panel">
              <div className="panel-heading">
                <div>
                  <h3>Daily skin ritual</h3>
                  <p>Small habits, meaningful progress.</p>
                </div>
                <CalendarDays size={21} color="#718E73" />
              </div>
              <div className="routine-row">
                <div className="routine-icon"><Sun size={18} /></div>
                <div><strong>Morning routine</strong><span>Cleanse · Moisturize · SPF</span></div>
                <span className="routine-time">AM</span>
              </div>
              <div className="routine-row">
                <div className="routine-icon"><Moon size={18} /></div>
                <div><strong>Evening routine</strong><span>Cleanse · Moisturize</span></div>
                <span className="routine-time">PM</span>
              </div>
            </div>
            <div className="insight-card">
              <Sparkles size={21} />
              <span className="eyebrow">A LITTLE REMINDER</span>
              <h3>Consistency is your skin's best companion.</h3>
              <p>Your journey isn't about perfection. It's about understanding what works for you.</p>
            </div>
          </section>

          <footer>SKINTWIN · YOUR SKIN, YOUR STORY.</footer>
        </div>
      </main>
    </div>
  );
}

function MetricCard({ icon, label, value, detail }) {
  return (
    <div className="metric-card">
      <div className="metric-top">
        <span>{label}</span>
        <div className="metric-icon">{icon}</div>
      </div>
      <h3>{value}</h3>
      <p>{detail}</p>
    </div>
  );
}

export default App;
