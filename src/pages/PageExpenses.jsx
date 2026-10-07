import { useState } from 'react';
import { LayoutGrid, Plus, Upload, CheckCircle2, Receipt } from 'lucide-react';
import { PageHeader, Card, SectionTitle, EmptyState } from '../components/ui';

const expenseCategories = [
  { group: 'Fixed Costs', label: 'ค่าใช้จ่ายประจำ', items: ['ค่าเช่า', 'เงินเดือน', 'ค่าประกัน', 'ค่าอินเทอร์เน็ต', 'ค่าโทรศัพท์', 'ค่า Software'] },
  { group: 'Operating Expenses', label: 'ค่าใช้จ่ายดำเนินงาน', items: ['น้ำมันนวด', 'ผ้า/ผ้าขนหนู', 'น้ำยาซักผ้า', 'อุปกรณ์สปา', 'น้ำดื่ม', 'ของใช้สิ้นเปลือง', 'ค่าซ่อมแซม'] },
  { group: 'Marketing', label: 'ค่าใช้จ่ายการตลาด', items: ['Facebook/IG Ads', 'โปรโมชั่น/คูปอง', 'Influencer', 'ค่าเว็บไซต์'] },
];
const groupChip = { 'Fixed Costs': 'green', 'Operating Expenses': 'gold', Marketing: 'gray' };

export default function PageExpenses({ data, saveData }) {
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), category: 'Fixed Costs', item: '', amount: '', method: 'เงินสด', approvedBy: '', receiptUrl: '', notes: '' });
  const [saved, setSaved] = useState(false);
  const expenses = [...(data.expenses || [])].reverse();
  const monthTotal = (data.expenses || []).reduce((s, e) => s + e.amount, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.item || !form.amount) return alert('กรุณาเลือกรายการและกรอกจำนวนเงิน');
    const newExpense = { id: `E${String((data.expenses || []).length + 1).padStart(3, '0')}`, ...form, amount: Number(form.amount) };
    saveData({
      ...data,
      expenses: [...(data.expenses || []), newExpense],
      auditLog: [...(data.auditLog || []), {
        id: `A-${Date.now()}`, timestamp: new Date().toISOString(), user: form.approvedBy || 'ระบบ',
        action: 'บันทึกค่าใช้จ่าย', detail: `${newExpense.id} · ${newExpense.item}`, oldValue: '-', newValue: `฿${newExpense.amount}`, approvedBy: form.approvedBy || '-',
      }],
    });
    setForm({ ...form, item: '', amount: '', notes: '' });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <PageHeader icon={LayoutGrid} kicker="Expenses" title="ค่าใช้จ่าย" subtitle="บันทึกรายจ่าย แยกหมวดหมู่ พร้อมผู้อนุมัติ" />

      <div className="statgrid g3">
        {expenseCategories.map((c) => {
          const total = (data.expenses || []).filter((e) => e.category === c.group).reduce((s, e) => s + e.amount, 0);
          return <div key={c.group} className="stat cream"><div className="sl">{c.label}</div><div className="sv" style={{ fontSize: 21 }}>฿{total.toLocaleString()}</div></div>;
        })}
      </div>

      <div className="cols-52">
        <Card>
          <SectionTitle hint="* จำเป็น">ฟอร์มบันทึกค่าใช้จ่าย</SectionTitle>
          <form onSubmit={handleSubmit}>
            <div className="f2">
              <div className="field"><label>วันที่ *</label><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input" /></div>
              <div className="field"><label>จำนวนเงิน (฿) *</label><input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0" className="input" style={{ fontWeight: 600, fontSize: 16 }} /></div>
            </div>
            <div className="field"><label>หมวดหมู่</label>
              <div className="f3">
                {expenseCategories.map((c) => (
                  <button type="button" key={c.group} onClick={() => setForm({ ...form, category: c.group, item: '' })} className={`catbtn${form.category === c.group ? ' on' : ''}`}>{c.label}</button>
                ))}
              </div>
            </div>
            <div className="field"><label>รายการ *</label>
              <div className="itemchips">
                {(expenseCategories.find((c) => c.group === form.category)?.items || []).map((it) => (
                  <button type="button" key={it} onClick={() => setForm({ ...form, item: it })} className={`fchip green${form.item === it ? ' on' : ''}`}>{it}</button>
                ))}
              </div>
            </div>
            <div className="f2">
              <div className="field"><label>วิธีจ่าย</label>
                <select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} className="input">
                  <option>เงินสด</option><option>QR Code</option><option>บัตรเครดิต</option><option>E-Wallet</option><option>โอนเงิน</option>
                </select>
              </div>
              <div className="field"><label>ผู้อนุมัติ</label><input value={form.approvedBy} onChange={(e) => setForm({ ...form, approvedBy: e.target.value })} placeholder="ชื่อผู้อนุมัติ" className="input" /></div>
            </div>
            <div className="field"><label>ใบเสร็จ / หลักฐาน</label>
              <label className="filebtn"><Upload size={16} /><span>{form.receiptUrl ? `แนบแล้ว: ${form.receiptUrl}` : 'แตะเพื่อแนบรูปใบเสร็จ (จำลอง)'}</span>
                <input type="file" hidden onChange={(e) => setForm({ ...form, receiptUrl: e.target.files[0]?.name || '' })} />
              </label>
            </div>
            <div className="field"><label>หมายเหตุ</label><textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="รายละเอียดเพิ่มเติม…" className="input" rows={2} /></div>
            <button type="submit" className="btn-primary"><Plus size={18} /> บันทึกค่าใช้จ่าย {form.amount ? `· ฿${Number(form.amount).toLocaleString()}` : ''}</button>
            {saved && <p className="okmsg"><CheckCircle2 size={14} style={{ verticalAlign: -2 }} /> บันทึกเรียบร้อย</p>}
          </form>
        </Card>

        <div>
          <div className="hero">
            <div className="sl" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.7 }}>รายจ่ายสะสมทั้งหมด</div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 38, fontWeight: 600 }}>฿{monthTotal.toLocaleString()}</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>{(data.expenses || []).length} รายการ</div>
          </div>
          <Card>
            <SectionTitle hint={`${expenses.length} รายการ`}>ประวัติล่าสุด</SectionTitle>
            <div className="scrollbox">
              {expenses.map((exp) => (
                <div key={exp.id} className="expitem">
                  <span className="ic"><Receipt size={16} /></span>
                  <span className="t"><b>{exp.item}</b><span className={`chip ${groupChip[exp.category] || 'gray'}`} style={{ fontSize: 9 }}>{expenseCategories.find((c) => c.group === exp.category)?.label || exp.category}</span> <span className="muted">{exp.date} · {exp.method}</span></span>
                  <span className="p"><b>฿{exp.amount.toLocaleString()}</b><div className="muted">{exp.id}</div></span>
                </div>
              ))}
              {expenses.length === 0 && <EmptyState icon={Receipt} title="ยังไม่มีรายจ่าย" subtitle="บันทึกผ่านฟอร์ม" />}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
