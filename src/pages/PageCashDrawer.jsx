import { useState } from 'react';
import { Wallet, Banknote, ArrowDownLeft, ArrowUpRight, Landmark, CheckCircle2, AlertTriangle } from 'lucide-react';
import { PageHeader, Card, SectionTitle, Stat } from '../components/ui';

export default function PageCashDrawer({ data, saveData }) {
  const drawer = data.cashDrawer || { startCash: 3000, salesCash: 0, otherCashIn: 0, payoutCash: 0, depositCash: 0, lastCountDate: '', lastCountReal: 0, lastCountReason: '' };
  const [startCash, setStartCash] = useState(drawer.startCash);
  const [salesCash, setSalesCash] = useState(drawer.salesCash);
  const [otherCashIn, setOtherCashIn] = useState(drawer.otherCashIn);
  const [payoutCash, setPayoutCash] = useState(drawer.payoutCash);
  const [depositCash, setDepositCash] = useState(drawer.depositCash);
  const [realCount, setRealCount] = useState('');
  const [differenceReason, setDifferenceReason] = useState('');
  const [countDone, setCountDone] = useState(false);

  const expected = startCash + salesCash + otherCashIn - payoutCash - depositCash;
  const real = Number(realCount) || 0;
  const diff = realCount === '' ? 0 : real - expected;

  const handleSave = () => {
    if (realCount === '') { alert('กรุณากรอกยอดเงินสดจริง'); return; }
    if (diff !== 0 && !differenceReason.trim()) { alert('มีส่วนต่าง กรุณาระบุเหตุผลก่อนบันทึก'); return; }
    saveData({ ...data, cashDrawer: { ...drawer, startCash, salesCash, otherCashIn, payoutCash, depositCash, lastCountDate: new Date().toISOString().slice(0, 10), lastCountReal: real, lastCountReason: diff !== 0 ? differenceReason : '' } });
    setCountDone(true);
    setTimeout(() => setCountDone(false), 3000);
  };

  const fields = [
    { label: 'เงินสดต้นวัน', hint: 'Float เริ่มต้นกะ', value: startCash, set: setStartCash, icon: Banknote },
    { label: 'เงินสดจากการขาย', hint: 'รวมบิลเงินสดวันนี้', value: salesCash, set: setSalesCash, icon: ArrowDownLeft },
    { label: 'เงินสดรับอื่น ๆ', hint: 'รายรับนอกบิล', value: otherCashIn, set: setOtherCashIn, icon: ArrowDownLeft },
    { label: 'เงินสดจ่ายออก', hint: 'Petty cash / ทอน', value: payoutCash, set: setPayoutCash, icon: ArrowUpRight },
    { label: 'นำฝากธนาคาร', hint: 'Drop / ฝาก', value: depositCash, set: setDepositCash, icon: Landmark },
  ];

  return (
    <div>
      <PageHeader icon={Wallet} kicker="Cash Drawer" title="ลิ้นชักเงินสด" subtitle="บันทึกการเคลื่อนไหว นับจริง และกระทบยอดส่วนต่าง" />

      <div className="statgrid">
        <Stat tone="green" label="ควรมีในลิ้นชัก" value={`฿${expected.toLocaleString()}`} sub="คำนวณอัตโนมัติ" />
        <Stat tone="cream" label="นับได้จริง" value={realCount === '' ? '—' : `฿${real.toLocaleString()}`} sub="กรอกด้านล่าง" />
        <div className="stat cream span2">
          <div className="sl">{diff === 0 ? '✓ ส่วนต่าง' : '⚠ ส่วนต่าง'}</div>
          <div className="sv" style={{ color: realCount === '' || diff === 0 ? undefined : diff < 0 ? '#B42323' : '#92580a' }}>
            {realCount === '' ? '—' : diff === 0 ? 'ตรงพอดี ✓' : `${diff > 0 ? '+' : '−'}฿${Math.abs(diff).toLocaleString()}`}
          </div>
          <div className="ss">{realCount === '' ? 'กรอกยอดนับจริงเพื่อดูส่วนต่าง' : diff === 0 ? 'ยอดตรง ไม่ต้องระบุเหตุผล' : 'มีส่วนต่าง — ต้องระบุเหตุผลก่อนบันทึก'}</div>
        </div>
      </div>

      <div className="cols-2">
        <Card>
          <SectionTitle hint="แตะตัวเลขเพื่อแก้ไข">บันทึกการเคลื่อนไหว</SectionTitle>
          {fields.map(({ label, hint, value, set, icon: Icon }) => (
            <div key={label} className="cashrow">
              <span className="ic"><Icon size={18} /></span>
              <span className="t"><b>{label}</b><small>{hint}</small></span>
              <span className="amt">฿<input type="number" value={value} onChange={(e) => set(Number(e.target.value))} /></span>
            </div>
          ))}
          <div className="formula">
            สูตร: <b>ควรมี = ต้นวัน + ขาย + รับอื่น − จ่ายออก − ฝาก</b><br />
            = {startCash.toLocaleString()} + {salesCash.toLocaleString()} + {otherCashIn.toLocaleString()} − {payoutCash.toLocaleString()} − {depositCash.toLocaleString()} = <b style={{ color: '#2C5E3B' }}>฿{expected.toLocaleString()}</b>
          </div>
        </Card>

        <div className="countpanel">
          <h2>นับเงินจริง &amp; ปิดกะ</h2>
          <p className="hint">นับธนบัตร + เหรียญทั้งหมดแล้วกรอกยอด</p>
          <label className="sl" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.7 }}>ยอดนับได้จริง (฿)</label>
          <input type="number" value={realCount} onChange={(e) => setRealCount(e.target.value)} placeholder="0" className="biginput" style={{ marginTop: 6 }} />
          {realCount !== '' && diff !== 0 && (
            <textarea value={differenceReason} onChange={(e) => setDifferenceReason(e.target.value)} placeholder="เหตุผลส่วนต่าง (บังคับ) เช่น เงินขาดจากทิปไม่ครบ…" />
          )}
          {realCount !== '' && diff === 0 && <div className="diffbox zero">✓ ยอดตรงพอดี ไม่ต้องระบุเหตุผล</div>}
          <button onClick={handleSave} className="countwhite">บันทึกการนับเงินสด</button>
          {countDone && <p className="okmsg" style={{ color: '#A7F3D0' }}><CheckCircle2 size={14} style={{ verticalAlign: -2 }} /> บันทึกสำเร็จ</p>}
          {drawer.lastCountDate && (
            <p className="hint" style={{ marginTop: 12, marginBottom: 0 }}>
              ครั้งล่าสุด: {drawer.lastCountDate} · นับจริง ฿{(drawer.lastCountReal || 0).toLocaleString()}<br />
              เหตุผล: {drawer.lastCountReason || '—'}
            </p>
          )}
          {diff !== 0 && realCount !== '' && (
            <p className="hint" style={{ display: 'flex', gap: 6, alignItems: 'center' }}><AlertTriangle size={13} /> มีส่วนต่างต้องระบุเหตผลก่อนบันทึก</p>
          )}
        </div>
      </div>
    </div>
  );
}
