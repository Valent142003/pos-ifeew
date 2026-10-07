import { Calculator, Crown, TrendingUp } from 'lucide-react';
import { PageHeader, Card, SectionTitle, Stat } from '../components/ui';

const TIERS = [
  { max: 30000, rate: 0.30, label: '≤ 30k → 30%' },
  { max: 50000, rate: 0.35, label: '30–50k → 35%' },
  { max: 80000, rate: 0.40, label: '50–80k → 40%' },
  { max: Infinity, rate: 0.45, label: '> 80k → 45%' },
];

export default function PageCommission({ data, saveData }) {
  const therapists = data.therapists || [];
  const bills = (data.bills || []).filter((b) => b.status !== 'cancelled');
  const settings = data.commissionSettings || { mode: 'flat' };

  const stats = {};
  therapists.forEach((t) => { stats[t.id] = { totalSales: 0, flatCommission: 0, jobs: 0, tieredCommission: 0, rate: 0.30, total: 0 }; });
  bills.forEach((bill) => {
    (bill.items || []).forEach((itm) => {
      const s = stats[itm.therapistId];
      if (!s) return;
      const svc = (data.services || []).find((x) => x.id === itm.serviceId);
      if (!svc) return;
      const net = itm.net || 0;
      s.totalSales += net;
      s.jobs += itm.qty || 1;
      s.flatCommission += net * (svc.flatRate || 0);
    });
  });
  therapists.forEach((t) => {
    const s = stats[t.id];
    let comm = 0;
    for (let i = 0; i < TIERS.length; i++) {
      const prev = i === 0 ? 0 : TIERS[i - 1].max;
      const range = Math.min(TIERS[i].max, s.totalSales) - prev;
      if (range > 0) comm += range * TIERS[i].rate;
      if (s.totalSales <= TIERS[i].max) break;
    }
    s.tieredCommission = Math.round(comm);
    s.rate = s.totalSales > 80000 ? 0.45 : s.totalSales > 50000 ? 0.40 : s.totalSales > 30000 ? 0.35 : 0.30;
    s.total = Math.round(settings.mode === 'tier' ? s.tieredCommission : s.flatCommission);
  });

  const ranked = [...therapists].sort((a, b) => stats[b.id].totalSales - stats[a.id].totalSales);
  const sumSales = Object.values(stats).reduce((s, t) => s + t.totalSales, 0);
  const sumComm = Object.values(stats).reduce((s, t) => s + t.total, 0);
  const changeMode = (mode) => saveData({ ...data, commissionSettings: { ...data.commissionSettings, mode } });

  return (
    <div>
      <PageHeader icon={Calculator} kicker="Commission" title="ค่าคอมมิชชัน" subtitle="สรุปยอดขายและคอมมิชชันรายบุคคล แบบ Flat % หรือ Tier สะสม" />

      <div className="modebtns">
        <button onClick={() => changeMode('flat')} className={settings.mode === 'flat' ? 'on' : ''}>Flat % ตามบริการ</button>
        <button onClick={() => changeMode('tier')} className={settings.mode === 'tier' ? 'on' : ''}>Tier ยอดสะสม</button>
      </div>

      {settings.mode === 'tier' && (
        <Card className="tierlegend">
          <div className="chiprow">
            <span className="muted" style={{ alignSelf: 'center', fontSize: 11 }}>ขั้นบันได:</span>
            {TIERS.map((t, i) => <span key={i} className="chip gold">{t.label}</span>)}
          </div>
        </Card>
      )}

      <div className="statgrid g3">
        <Stat tone="green" label="ยอดขายรวม" value={`฿${Math.round(sumSales).toLocaleString()}`} sub={`${bills.length} บิล`} />
        <Stat tone="gold" label={`คอมรวม (${settings.mode === 'flat' ? 'Flat' : 'Tier'})`} value={`฿${Math.round(sumComm).toLocaleString()}`} sub={`${((sumComm / (sumSales || 1)) * 100).toFixed(1)}% ของยอดขาย`} />
        <Stat tone="dark" label="พนักงาน" value={therapists.length} sub="คน" />
      </div>

      <Card className="show-desktop">
        <div className="tablewrap">
          <table className="tbl">
            <thead><tr><th>พนักงาน</th><th className="r">งาน (ครั้ง)</th><th className="r">ยอดขาย</th><th className="r">เรทที่ใช้</th><th className="r">คอมมิชชัน</th></tr></thead>
            <tbody>
              {ranked.map((t, idx) => {
                const s = stats[t.id];
                return (
                  <tr key={t.id}>
                    <td><span className="muted">#{idx + 1}</span> <b style={{ fontWeight: 500 }}>{t.name} <span className="muted">({t.nickname})</span></b> <span className={`chip ${t.role === 'senior' ? 'green' : 'gold'}`}>{t.role === 'senior' ? 'อาวุโส' : 'รุ่นใหม่'}</span></td>
                    <td className="r">{s.jobs}</td>
                    <td className="r">฿{Math.round(s.totalSales).toLocaleString()}</td>
                    <td className="r"><span className="chip dark">{settings.mode === 'tier' ? `${(s.rate * 100).toFixed(0)}%` : 'Flat %'}</span></td>
                    <td className="r"><b style={{ color: '#2C5E3B' }}>฿{s.total.toLocaleString()}</b></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mcards show-mobile">
        {ranked.map((t, idx) => {
          const s = stats[t.id];
          const pct = sumSales ? Math.max((s.totalSales / sumSales) * 100, 2) : 2;
          return (
            <Card key={t.id}>
              <div className="mcard-top">
                <div className="pagehead-main">
                  <div className="tava" style={{ width: 46, height: 46 }}>{t.nickname.charAt(0)}</div>
                  <div><b style={{ fontSize: 14 }}>{t.name} <span className="muted">· {t.nickname}</span></b><div className="muted">#{idx + 1} · {s.jobs} งาน · {t.role === 'senior' ? 'อาวุโส' : 'รุ่นใหม่'}</div></div>
                </div>
                {idx === 0 && s.totalSales > 0 && <span className="chip gold"><Crown size={11} /> Top</span>}
              </div>
              <div className="bar"><i style={{ width: `${pct}%` }} /></div>
              <div className="minigrid3">
                <div className="minibox"><div className="l">ยอดขาย</div><div className="v">฿{Math.round(s.totalSales).toLocaleString()}</div></div>
                <div className="minibox"><div className="l">เรท</div><div className="v">{settings.mode === 'tier' ? `${(s.rate * 100).toFixed(0)}%` : 'Flat'}</div></div>
                <div className="minibox hl"><div className="l">คอม</div><div className="v">฿{s.total.toLocaleString()}</div></div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card>
        <SectionTitle hint="อ้างอิง">เรท Flat % ตามประเภทบริการ</SectionTitle>
        <div className="refgrid">
          {(data.services || []).filter((s) => s.price > 0).map((s) => (
            <div key={s.id} className="refbox"><b>{s.name}</b><small>฿{s.price.toLocaleString()} · <b style={{ color: '#2C5E3B' }}>{(s.flatRate * 100).toFixed(0)}%</b></small></div>
          ))}
        </div>
        <p className="muted" style={{ marginTop: 8 }}><TrendingUp size={12} style={{ verticalAlign: -1 }} /> ยอดขายรวมทั้งหมดใช้คำนวณ Tier แบบขั้นบันได</p>
      </Card>
    </div>
  );
}
