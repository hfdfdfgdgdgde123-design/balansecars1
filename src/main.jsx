import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowDown, ArrowUp, ArrowUpDown, BadgeCheck, BatteryCharging, CarFront, Check, ChevronRight, Gauge, Menu, Moon, Mountain, Plus, Search, ShieldCheck, SlidersHorizontal, Sparkles, Sun, Trophy, Volume2, VolumeX, Wind, X, Zap } from 'lucide-react';
import cars from '../work/cars.json';
import './styles.css';
import { supabase } from './supabase';

const fields = [
  { key: 'zero100', label: '0–100', unit: 'с', lower: true },
  { key: 'zero200', label: '0–200', unit: 'с', lower: true },
  { key: 'zero300', label: '0–300', unit: 'с', lower: true },
  { key: 'zeroMax', label: '0–макс', unit: 'с', lower: true },
  { key: 'topSpeed', label: 'Макс. скорость', unit: 'км/ч', lower: false },
  { key: 'lap', label: 'Кольцо', unit: 'с', lower: true },
];

fields.find(field => field.key === 'lap').lower = false;
const timeFields = new Set(['zero100', 'zero200', 'zero300', 'zeroMax', 'lap']);
const parseMetric = (raw, key) => {
  if (raw == null || raw === '' || raw === '-') return null;
  const value = String(raw).replace(',', '.').trim();
  if (!timeFields.has(key) || !value.includes('.')) return Number(value) || null;
  const [seconds, frames] = value.split('.');
  return (Number(seconds) || 0) + (Number(frames) || 0) / 60;
};
const toSeconds = (raw, key) => {
  if (raw == null || raw === '' || raw === '-') return '—';
  const value = parseMetric(raw, key);
  if (value == null || Number.isNaN(value)) return '—';
  return timeFields.has(key) ? value.toFixed(2).replace('.', ',') : String(raw);
};
const suppliedValues = {
  121: { zero100: '33:26' },
  137: { zero100: '02:09' },
  158: { zero100: '4:27' },
  159: { zero100: '5:06' },
};
const carData = cars.map(car => {
  const merged = { ...car, ...(suppliedValues[car.id] || {}) };
  return { ...merged, numeric: Object.fromEntries(fields.map(f => [f.key, parseFloat(String(merged[f.key]).replace(',', '.')) || null])) };
});
const val = (car, key) => car[key] && car[key] !== '-' ? car[key] : '—';
const format = (car, key) => val(car, key);

function Logo() {
  return <a className="logo" href="#top" aria-label="Balance Cars"><span className="logo-mark"><span /></span><span>Balance</span></a>;
}

const accents = ['#147ce5', '#e85d75', '#ef9b35', '#20a875', '#8a63d2', '#12a6b5'];
const traits = ['Точная настройка', 'Гоночный характер', 'Сила и баланс', 'Чистая аэродинамика', 'Инженерная смелость', 'Комфорт на скорости'];

const carTypeIcon = { police: ShieldCheck, electric: BatteryCharging, offroad: Mountain, convertible: Wind, sport: BadgeCheck, classic: CarFront };
const carTypeLabel = { police: '\u0414\u041f\u0421 / \u0433\u043e\0441\u0442\0440\u0430\043d\0441\u043f\u043e\0440\u0442', electric: '\u042d\u043b\u0435\u043a\0442\0440\u043e\u043a\u0430\u0440', offroad: '\u0412\u043d\0435\0434\u043e\0440\u043e\0436\u043d\u0438\u043a', convertible: '\u041a\u0430\u0431\0440\u0438\u043e\u043b\u0435\u0442', sport: '\u0421\u043f\u043e\u0440\u0442\u043a\u0430\u0440', classic: '\u041a\u043b\u0430\u0441\u0441\u0438\u043a' };
Object.assign(carTypeLabel, {
  police: String.fromCharCode(0x0414,0x041f,0x0421) + ' / ' + String.fromCharCode(0x0433,0x043e,0x0441,0x0442,0x0440,0x0430,0x043d,0x0441,0x043f,0x043e,0x0440,0x0442),
  offroad: String.fromCharCode(0x0412,0x043d,0x0435,0x0434,0x043e,0x0440,0x043e,0x0436,0x043d,0x0438,0x043a),
  convertible: String.fromCharCode(0x041a,0x0430,0x0431,0x0440,0x0438,0x043e,0x043b,0x0435,0x0442),
});

function getCarMeta(car) {
  const name = String(car?.name || '').toLowerCase();
  const has = (...words) => words.some(word => name.includes(word));
  let type = 'sport';
  if (has('\u0434\u043f\u0441', '\u0433\u0438\u0431\u0434\u0434', '\u0441\u043b\u0443\u0436\u0435\u0431', '\u0433\u043e\u0441\u0443\u0434\u0430\u0440\u0441\u0442\u0432')) type = 'police';
  else if (has('\u0442\u0435\u0441\u043b\u0430', '\u044d\u043b\u0435\u043a\u0442\u0440', '\u044d\u0432\u043e', 'model s', 'model 3', 'model x', 'model y')) type = 'electric';
  else if (has('\u043a\u0430\u0431\u0440\u0438\u043e', '\u0441\u043f\u0430\u0439\u0434\u0435\u0440', '\u0440\u043e\u0434\u0441\u0442\u0435\u0440')) type = 'convertible';
  else if (has('\u043d\u0438\u0432\u0430', '\u043a\u0440\u043e\u0441\u0441', '\u0443\u0440\u0443\u0441', '\u0445\u0430\u0439\u043b\u044e\u043a\u0441', '\u0440\u0430\u043f\u0442\u043e\u0440', '\u0440\u0430\u043d\u0433\u043b\u0435\u0440', '\u0434\u0436\u0438\u043f', 'q7', 'x5', 'x7')) type = 'offroad';
  else if (car.numeric?.topSpeed && car.numeric.topSpeed < 210) type = 'classic';
  const Icon = carTypeIcon[type];
  return { type, Icon, label: carTypeLabel[type], accent: type === 'police' ? '#2b8cff' : type === 'electric' ? '#18c887' : accents[(car?.id || 0) % accents.length], variant: `${type} variant-${(car?.id || 0) % 4} ${car?.id === 20 ? 'valhalla' : ''}` };
}

function CarTypeBadge({ car }) {
  const meta = getCarMeta(car);
  return <span className={`car-type-badge ${meta.type}`} title={meta.label}><meta.Icon size={13}/><span>{meta.label}</span></span>;
}

function MiniCar({ car, large = false }) {
  const meta = getCarMeta(car);
  return <div className={`mini-car ${large ? 'large' : ''} ${meta.variant}`} style={{ '--accent': meta.accent, '--car-lean': `${((car?.id || 0) % 5) - 2}deg` }} aria-label={`РњРёРЅРё-РјРѕРґРµР»СЊ ${car?.name || 'Р°РІС‚РѕРјРѕР±РёР»СЏ'}`}>
    <div className="mini-car-glow" />
    <div className="mini-car-roof"><span /></div>
    <div className="mini-car-body"><i className="lamp"/><i className="lamp rear"/><b className="detail" /></div>
    {meta.type === 'police' && <div className="mini-car-lightbar"><i/><i/></div>}
    {meta.type === 'electric' && <div className="mini-car-charge" />}
    <div className="mini-wheel left"/><div className="mini-wheel right"/>
    <div className="mini-car-line" />
  </div>;
}
  /*
  const index = (car?.id || 0) % accents.length;
  const accent = accents[index];
  return <div className={`mini-car ${large ? 'large' : ''}`} style={{ '--accent': accent }} aria-label={`Мини-модель ${car?.name || 'автомобиля'}`}>
    <div className="mini-car-glow" />
    <div className="mini-car-roof"><span /></div>
    <div className="mini-car-body"><i className="lamp"/><i className="lamp rear"/><b className="detail" /></div>
    <div className="mini-wheel left"/><div className="mini-wheel right"/>
    <div className="mini-car-line" />
  </div>;
  */

function speakCar(car) {
  if (!('speechSynthesis' in window) || !car) return;
  window.speechSynthesis.cancel();
  const trait = traits[(car.id || 0) % traits.length];
  const text = `${car.name}. Особенность: ${trait}. Максимальная скорость ${car.topSpeed || 'не указана'} километров в час. Разгон до ста: ${car.zero100 || 'не указан'} секунд.`;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ru-RU';
  utterance.rate = 0.95;
  window.speechSynthesis.speak(utterance);
}

function uiSound(type = 'hover') {
  if (typeof window === 'undefined') return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const ctx = window.__balanceAudio || (window.__balanceAudio = new AudioContext());
  if (ctx.state === 'suspended') ctx.resume();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const now = ctx.currentTime;
  osc.type = 'sine';
  osc.frequency.setValueAtTime(type === 'click' ? 520 : 720, now);
  osc.frequency.exponentialRampToValueAtTime(type === 'click' ? 380 : 610, now + .07);
  gain.gain.setValueAtTime(.0001, now);
  gain.gain.exponentialRampToValueAtTime(type === 'click' ? .035 : .012, now + .008);
  gain.gain.exponentialRampToValueAtTime(.0001, now + .085);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now); osc.stop(now + .09);
}

function App() {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState({ key: 'id', dir: 'asc' });
  const [speed, setSpeed] = useState('all');
  const [selected, setSelected] = useState([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [muted, setMuted] = useState(false);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [adminOpen, setAdminOpen] = useState(false);

  useEffect(() => { document.documentElement.dataset.theme = dark ? 'dark' : 'light'; }, [dark]);
  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => { if (active) setSession(data.session); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);
  useEffect(() => {
    if (!session?.user?.id) { setProfile(null); return; }
    supabase.from('profiles').select('id,email,role,can_view_catalog').eq('id', session.user.id).maybeSingle().then(({ data }) => setProfile(data));
  }, [session]);
  useEffect(() => {
    const onOver = e => { if (e.target.closest('button')) uiSound('hover'); };
    const onDown = e => { if (e.target.closest('button')) uiSound('click'); };
    document.addEventListener('pointerover', onOver);
    document.addEventListener('pointerdown', onDown);
    return () => { document.removeEventListener('pointerover', onOver); document.removeEventListener('pointerdown', onDown); };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('ru');
    return carData.filter(car => (!q || `${car.name} ${car.price}`.toLocaleLowerCase('ru').includes(q)) &&
      (speed === 'all' || (car.numeric.topSpeed && car.numeric.topSpeed >= Number(speed))))
      .sort((a,b) => {
        const av = sort.key === 'id' ? a.id : sort.key === 'name' ? a.name : a.numeric[sort.key];
        const bv = sort.key === 'id' ? b.id : sort.key === 'name' ? b.name : b.numeric[sort.key];
        if (av == null) return 1; if (bv == null) return -1;
        return (typeof av === 'string' ? av.localeCompare(bv, 'ru') : av - bv) * (sort.dir === 'asc' ? 1 : -1);
      });
  }, [query, speed, sort]);

  const selectedCars = selected.map(id => carData.find(c => c.id === id)).filter(Boolean);
  const toggle = id => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 4 ? [...prev, id] : prev);
  const sortBy = key => setSort(prev => ({ key, dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc' }));
  const SortIcon = ({field}) => sort.key !== field ? <ArrowUpDown size={13}/> : sort.dir === 'asc' ? <ArrowUp size={13}/> : <ArrowDown size={13}/>;

  useEffect(() => { document.body.style.overflow = compareOpen ? 'hidden' : ''; return () => document.body.style.overflow = ''; }, [compareOpen]);

  const leader = useMemo(() => [...carData].filter(c=>c.numeric.zero100).sort((a,b)=>a.numeric.zero100-b.numeric.zero100)[0], []);
  const fastest = useMemo(() => [...carData].filter(c=>c.numeric.topSpeed).sort((a,b)=>b.numeric.topSpeed-a.numeric.topSpeed)[0], []);

  return <>
    <header className="nav">
      <div className="nav-inner"><Logo/><nav className={menuOpen ? 'open' : ''}><a href="#catalog" onClick={()=>setMenuOpen(false)}>Каталог</a><a href="#highlights" onClick={()=>setMenuOpen(false)}>Лидеры</a><button className="nav-compare" onClick={()=>setCompareOpen(true)}>Сравнение <span>{selected.length}</span></button></nav><div className="nav-tools">{profile?.role === 'admin' && <button className="account-button admin-button" onClick={()=>setAdminOpen(true)}>Админ</button>}{session ? <button className="account-button" onClick={()=>supabase.auth.signOut()}>{profile?.email || 'Выйти'}</button> : <button className="account-button" onClick={()=>{setAuthMode('login');setAuthOpen(true)}}>Войти</button>}<button className="icon-button" onClick={()=>setDark(v=>!v)} aria-label="Переключить тему">{dark?<Sun/>:<Moon/>}</button><button className="icon-button" onClick={()=>{setMuted(v=>!v); if (!muted && leader) speakCar(leader)}} aria-label="Включить или выключить озвучку">{muted?<VolumeX/>:<Volume2/>}</button><button className="menu" onClick={()=>setMenuOpen(!menuOpen)} aria-label="Меню">{menuOpen?<X/>:<Menu/>}</button></div></div>
    </header>

    <main id="top">
      <section className="hero">
        <div className="ambient one"/><div className="ambient two"/>
        <div className="eyebrow"><Sparkles size={14}/> 171 автомобиль. Одна база.</div>
        <h1>Выбери скорость.<br/><span>Без компромиссов.</span></h1>
        <p>Все характеристики Balance Cars в понятном каталоге. Ищи, сортируй и сравнивай лучшие машины за секунды.</p>
        <div className="hero-actions"><a className="button primary" href="#catalog">Открыть каталог <ChevronRight size={17}/></a><button className="button secondary" onClick={()=>setCompareOpen(true)}>Сравнить авто</button></div>
        <div className="speedline" aria-hidden="true"><div className="car-silhouette"><span className="roof"/><span className="body"/><i/><i/></div></div>
      </section>

      <section className="highlights shell" id="highlights">
        <article className="highlight dark"><div><span className="card-label"><Zap size={15}/> Самый быстрый разгон</span><h2>{leader.name}</h2><p>0–100 км/ч</p></div><strong>{leader.zero100}<small> с</small></strong></article>
        <article className="highlight blue"><div><span className="card-label"><Gauge size={15}/> Максимальная скорость</span><h2>{fastest.name}</h2><p>Абсолютный лидер базы</p></div><strong>{fastest.topSpeed}<small> км/ч</small></strong></article>
        <article className="highlight light"><div><span className="card-label"><Trophy size={15}/> В базе сегодня</span><h2>Полный каталог</h2><p>Актуальные замеры</p></div><strong>171<small> авто</small></strong></article>
      </section>

      <section className="catalog shell" id="catalog">
        <div className="section-head"><div><span className="kicker">База автомобилей</span><h2>Найди свою.</h2></div><p>{filtered.length} из {carData.length}</p></div>
        <div className="toolbar">
          <label className="search"><Search size={19}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Поиск по названию или цене"/><kbd>⌘ K</kbd></label>
          <label className="filter"><SlidersHorizontal size={17}/><select value={speed} onChange={e=>setSpeed(e.target.value)}><option value="all">Любая скорость</option><option value="250">от 250 км/ч</option><option value="300">от 300 км/ч</option><option value="350">от 350 км/ч</option></select></label>
        </div>

        <div className="table-wrap">
          <table><thead><tr><th onClick={()=>sortBy('name')}>Автомобиль <SortIcon field="name"/></th><th>Цена</th>{fields.map(f=><th key={f.key} onClick={()=>sortBy(f.key)}>{f.label} <SortIcon field={f.key}/></th>)}<th/></tr></thead>
            <tbody>{filtered.map((car, index)=><tr key={car.id} className={selected.includes(car.id)?'selected':''}>
              <td><div className="rank">{String(index+1).padStart(2,'0')}</div><div><b>{car.name}</b><CarTypeBadge car={car}/></div></td>
              <td className="price">{car.price || '—'}</td>{fields.map(f=><td key={f.key}><span className={f.key==='topSpeed'?'speed-value':''}>{format(car,f.key)}</span>{val(car,f.key)!=='—' && <small>{f.unit}</small>}</td>)}
              <td><div className="row-actions"><button className="listen" onClick={()=>!muted && speakCar(car)} aria-label={`Озвучить ${car.name}`}><Volume2 size={14}/></button><button className="add" aria-label={`Добавить ${car.name} к сравнению`} onClick={()=>toggle(car.id)} disabled={!selected.includes(car.id)&&selected.length>=4}>{selected.includes(car.id)?<Check/>:<Plus/>}</button></div></td>
            </tr>)}</tbody></table>
          {!filtered.length && <div className="empty"><Search/><h3>Ничего не найдено</h3><p>Попробуй изменить запрос или фильтр.</p><button onClick={()=>{setQuery('');setSpeed('all')}}>Сбросить фильтры</button></div>}
        </div>
      </section>
    </main>

    {selected.length>0 && <div className="compare-bar"><div className="compare-list">{selectedCars.map(c=><div className="compare-chip" key={c.id}><span>{c.name}</span><button onClick={()=>toggle(c.id)}><X size={14}/></button></div>)}{Array.from({length:4-selected.length}).map((_,i)=><div className="compare-slot" key={i}><Plus size={14}/><span>Добавить</span></div>)}</div><button className="compare-cta" onClick={()=>setCompareOpen(true)}>Сравнить <span>{selected.length}</span></button></div>}

    {compareOpen && <Compare cars={selectedCars} allCars={carData} onClose={()=>setCompareOpen(false)} onToggle={toggle}/>} 
    {authOpen && <AuthModal mode={authMode} onModeChange={setAuthMode} onClose={()=>setAuthOpen(false)}/>} 
    {adminOpen && <AdminPanel onClose={()=>setAdminOpen(false)}/>} 

    <footer><div className="shell"><Logo/><p>Данные перенесены из Balance Cars Database.</p><span>© 2026</span></div></footer>
  </>;
}

function AuthModal({ mode, onModeChange, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const submit = async event => {
    event.preventDefault();
    setBusy(true); setMessage('');
    const result = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
    setBusy(false);
    if (result.error) setMessage(result.error.message);
    else if (mode === 'register' && !result.data.session) setMessage('Проверь почту и подтверди регистрацию.');
    else onClose();
  };
  return <div className="auth-modal modal" role="dialog" aria-modal="true"><div className="auth-panel modal-panel">
    <button className="close auth-close" onClick={onClose}><X/></button>
    <span className="kicker">Balance Cars Account</span><h2>{mode === 'login' ? 'Вход' : 'Регистрация'}</h2>
    <p className="auth-subtitle">Сохраняй доступ к каталогу и сравнениям в своём аккаунте.</p>
    <form onSubmit={submit} className="auth-form"><label>Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></label><label>Пароль<input type="password" required minLength={6} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Минимум 6 символов"/></label>{message&&<p className="auth-message">{message}</p>}<button className="button primary" disabled={busy}>{busy?'Загрузка...':mode === 'login' ? 'Войти' : 'Создать аккаунт'}</button></form>
    <button className="auth-switch" onClick={()=>{setMessage('');onModeChange(mode === 'login' ? 'register' : 'login')}}>{mode === 'login' ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}</button>
  </div></div>;
}

function AdminPanel({ onClose }) {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const load = async () => { setLoading(true); const { data, error } = await supabase.from('profiles').select('id,email,role,can_view_catalog,created_at').order('created_at',{ascending:false}); if (error) setMessage(error.message); else setProfiles(data || []); setLoading(false); };
  useEffect(() => { load(); }, []);
  const toggleAccess = async profile => { const { error } = await supabase.from('profiles').update({ can_view_catalog: !profile.can_view_catalog }).eq('id', profile.id); if (error) setMessage(error.message); else setProfiles(items => items.map(item => item.id === profile.id ? {...item, can_view_catalog: !item.can_view_catalog} : item)); };
  return <div className="admin-modal modal" role="dialog" aria-modal="true"><div className="admin-panel modal-panel"><div className="modal-head"><div><span className="kicker">Только для администратора</span><h2>Админ-панель</h2></div><button className="close" onClick={onClose}><X/></button></div><p className="auth-subtitle">Выдавай или отзывай доступ пользователей к каталогу.</p>{message&&<p className="auth-message">{message}</p>}{loading?<div className="admin-loading">Загрузка пользователей...</div>:<div className="users-list">{profiles.map(item=><div className="user-row" key={item.id}><div><b>{item.email}</b><small>{item.role === 'admin' ? 'Администратор' : item.can_view_catalog ? 'Доступ к каталогу' : 'Доступ закрыт'}</small></div><button className={`access-toggle ${item.can_view_catalog ? 'enabled' : ''}`} disabled={item.role === 'admin'} onClick={()=>toggleAccess(item)}>{item.role === 'admin' ? 'Владелец' : item.can_view_catalog ? 'Отозвать' : 'Выдать доступ'}</button></div>)}</div>}</div></div>;
}

function Compare({cars, allCars, onClose, onToggle}) {
  const [picker, setPicker] = useState('');
  const available = allCars.filter(c=>!cars.some(x=>x.id===c.id) && c.name.toLowerCase().includes(picker.toLowerCase())).slice(0,8);
  const best = key => {
    const f=fields.find(x=>x.key===key), nums=cars.map(c=>c.numeric[key]).filter(v=>v!=null);
    return nums.length ? (f.lower ? Math.min(...nums) : Math.max(...nums)) : null;
  };
  return <div className="modal" role="dialog" aria-modal="true"><div className="modal-panel">
    <div className="modal-head"><div><span className="kicker">До четырёх автомобилей</span><h2>Сравнение</h2></div><button className="close" onClick={onClose}><X/></button></div>
    {!cars.length ? <div className="empty compare-empty"><Gauge/><h3>Добавь автомобили</h3><p>Выбери машины в каталоге или найди их ниже.</p></div> : <div className="comparison-grid" style={{'--count':cars.length}}>
      <div className="metric-col"><div className="compare-car blank"/><div>Цена</div>{fields.map(f=><div key={f.key}>{f.label}<small>{f.unit}</small></div>)}</div>
      {cars.map(c=><div className="vehicle-col" key={c.id}><div className="compare-car"><button onClick={()=>onToggle(c.id)}><X size={14}/></button><div className="compare-car-art"><MiniCar car={c} large/></div><span>#{String(c.id).padStart(3,'0')}</span><CarTypeBadge car={c}/><h3>{c.name}</h3><small className="trait">{traits[(c.id || 0) % traits.length]}</small><button className="speak-car" onClick={()=>speakCar(c)} aria-label={`Озвучить ${c.name}`}><Volume2 size={13}/></button></div><div className="metric-value">{c.price||'—'}</div>{fields.map(f=><div className={`metric-value ${c.numeric[f.key]!=null&&c.numeric[f.key]===best(f.key)&&cars.length>1?'winner':''}`} key={f.key}>{val(c,f.key)}{c.numeric[f.key]!=null&&c.numeric[f.key]===best(f.key)&&cars.length>1&&<Trophy size={13}/>}</div>)}</div>)}
    </div>}
    {cars.length<4 && <div className="picker"><Search size={18}/><input value={picker} onChange={e=>setPicker(e.target.value)} placeholder="Добавить автомобиль к сравнению"/>{picker && <div className="picker-results">{available.map(c=><button key={c.id} onClick={()=>{onToggle(c.id);setPicker('')}}><span>{c.name}</span><Plus size={15}/></button>)}{!available.length&&<p>Ничего не найдено</p>}</div>}</div>}
  </div></div>;
}

createRoot(document.getElementById('root')).render(<App/>);
