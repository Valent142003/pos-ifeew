import { useState, useMemo } from 'react';
import { ReceiptText, Plus, Minus, Trash2, ShieldAlert, Banknote, QrCode, CreditCard, Wallet, CheckCircle2, User, Sparkles, ArrowLeft, ArrowRight, ClipboardCheck } from 'lucide-react';
import { PageHeader, Card, SectionTitle, EmptyState, Modal } from '../components/ui';
import { generateBillId } from '../data/demoData';

const PAY_METHODS = [
  { label: 'เงินสด', icon: Banknote },
  { label: 'QR Code / โอนเงิน', icon: QrCode },
  { label: 'บัตรเครดิต', icon: CreditCard },
  { label: 'E-Wallet', icon: Wallet },
];

const STEPS = [
  { n: 1, title: 'พนักงาน', sub: 'เลือกผู้ให้บริการ', icon: User },
  { n: 2, title: 'บริการ', sub: 'แตะเพิ่มลงบิล', icon: Sparkles },
  { n: 3, title: 'ชำระเงิน', sub: 'ตรวจ + จ่าย', icon: ClipboardCheck },
];

export default function PagePOS({ data, saveData, onNavigate }) {
  const therapistsList = data.therapists || [];
  const services = data.services || [];
  const [step, setStep] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('ทั้งหมด');
  const [items, setItems] = useState([]);
  const [customer, setCustomer] = useState('');
  const [memberNo, setMemberNo] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('เงินสด');
  const [selectedTherapist, setSelectedTherapist] = useState('');
  const [showAuth, setShowAuth] = useState(false);
  const [authPass, setAuthPass] = useState('');
  const [authReason, setAuthReason] = useState('');
  const [successBill, setSuccessBill] = useState(null);

  const categories = useMemo(() => ['ทั้งหมด', ...new Set(services.map((s) => s.category))], [services]);
  const visibleServices = services.filter((s) => categoryFilter === 'ทั้งหมด' || s.category === categoryFilter);
  const total = items.reduce((s, i) => s + (i.net || 0), 0);
  const therapist = therapistsList.find((t) => t.id === selectedTherapist);

  const goStep = (n) => {
    if (n === 2 && !selectedTherapist) { alert('กรุณาเลือกพนักงานก่อน'); return; }
    if (n === 3 && items.length === 0) { alert('กรุณาเพิ่มบริการอย่างน้อย 1 รายการ'); return; }
    setStep(n);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quickAdd = (svc) => {
    if (!therapist) return;
    const found = items.findIndex((i) => i.serviceId === svc.id && i.therapistId === therapist.id);
    if (found >= 0) {
      const next = [...items];
      next[found] = { ...next[found], qty: next[found].qty + 1, net: (next[found].qty + 1) * next[found].price };
      setItems(next);
    } else {
      setItems([...items, {
        serviceId: svc.id, serviceName: svc.name, category: svc.category,
        therapistId: therapist.id, therapistName: therapist.name, qty: 1, price: svc.price, discount: 0, net: svc.price,
      }]);
    }
  };

  const changeQty = (idx, d) => {
    const next = [...items];
    const q = next[idx].qty + d;
    if (q <= 0) { next.splice(idx, 1); } else { next[idx] = { ...next[idx], qty: q, net: q * next[idx].price }; }
    setItems(next);
  };

  const openBill = () => {
    const id = generateBillId();
    const now = new Date();
    const newBill = { id, date: now.toISOString(), customer, memberNo, items, paymentMethod, status: 'paid', createdAt: now.toISOString() };
    saveData({
      ...data,
      bills: [...(data.bills || []), newBill],
      auditLog: [...(data.auditLog || []), {
        id: `A-${Date.now()}`, timestamp: now.toISOString(), user: 'ระบบ POS',
        action: 'สร้างบิล', detail: `${id} · ฿${total.toLocaleString()} · ${paymentMethod}`,
        oldValue: '-', newValue: 'paid', approvedBy: '-',
      }],
    });
    setSuccessBill({ id, total });
    setItems([]); setCustomer(''); setMemberNo(''); setStep(1); setSelectedTherapist('');
    setShowAuth(false); setAuthPass(''); setAuthReason('');
  };

  const confirmAuth = () => {
    if (authPass !== 'manager123') { alert('รหัสไม่ถูกต้อง (ตัวอย่าง: manager123)'); return; }
    if (!authReason.trim()) { alert('กรุณาระบุเหตุผล'); return; }
    openBill();
  };

  return (
    <div>
      <PageHeader
        icon={ReceiptText}
        kicker="Point of Sale"
        title="POS — เปิดบิล"
        subtitle="ทำตาม 3 ขั้นตอน: พนักงาน → บริการ → ชำระเงิน"
      />

      {/* Stepper */}
      <div className="stepper" role="navigation" aria-label="ขั้นตอนเปิดบิล">
        {STEPS.map((s, i) => {
          const state = step === s.n ? 'cur' : step > s.n ? 'done' : '';
          const Icon = s.icon;
          return (
            <div key={s.n} style={{ display: 'contents' }}>
              {i > 0 && <span className={`step-line${step > s.n - 1 ? ' done' : ''}`} />}
              <button className={`step ${state}`} onClick={() => { if (s.n < step) setStep(s.n); }}>
                <span className="step-dot">
                  {step > s.n ? <CheckCircle2 size={18} /> : <Icon size={17} />}
                </span>
                <small><b>{s.n}. {s.title}</b>{s.sub}</small>
              </button>
            </div>
          );
        })}
      </div>

      <div className="step-body" key={step}>
        {step === 1 && (
          <Card>
            <SectionTitle hint="เลือกได้ 1 คน">ขั้นที่ 1 · พนักงานผู้ให้บริการ</SectionTitle>
            <div className="tgrid">
              {therapistsList.map((th) => {
                const active = selectedTherapist === th.id;
                return (
                  <button key={th.id} onClick={() => setSelectedTherapist(active ? '' : th.id)} className={`tcard${active ? ' on' : ''}`}>
                    <span className="tava">{th.nickname.charAt(0)}</span>
                    <span><b>{th.name}</b><small>{th.nickname} · {th.role === 'senior' ? 'อาวุโส' : 'รุ่นใหม่'}</small><small>{th.id}</small></span>
                    <span className="pick">{active ? '✓ เลือกแล้ว' : 'แตะเพื่อเลือก'}</span>
                  </button>
                );
              })}
            </div>
            {!selectedTherapist && <p className="warn">⚠ กรุณาเลือกพนักงานก่อนไปขั้นต่อไป — ระบบจะผูกค่าคอมมิชชันให้อัตโนมัติ</p>}
            <div className="stepnav">
              <span style={{ flex: 1 }} />
              <button className="btn-primary" disabled={!selectedTherapist} onClick={() => goStep(2)}>
                ถัดไป: เลือกบริการ <ArrowRight size={17} />
              </button>
            </div>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <SectionTitle hint={`${items.length} รายการในบิล · ${therapist?.name || ''}`}>
              ขั้นที่ 2 · เลือกบริการ
            </SectionTitle>
            <div className="sumbox">
              <div className="r"><span>พนักงาน</span><b>{therapist ? `${therapist.name} (${therapist.nickname})` : '—'}</b></div>
              <div className="r"><span>รายการในบิล</span><b>{items.length} รายการ · ฿{total.toLocaleString()}</b></div>
            </div>
            <div className="chiprow" style={{ marginBottom: 12 }}>
              {categories.map((c) => (
                <button key={c} onClick={() => setCategoryFilter(c)} className={`fchip${categoryFilter === c ? ' on' : ''}`}>{c}</button>
              ))}
            </div>
            <div className="svc">
              {visibleServices.map((svc) => {
                const count = items.filter((i) => i.serviceId === svc.id).reduce((s, i) => s + i.qty, 0);
                return (
                  <button key={svc.id} onClick={() => quickAdd(svc)} className="svcbtn" style={count > 0 ? { borderColor: '#2C5E3B', background: '#EDF3EE' } : undefined}>
                    <span className="svcbtn-top">
                      <span><b>{svc.name}</b><small>{svc.category} · คอม {(svc.flatRate * 100).toFixed(0)}%</small></span>
                      <span className="pr">฿{svc.price.toLocaleString()}</span>
                    </span>
                    <span className="add"><Plus size={12} style={{ verticalAlign: -1 }} /> {count > 0 ? `เพิ่มอีก (ในบิล ×${count})` : 'แตะเพื่อเพิ่มลงบิล'}</span>
                  </button>
                );
              })}
            </div>
            <div className="stepnav">
              <button className="btn-soft" onClick={() => setStep(1)}><ArrowLeft size={16} /> ย้อนกลับ</button>
              <button className="btn-primary" disabled={items.length === 0} onClick={() => goStep(3)}>
                ถัดไป: ชำระเงิน · ฿{total.toLocaleString()} <ArrowRight size={17} />
              </button>
            </div>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <SectionTitle hint={`${items.length} รายการ`}>ขั้นที่ 3 · ตรวจสอบ &amp; ชำระเงิน</SectionTitle>
            <div className="sumbox">
              <div className="r"><span>พนักงาน</span><b>{therapist ? `${therapist.name} (${therapist.nickname})` : '—'}</b></div>
              <div className="r"><span>ลูกค้า</span><b>{customer || '—'}{memberNo ? ` · ${memberNo}` : ''}</b></div>
            </div>
            <div className="f2">
              <div className="field"><label>ชื่อลูกค้า</label><input value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="เช่น คุณสมชาย" className="input" /></div>
              <div className="field"><label>เบอร์สมาชิก</label><input value={memberNo} onChange={(e) => setMemberNo(e.target.value)} placeholder="M-xxxx" className="input" /></div>
            </div>
            <div>
              {items.map((it, idx) => (
                <div key={idx} className="bline">
                  <span className="t"><b>{it.serviceName}</b><small>{it.therapistName} · ฿{it.price.toLocaleString()}</small></span>
                  <span className="qty">
                    <button onClick={() => changeQty(idx, -1)} aria-label="ลด">{it.qty === 1 ? <Trash2 size={13} /> : <Minus size={13} />}</button>
                    <b>{it.qty}</b>
                    <button onClick={() => changeQty(idx, 1)} aria-label="เพิ่ม"><Plus size={13} /></button>
                  </span>
                  <span className="p">฿{it.net.toLocaleString()}</span>
                </div>
              ))}
              {items.length === 0 && <EmptyState icon={Sparkles} title="บิลว่าง" subtitle="ย้อนกลับไปเพิ่มบริการ" />}
            </div>
            <div className="field" style={{ marginTop: 12 }}><label>ช่องทางการชำระเงิน</label>
              <div className="paygrid">
                {PAY_METHODS.map((m) => {
                  const Icon = m.icon;
                  const on = paymentMethod === m.label;
                  return (
                    <button key={m.label} onClick={() => setPaymentMethod(m.label)} className={`paybtn${on ? ' on' : ''}`}>
                      <Icon size={16} /><span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="totalrow">
              <span className="tl">ยอดรวมสุทธิ</span>
              <span className="tv">฿{total.toLocaleString()}</span>
            </div>
            <div className="stepnav">
              <button className="btn-soft" onClick={() => setStep(2)}><ArrowLeft size={16} /> ย้อนกลับ</button>
              <button className="btn-primary" disabled={items.length === 0} onClick={() => setShowAuth(true)}>
                <ReceiptText size={18} /> เปิดบิล · ฿{total.toLocaleString()}
              </button>
            </div>
            <button className="linkbtn" onClick={() => onNavigate && onNavigate('bills')}>ดูประวัติบิลทั้งหมด →</button>
          </Card>
        )}
      </div>

      {showAuth && (
        <Modal onClose={() => { setShowAuth(false); setAuthPass(''); setAuthReason(''); }}>
          <div className="pagehead-main" style={{ marginBottom: 6 }}>
            <div className="pagehead-icon"><ShieldAlert size={22} /></div>
            <div><h3>ยืนยันเปิดบิล</h3><p className="muted">ยอด ฿{total.toLocaleString()} · {paymentMethod} · {items.length} รายการ</p></div>
          </div>
          <div className="field"><label>รหัสผ่านผู้จัดการ</label><input type="password" value={authPass} onChange={(e) => setAuthPass(e.target.value)} placeholder="manager123" className="input" /></div>
          <div className="field"><label>หมายเหตุ / เหตุผล (บังคับ)</label><textarea value={authReason} onChange={(e) => setAuthReason(e.target.value)} placeholder="เช่น รับชำระเงินสดครบถ้วน…" className="input" rows={3} /></div>
          <div className="modal-row">
            <button onClick={() => { setShowAuth(false); setAuthPass(''); setAuthReason(''); }} className="btn-soft">ยกเลิก</button>
            <button onClick={confirmAuth} disabled={!authReason.trim() || !authPass} className="btn-primary" style={{ width: '100%' }}>ยืนยันเปิดบิล</button>
          </div>
        </Modal>
      )}

      {successBill && (
        <Modal onClose={() => setSuccessBill(null)}>
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div className="empty-icon" style={{ background: '#E4EFE5', color: '#047857', width: 64, height: 64 }}><CheckCircle2 size={32} /></div>
            <h3 style={{ fontSize: 26 }}>เปิดบิลสำเร็จ</h3>
            <div className="mono" style={{ marginTop: 4 }}>{successBill.id}</div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 40, fontWeight: 600, color: '#2C5E3B' }}>฿{successBill.total.toLocaleString()}</div>
            <div className="modal-row">
              <button onClick={() => setSuccessBill(null)} className="btn-soft">เปิดบิลต่อ</button>
              <button onClick={() => { setSuccessBill(null); onNavigate && onNavigate('bills'); }} className="btn-primary" style={{ width: '100%' }}>ดูประวัติบิล</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
