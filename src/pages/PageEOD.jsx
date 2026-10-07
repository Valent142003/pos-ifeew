import { useState } from 'react';
import { ShieldCheck, Lock, FileSearch, ScrollText } from 'lucide-react';
import { PageHeader, Card, SectionTitle, Stat, EmptyState } from '../components/ui';

export default function PageEOD({ data, saveData }) {
  const [managerPass, setManagerPass] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [auditQuery, setAuditQuery] = useState('');

  const bills = data.bills || [];
  const eodStatus = data.eodStatus || { lastClosed: '', locked: false, approvedBy: '' };
  const auditLog = [...(data.auditLog || [])].reverse();

  const today = new Date().toISOString().slice(0, 10);
  const todayBills = bills.filter((b) => b.date && b.date.startsWith(today) && b.status !== 'cancelled');
  const sum = (pred) => todayBills.filter(pred).reduce((s, b) => s + b.items.reduce((t, i) => t + (i.net || 0), 0), 0);
  const summary = {
    cash: sum((b) => b.paymentMethod === 'เงินสด'),
    qr: sum((b) => b.paymentMethod === 'QR Code / โอนเงิน'),
    card: sum((b) => b.paymentMethod === 'บัตรเครดิต'),
    ewallet: sum((b) => b.paymentMethod === 'E-Wallet'),
  };
  const dayTotal = summary.cash + summary.qr + summary.card + summary.ewallet;
  const expenseToday = (data.expenses || []).filter((e) => e.date === today).reduce((s, e) => s + e.amount, 0);

  const filteredAudit = auditLog.filter((l) => {
    const q = auditQuery.toLowerCase();
    return !q || l.action.toLowerCase().includes(q) || l.user.toLowerCase().includes(q) || l.detail.toLowerCase().includes(q);
  });

  const pushAudit = (action, detail, oldV, newV) => ({
    id: `A-${Date.now()}`, timestamp: new Date().toISOString(), user: 'ผู้จัดการ',
    action, detail, oldValue: oldV, newValue: newV, approvedBy: 'ผู้จัดการ',
  });

  const handleClose = () => {
    if (managerPass !== 'manager123') { alert('รหัสผู้จัดการไม่ถูกต้อง (ตัวอย่าง: manager123)'); return; }
    saveData({ ...data, eodStatus: { lastClosed: today, locked: true, approvedBy: 'ผู้จัดการ' }, auditLog: [...(data.auditLog || []), pushAudit('ปิดวัน (EOD)', `${today} · ยอด ฿${dayTotal.toLocaleString()} · ${todayBills.length} บิล`, 'open', 'locked')] });
    alert('ปิดวันสำเร็จ — ข้อมูลถูกล็อกแล้ว');
    setManagerPass('');
  };
  const handleUnlock = () => {
    if (managerPass !== 'manager123') { alert('รหัสผู้จัดการไม่ถูกต้อง'); return; }
    saveData({ ...data, eodStatus: { ...eodStatus, locked: false }, auditLog: [...(data.auditLog || []), pushAudit('ปลดล็อกข้อมูล', 'ปรับปรุงย้อนหลัง', 'locked', 'unlocked')] });
    alert('ปลดล็อกแล้ว — การแก้ไขครั้งต่อไปจะถูกบันทึกใน Audit');
    setManagerPass('');
  };

  return (
    <div>
      <PageHeader icon={ShieldCheck} kicker="End of Day" title="สรุปปิดวัน & Audit" subtitle="กระทบยอดรายวัน ล็อกข้อมูล และตรวจสอบทุกการเปลี่ยนแปลง" />

      <div className="hero">
        <div className="mcard-top">
          <h2><Lock size={18} style={{ verticalAlign: -3 }} /> ปิดวัน — {new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}</h2>
          <span className="chip" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)' }}>{eodStatus.locked ? '🔒 ล็อกแล้ว' : '● ยังเปิดอยู่'}</span>
        </div>
        <div className="herogrid five" style={{ gridTemplateColumns: '1fr 1fr' }}>
          {[{ l: 'เงินสด', v: summary.cash }, { l: 'QR / โอน', v: summary.qr }, { l: 'บัตรเครดิต', v: summary.card }, { l: 'E-Wallet', v: summary.ewallet }].map((r) => (
            <div key={r.l} className="herobox"><div className="hl">{r.l}</div><div className="hv">฿{r.v.toLocaleString()}</div></div>
          ))}
          <div className="herobox white" style={{ gridColumn: 'span 2' }}><div className="hl" style={{ color: '#8B6F47', fontWeight: 600 }}>รวมวันนี้</div><div className="hv">฿{dayTotal.toLocaleString()}</div></div>
        </div>
        <div className="herogrid" style={{ marginBottom: 12 }}>
          <div className="herobox"><div className="hl">บิลวันนี้</div><div className="hv">{todayBills.length} บิล</div></div>
          <div className="herobox"><div className="hl">จ่ายวันนี้</div><div className="hv">฿{expenseToday.toLocaleString()}</div></div>
        </div>
        <div className="field" style={{ marginBottom: 8 }}><label style={{ color: 'rgba(255,255,255,0.7)' }}>รหัสผ่านผู้จัดการ</label>
          <input type="password" value={managerPass} onChange={(e) => setManagerPass(e.target.value)} placeholder="manager123" className="input" style={{ background: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.25)', color: '#fff' }} />
        </div>
        {eodStatus.locked
          ? <button onClick={handleUnlock} className="btn-primary" style={{ background: '#f59e0b', width: '100%' }}>ปลดล็อกเพื่อปรับปรุง</button>
          : <button onClick={handleClose} className="countwhite">อนุมัติปิดวัน (Lock)</button>}
        {eodStatus.lastClosed && <p className="hint" style={{ fontSize: 11, opacity: 0.55, marginTop: 8 }}>ปิดล่าสุด: {eodStatus.lastClosed} · โดย {eodStatus.approvedBy || '—'}</p>}
      </div>

      <div className="statgrid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <Stat tone="cream" label="บิลวันนี้" value={todayBills.length} sub="ไม่รวมบิลยกเลิก" />
        <Stat tone="cream" label="ยอดขายวันนี้" value={`฿${dayTotal.toLocaleString()}`} sub="ทุกช่องทาง" />
        <Stat tone="cream" label="เงินสดนับจริง" value={`฿${(data.cashDrawer?.lastCountReal || 0).toLocaleString()}`} sub={data.cashDrawer?.lastCountDate || 'ยังไม่นับ'} />
        <Stat tone="cream" label="กำไรเบื้องต้น" value={`฿${(dayTotal - expenseToday).toLocaleString()}`} sub="ขาย − จ่ายวันนี้" />
      </div>

      <Card>
        <SectionTitle hint={`${filteredAudit.length} รายการ`}>
          <span><FileSearch size={18} style={{ verticalAlign: -3 }} /> Audit Trail</span>
        </SectionTitle>
        <div className="audit-tools">
          <input value={auditQuery} onChange={(e) => setAuditQuery(e.target.value)} placeholder="ค้นหา action / ผู้ใช้ / รายละเอียด…" className="input" />
          <button onClick={() => setShowAll(!showAll)} className="btn-soft">{showAll ? 'ย่อ' : 'ดูทั้งหมด'}</button>
        </div>
        <div className="show-desktop">
          <div className="tablewrap">
            <table className="tbl">
              <thead><tr><th>วันเวลา</th><th>ผู้ใช้</th><th>การกระทำ</th><th>รายละเอียด</th><th>ค่าเดิม → ใหม่</th><th>อนุมัติโดย</th></tr></thead>
              <tbody>
                {(showAll ? filteredAudit : filteredAudit.slice(0, 5)).map((l) => (
                  <tr key={l.id}>
                    <td className="muted" style={{ whiteSpace: 'nowrap' }}>{new Date(l.timestamp).toLocaleString('th-TH')}</td>
                    <td><b style={{ fontWeight: 500 }}>{l.user}</b></td>
                    <td><span className="chip green">{l.action}</span></td>
                    <td className="muted">{l.detail}</td>
                    <td style={{ whiteSpace: 'nowrap', fontSize: 12 }}><span style={{ color: '#B42323' }}>{l.oldValue}</span> → <span style={{ color: '#2C5E3B', fontWeight: 600 }}>{l.newValue}</span></td>
                    <td className="muted">{l.approvedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="show-mobile">
          {(showAll ? filteredAudit : filteredAudit.slice(0, 5)).map((l) => (
            <div key={l.id} className="arow">
              <div className="a1"><span className="chip green" style={{ fontSize: 10 }}>{l.action}</span><time>{new Date(l.timestamp).toLocaleString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</time></div>
              <b>{l.detail}</b>
              <small><ScrollText size={11} style={{ verticalAlign: -1 }} /> {l.user} · อนุมัติ: {l.approvedBy} · <span style={{ color: '#B42323' }}>{l.oldValue}</span> → <span style={{ color: '#2C5E3B', fontWeight: 600 }}>{l.newValue}</span></small>
            </div>
          ))}
        </div>
        {filteredAudit.length === 0 && <EmptyState icon={ScrollText} title="ไม่มีประวัติ" subtitle="ลองเปลี่ยนคำค้น" />}
      </Card>
    </div>
  );
}
