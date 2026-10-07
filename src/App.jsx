import { useState, useEffect } from 'react';
import { Flower2 } from 'lucide-react';
import { SidebarDesktop, TopBarMobile, BottomNavMobile } from './components/Sidebar';
import PagePOS from './pages/PagePOS';
import PageBills from './pages/PageBills';
import PageCashDrawer from './pages/PageCashDrawer';
import PageExpenses from './pages/PageExpenses';
import PageCommission from './pages/PageCommission';
import PageEOD from './pages/PageEOD';
import { loadData, persistData } from './data/demoData';

const PAGES = {
  pos: PagePOS,
  bills: PageBills,
  cash: PageCashDrawer,
  expenses: PageExpenses,
  commission: PageCommission,
  eod: PageEOD,
};

export default function App() {
  const [activePage, setActivePage] = useState('pos');
  const [data, setData] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    try {
      const d = loadData();
      if (!d) throw new Error('empty');
      setData(d);
    } catch (err) {
      console.error(err);
      setLoadError('โหลดข้อมูลเริ่มต้นไม่สำเร็จ');
    }
  }, []);

  const saveData = (newData) => {
    try { persistData(newData); } catch (err) { console.error(err); }
    setData({ ...newData });
  };

  const navigate = (key) => {
    setActivePage(key);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loadError) {
    return (
      <div className="loading">
        <div className="card" style={{ maxWidth: 380, width: '100%', textAlign: 'center' }}>
          <h2 style={{ fontSize: 24, color: '#1E4229' }}>เกิดข้อผิดพลาด</h2>
          <p className="muted">{loadError}</p>
          <br />
          <button className="btn-primary" onClick={() => window.location.reload()}>รีเฟรช</button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="loading">
        <div className="loading-box">
          <div className="loading-logo"><Flower2 size={30} strokeWidth={1.5} /></div>
          <h2>I'FEEW THAIMASSAGE</h2>
          <p>Clean &amp; Warm Spa</p>
          <div className="loadbar"><i /></div>
        </div>
      </div>
    );
  }

  const PageComponent = PAGES[activePage] || PagePOS;

  return (
    <div className="app">
      <TopBarMobile active={activePage} />
      <div className="app-body">
        <SidebarDesktop
          active={activePage}
          onNavigate={navigate}
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />
        <main className="main">
          <div className="wrap">
            <PageComponent data={data} saveData={saveData} onNavigate={navigate} />
          </div>
        </main>
      </div>
      <footer className="footer">
        <div className="wrap">
          <span>I'FEEW Thai Massage &amp; Spa — POS &amp; Back-Office</span>
          <span>Clean &amp; Warm Spa · {new Date().getFullYear()}</span>
        </div>
      </footer>
      <BottomNavMobile active={activePage} onNavigate={navigate} />
    </div>
  );
}
