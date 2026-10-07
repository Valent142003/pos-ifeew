import {
  LayoutGrid, ReceiptText, Wallet, FileText, Calculator,
  ShieldCheck, Flower2, Menu,
} from 'lucide-react';

export const NAV_ITEMS = [
  { label: 'POS', short: 'POS', sub: 'เปิดบิลขาย', icon: ReceiptText, key: 'pos' },
  { label: 'ประวัติบิล', short: 'บิล', sub: 'ค้นหา & Void', icon: FileText, key: 'bills' },
  { label: 'ลิ้นชักเงินสด', short: 'เงินสด', sub: 'นับ & กระทบยอด', icon: Wallet, key: 'cash' },
  { label: 'ค่าใช้จ่าย', short: 'ค่าใช้จ่าย', sub: 'บันทึกรายจ่าย', icon: LayoutGrid, key: 'expenses' },
  { label: 'ค่าคอมมิชชัน', short: 'คอมฯ', sub: 'สรุปรายคน', icon: Calculator, key: 'commission' },
  { label: 'สรุปปิดวัน', short: 'ปิดวัน', sub: 'EOD & Audit', icon: ShieldCheck, key: 'eod' },
];

/* Desktop only (CSS hides on mobile) */
export function SidebarDesktop({ active, onNavigate, collapsed, onToggle }) {
  return (
    <aside className={`sidebar${collapsed ? ' narrow' : ''}`}>
      <div className="sidebar-inner">
        <div className="sidebar-brand">
          <div className="logo"><Flower2 size={24} strokeWidth={1.6} /></div>
          <div className="txt">
            <b>I'FEEW</b>
            <small>Thai Massage &amp; Spa</small>
          </div>
        </div>
        <button className="collapsebtn" onClick={onToggle}>
          <Menu size={14} style={{ verticalAlign: -2 }} /> {!collapsed && 'ย่อเมนู'}
        </button>
        <div className="side-label"><span>เมนูหลัก</span></div>
        <nav className="sidenav">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.key;
            return (
              <button key={item.key} title={item.label} onClick={() => onNavigate(item.key)} className={isActive ? 'on' : ''}>
                <span className="si"><Icon size={18} strokeWidth={1.9} /></span>
                <span className="st"><b>{item.label}</b><small>{item.sub}</small></span>
              </button>
            );
          })}
        </nav>
        <div className="sidebar-foot">
          <div className="sidebar-status">
            <div className="d">วันนี้</div>
            <div>{new Date().toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* Mobile only (CSS hides on desktop) */
export function TopBarMobile({ active }) {
  const current = NAV_ITEMS.find((n) => n.key === active);
  return (
    <header className="topbar">
      <div className="topbar-logo"><Flower2 size={20} strokeWidth={1.7} /></div>
      <div className="topbar-title">
        <b>I'FEEW <span>· {current?.label}</span></b>
        <div className="topbar-sub">Thai Massage &amp; Spa</div>
      </div>
      <div className="topbar-status">
        {new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
        <small><i className="dot" /> Online</small>
      </div>
    </header>
  );
}

/* Mobile only: 6 tabs, always visible */
export function BottomNavMobile({ active, onNavigate }) {
  return (
    <nav className="bottomnav" aria-label="เมนูหลักมือถือ">
      <div className="bottomnav-inner">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.key;
          return (
            <button key={item.key} title={item.label} onClick={() => onNavigate(item.key)} className={isActive ? 'on' : ''}>
              <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
              <span>{item.short}</span>
              <i className={isActive ? 'dot-on' : 'dot-off'} />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
