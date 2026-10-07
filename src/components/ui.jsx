export function PageHeader({ icon: Icon, title, subtitle, actions, kicker }) {
  return (
    <header className="pagehead">
      {kicker && <div className="kicker"><span>{kicker}</span></div>}
      <div className="pagehead-row">
        <div className="pagehead-main">
          {Icon && <div className="pagehead-icon"><Icon size={22} strokeWidth={1.8} /></div>}
          <div>
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="pagehead-actions">{actions}</div>}
      </div>
    </header>
  );
}

export function Card({ children, className = '' }) {
  return <div className={`card ${className}`}>{children}</div>;
}

export function SectionTitle({ children, hint }) {
  return (
    <div className="sect">
      <h2>{children}</h2>
      {hint && <small>{hint}</small>}
    </div>
  );
}

export function Stat({ tone = 'green', label, value, sub }) {
  return (
    <div className={`stat ${tone}`}>
      <div className="sl">{label}</div>
      <div className="sv">{value}</div>
      {sub && <div className="ss">{sub}</div>}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div className="empty">
      {Icon && <div className="empty-icon"><Icon size={24} strokeWidth={1.6} /></div>}
      <b>{title}</b>
      {subtitle && <span>{subtitle}</span>}
    </div>
  );
}

export function StatusBadge({ status }) {
  if (status === 'paid') return <span className="chip green">● ชำระแล้ว</span>;
  if (status === 'cancelled') return <span className="chip red">✕ ยกเลิก</span>;
  return <span className="chip gold">◷ {status}</span>;
}

export function Modal({ children, onClose }) {
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
