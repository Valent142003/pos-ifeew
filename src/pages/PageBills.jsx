import { useState, useMemo } from 'react';
import { FileText, Search, ShieldAlert, ReceiptText } from 'lucide-react';
import { PageHeader, Card, EmptyState, StatusBadge, Modal, SectionTitle, Stat } from '../components/ui';

export default function PageBills({ data, saveData, onNavigate }) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [payFilter, setPayFilter] = useState('all');
  const [detailBill, setDetailBill] = useState(null);
  const [voidTarget, setVoidTarget] = useState(null);
  const [authPass, setAuthPass] = useState('');
  const [authReason, setAuthReason] = useState('');

  const bills = useMemo(() => [...(data.bills || [])].reverse(), [data.bills]);
  const filtered = bills.filter((b) => {
    const q = query.trim().toLowerCase();
    const matchQ = !q || b.id.toLowerCase().includes(q) || (b.customer || '').toLowerCase().includes(q) || (b.memberNo || '').toLowerCase().includes(q);
    return matchQ && (statusFilter === 'all' || b.status === statusFilter) && (payFilter === 'all' || b.paymentMethod === payFilter);
  });
  const billTotal = (b) => (b.items || []).reduce((s, i) => s + (i.net || 0), 0);
  const totalSum = filtered.filter((b) => b.status === 'paid').reduce((s, b) => s + billTotal(b), 0);
  const payMethods = ['เงินสด', 'QR Code / โอนเงิน', 'บัตรเครดิต', 'E-Wallet'];

  const confirmVoid = () => {
    if (authPass !== 'manager123') { alert('รหัสไม่ถูกต้อง (ตัวอย่าง: manager123)'); return; }
    if (!authReason.trim()) { alert('กรุณาระบุเหตุผลการยกเลิก'); return; }
    saveData({
      ...data,
      bills: data.bills.map((b) => (b.id === voidTarget.id ? { ...b, status: 'cancelled' } : b)),
      auditLog: [...(data.auditLog || []), {
        id: `A-${Date.now()}`, timestamp: new Date().toISOString(), user: 'ผู้จัดการ',
        action: 'ยกเลิกบิล (Void)', detail: `${voidTarget.id} — ${authReason}`,
        oldValue: 'paid', newValue: 'cancelled', approvedBy: 'ผู้จัดการ',
      }],
    });
    setVoidTarget(null); setAuthPass(''); setAuthReason('');
  };

  return (
    <div>
      <PageHeader
        icon={FileText} kicker="Bill History" title="ประวัติบิล"
        subtitle="ค้นหา ตรวจสอบรายละเอียด และ Void บิล (ต้องอนุมัติผู้จัดการ)"
        actions={<button onClick={() => onNavigate && onNavigate('pos')} className="btn-primary auto" style={{ width: 'auto' }}><ReceiptText size={17} /> เปิดบิลใหม่</button>}
      />

      <div className="statgrid">
        <div className="stat green span2">
          <div className="sl">ยอดรวมที่กรอง (ชำระแล้ว)</div>
          <div className="sv">฿{totalSum.toLocaleString()}</div>
          <div className="ss">{filtered.length} บิล · ชำระแล้ว {filtered.filter((b) => b.status === 'paid').length} · ยกเลิก {filtered.filter((b) => b.status === 'cancelled').length}</div>
        </div>
        <Stat tone="cream" label="บิลทั้งหมด" value={bills.length} />
        <Stat tone="cream" label="วันนี้" value={bills.filter((b) => b.date && b.date.startsWith(new Date().toISOString().slice(0, 10))).length} />
      </div>

      <Card>
        <div className="field" style={{ marginBottom: 10 }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#7A837B' }} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ค้นหาเลขบิล / ชื่อลูกค้า / เบอร์สมาชิก…" className="input" style={{ paddingLeft: 36 }} />
          </div>
        </div>
        <div className="chiprow" style={{ marginBottom: 8 }}>
          {[{ v: 'all', l: 'ทั้งหมด' }, { v: 'paid', l: 'ชำระแล้ว' }, { v: 'cancelled', l: 'ยกเลิก' }].map((o) => (
            <button key={o.v} onClick={() => setStatusFilter(o.v)} className={`fchip${statusFilter === o.v ? ' on' : ''}`}>{o.l}</button>
          ))}
        </div>
        <div className="chiprow">
          {['all', ...payMethods].map((m) => (
            <button key={m} onClick={() => setPayFilter(m)} className={`fchip green${payFilter === m ? ' on' : ''}`}>{m === 'all' ? 'ทุกช่องทาง' : m}</button>
          ))}
        </div>
      </Card>

      <Card className="show-desktop">
        <div className="tablewrap">
          <table className="tbl">
            <thead><tr><th>เลขบิล</th><th>วันที่</th><th>ลูกค้า</th><th>ช่องทาง</th><th className="r">ยอด</th><th>สถานะ</th><th className="c">จัดการ</th></tr></thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id}>
                  <td className="mono">{b.id}</td>
                  <td className="muted" style={{ whiteSpace: 'nowrap' }}>{new Date(b.date).toLocaleString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                  <td><b style={{ fontWeight: 500 }}>{b.customer || '—'}</b>{b.memberNo && <div className="muted">{b.memberNo}</div>}</td>
                  <td className="muted">{b.paymentMethod}</td>
                  <td className="r"><b>฿{billTotal(b).toLocaleString()}</b></td>
                  <td><StatusBadge status={b.status} /></td>
                  <td className="c">
                    <button onClick={() => setDetailBill(b)} className="btn-soft" style={{ padding: '6px 12px', fontSize: 12 }}>ดู</button>
                    {b.status === 'paid' && <> <button onClick={() => setVoidTarget(b)} className="btn-danger-soft">Void</button></>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <EmptyState icon={FileText} title="ไม่พบบิล" subtitle="ลองเปลี่ยนคำค้นหรือตัวกรอง" />}
      </Card>

      <div className="mcards show-mobile">
        {filtered.map((b) => (
          <button key={b.id} onClick={() => setDetailBill(b)} className="mcard">
            <div className="mcard-top">
              <div><div className="mono">{b.id}</div><div className="muted">{new Date(b.date).toLocaleString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} · {b.paymentMethod}</div></div>
              <StatusBadge status={b.status} />
            </div>
            <div className="mcard-bot">
              <b style={{ fontWeight: 500, fontSize: 14 }}>{b.customer || 'ลูกค้าทั่วไป'}</b>
              <span className="bigprice">฿{billTotal(b).toLocaleString()}</span>
            </div>
            <div className="muted" style={{ marginTop: 4 }}>{(b.items || []).length} รายการ</div>
          </button>
        ))}
        {filtered.length === 0 && <Card><EmptyState icon={FileText} title="ไม่พบบิล" subtitle="ลองเปลี่ยนคำค้นหรือตัวกรอง" /></Card>}
      </div>

      {detailBill && (
        <Modal onClose={() => setDetailBill(null)}>
          <div className="mcard-top">
            <div><div className="muted" style={{ letterSpacing: 2, fontSize: 10 }}>BILL DETAIL</div><div className="mono" style={{ fontSize: 14 }}>{detailBill.id}</div><div className="muted">{new Date(detailBill.date).toLocaleString('th-TH')}</div></div>
            <StatusBadge status={detailBill.status} />
          </div>
          <div className="arow">
            <div className="mcard-bot"><span className="muted">ลูกค้า</span><b>{detailBill.customer || '—'}</b></div>
            <div className="mcard-bot"><span className="muted">สมาชิก</span><b>{detailBill.memberNo || '—'}</b></div>
            <div className="mcard-bot"><span className="muted">ชำระโดย</span><b>{detailBill.paymentMethod}</b></div>
          </div>
          <SectionTitle hint={`${(detailBill.items || []).length} รายการ`}>รายการบริการ</SectionTitle>
          {(detailBill.items || []).map((it, i) => (
            <div key={i} className="bline">
              <span className="t"><b>{it.serviceName || it.serviceId}{it.qty > 1 ? ` ×${it.qty}` : ''}</b><small>พนักงาน: {it.therapistName || it.therapistId}</small></span>
              <span className="p">฿{(it.net || 0).toLocaleString()}</span>
            </div>
          ))}
          <div className="totalrow"><span className="tl">ยอดรวม</span><span className="tv">฿{billTotal(detailBill).toLocaleString()}</span></div>
          <div className="modal-row">
            <button onClick={() => setDetailBill(null)} className="btn-soft">ปิด</button>
            {detailBill.status === 'paid' && <button onClick={() => { setVoidTarget(detailBill); setDetailBill(null); }} className="btn-danger-soft" style={{ padding: 12, fontSize: 14 }}>Void บิลนี้</button>}
          </div>
        </Modal>
      )}

      {voidTarget && (
        <Modal onClose={() => { setVoidTarget(null); setAuthPass(''); setAuthReason(''); }}>
          <div className="pagehead-main" style={{ marginBottom: 6 }}>
            <div className="pagehead-icon" style={{ background: 'var(--red)' }}><ShieldAlert size={22} /></div>
            <div><h3>Void บิล {voidTarget.id}</h3><p className="muted">ต้องอนุมัติโดยผู้จัดการ + ระบุเหตุผล</p></div>
          </div>
          <div className="field"><label>รหัสผ่านผู้จัดการ</label><input type="password" value={authPass} onChange={(e) => setAuthPass(e.target.value)} placeholder="manager123" className="input" /></div>
          <div className="field"><label>เหตุผลการยกเลิก (บังคับ)</label><textarea value={authReason} onChange={(e) => setAuthReason(e.target.value)} placeholder="เช่น ลูกค้าขอเปลี่ยนบริการ…" className="input" rows={3} /></div>
          <div className="modal-row">
            <button onClick={() => { setVoidTarget(null); setAuthPass(''); setAuthReason(''); }} className="btn-soft">ยกเลิก</button>
            <button onClick={confirmVoid} disabled={!authReason.trim()} className="btn-primary btn-danger" style={{ width: '100%' }}>อนุมัติ Void</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
