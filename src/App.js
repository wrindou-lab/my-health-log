import React, { useState, useEffect } from 'react';

// アイコンを絵文字で代用し、エラーを確実に回避します
const Sun = () => <span>☀️</span>;
const Moon = () => <span>🌙</span>;
const History = () => <span>📋</span>;
const Trash2 = () => <span>🗑️</span>;
const Mic = () => <span>🎤</span>;
const CalendarIcon = () => <span>📅</span>;
const List = () => <span>📜</span>;
const Cloud = () => <span>☁️</span>;
const Shirt = () => <span>👕</span>;
const RefreshCw = () => <span>🔄</span>;
const Download = () => <span>📥</span>;
const AlertCircle = () => <span>⚠️</span>;

const App = () => {
  const [activeTab, setActiveTab] = useState('morning');
  const [logs, setLogs] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  
  const GAS_URL = "https://script.google.com/macros/s/AKfycbxaGaeo6L708lZYNxTx0sj7fJT8T0X9sonf08pU8UAqZVkzQNRhdZ2iNXegXyNtWohawg/exec";

  const [weatherInfo, setWeatherInfo] = useState({
    temp: 12, condition: '晴れのち曇り', clothing: '厚手のコートやマフラーがおすすめです',
  });

  const [morningData, setMorningData] = useState({
    sleepTime: '', wakeTime: '', mood: 5, note: ''
  });

  const [nightData, setNightData] = useState({
    goodThings: ['', '', ''], mood: 5, thoughts: '', medication: false, period: false, bath: false, steps: ''
  });

  useEffect(() => {
    const savedLogs = localStorage.getItem('health_logs_v6');
    if (savedLogs) setLogs(JSON.parse(savedLogs));
  }, []);

  const saveLog = async (type) => {
    const now = new Date();
    const newLog = {
      id: Date.now(),
      date: now.toISOString().split('T')[0],
      displayDate: now.toLocaleDateString(),
      timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type,
      data: type === 'morning' ? { ...morningData, weather: weatherInfo } : { ...nightData }
    };

    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    localStorage.setItem('health_logs_v6', JSON.stringify(updatedLogs));

    try {
      fetch(GAS_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLog),
      });
    } catch (error) {
      console.error("GAS送信エラー:", error);
    }
    
    if (type === 'morning') setMorningData({ sleepTime: '', wakeTime: '', mood: 5, note: '' });
    else setNightData({ goodThings: ['', '', ''], mood: 5, thoughts: '', medication: false, period: false, bath: false, steps: '' });
  };

  const deleteLog = (id) => {
    const updatedLogs = logs.filter(log => log.id !== id);
    setLogs(updatedLogs);
    localStorage.setItem('health_logs_v6', JSON.stringify(updatedLogs));
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-slate-50 min-h-screen font-sans text-slate-800 pb-10">
      <header className="mb-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black text-indigo-900 tracking-tight">体調管理ログ</h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </header>

      {/* タブ切り替え */}
      <div className="flex mb-4 bg-white rounded-2xl p-1 shadow-sm border border-slate-200">
        <button onClick={() => setActiveTab('morning')} className={`flex-1 py-2.5 rounded-xl text-xs transition-all flex items-center justify-center font-black ${activeTab === 'morning' ? 'bg-amber-400 text-white shadow-md' : 'text-slate-400'}`}><Sun /> 朝</button>
        <button onClick={() => setActiveTab('night')} className={`flex-1 py-2.5 rounded-xl text-xs transition-all flex items-center justify-center font-black ${activeTab === 'night' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'}`}><Moon /> 夜</button>
        <button onClick={() => setActiveTab('history')} className={`flex-1 py-2.5 rounded-xl text-xs transition-all flex items-center justify-center font-black ${activeTab === 'history' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400'}`}><History /> 管理</button>
      </div>

      <main className="space-y-4">
        {activeTab === 'morning' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-3xl border border-amber-100 shadow-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white p-2 rounded-2xl shadow-sm text-amber-500"><Cloud /></div>
                    <div><p className="text-[10px] font-bold text-amber-700/60 uppercase">Weather</p><p className="text-sm font-black text-amber-900">{weatherInfo.temp}℃ / {weatherInfo.condition}</p></div>
                  </div>
                </div>
            </div>
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <input type="time" className="w-full p-3 bg-slate-50 border-none rounded-2xl text-sm font-bold" value={morningData.sleepTime} onChange={e => setMorningData({...morningData, sleepTime: e.target.value})} />
                <input type="time" className="w-full p-3 bg-slate-50 border-none rounded-2xl text-sm font-bold" value={morningData.wakeTime} onChange={e => setMorningData({...morningData, wakeTime: e.target.value})} />
              </div>
              <div className="space-y-3"><span className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">Mood ({morningData.mood}/10)</span><input type="range" min="1" max="10" className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-amber-400" value={morningData.mood} onChange={e => setMorningData({...morningData, mood: parseInt(e.target.value)})} /></div>
              <div className="space-y-1">
                <textarea className="w-full p-4 bg-slate-50 border-none rounded-2xl h-24 text-sm font-medium outline-none resize-none placeholder:text-slate-200" placeholder="今の心境をどうぞ..." value={morningData.note} onChange={e => setMorningData({...morningData, note: e.target.value})} />
              </div>
              <button onClick={() => saveLog('morning')} className="w-full bg-amber-400 hover:bg-amber-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-amber-100 transition-all uppercase tracking-widest text-sm">Save Morning</button>
            </div>
          </div>
        )}

        {activeTab === 'night' && (
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-6">
            <div className="space-y-3">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">3 Good Things</span>
              {nightData.goodThings.map((t, i) => (
                <div key={i} className="flex items-center bg-slate-50 rounded-2xl px-3 border border-transparent focus-within:border-indigo-100 transition-all">
                  <span className="text-indigo-200 font-black mr-2 text-xs">{i+1}</span>
                  <input className="w-full p-2.5 bg-transparent border-none text-sm font-medium outline-none" value={t} onChange={e => { const nt = [...nightData.goodThings]; nt[i] = e.target.value; setNightData({...nightData, goodThings: nt}); }} />
                </div>
              ))}
            </div>
            <button onClick={() => saveLog('night')} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-100 transition-all uppercase tracking-widest text-sm">Save Night</button>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-3 rounded-2xl border border-slate-100">
               <button onClick={() => setShowConfirmClear(true)} className="p-2 bg-rose-50 text-rose-600 rounded-lg"><Trash2 /></button>
            </div>
            <div className="space-y-3">
                {logs.length === 0 ? (
                  <div className="text-center py-10 text-slate-300 text-xs font-bold uppercase tracking-widest">No Logs Yet</div>
                ) : logs.map(log => (
                  <div key={log.id} className="p-4 bg-white border border-slate-100 rounded-3xl relative">
                    <button onClick={() => deleteLog(log.id)} className="absolute top-4 right-4 text-slate-200"><Trash2 /></button>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-black ${log.type === 'morning' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>{log.type.toUpperCase()}</span>
                      <span className="text-[9px] font-bold text-slate-300">{log.displayDate}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-600 leading-relaxed italic truncate">「{log.type === 'morning' ? log.data.note : log.data.thoughts}」</p>
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>

      {showConfirmClear && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-xs rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="font-black text-slate-800 tracking-tight text-center">記録をすべて削除しますか？</h3>
            <div className="flex space-x-3">
              <button onClick={() => setShowConfirmClear(false)} className="flex-1 py-3 bg-slate-100 rounded-xl text-xs font-black text-slate-400">Cancel</button>
              <button onClick={() => { setLogs([]); localStorage.removeItem('health_logs_v6'); setShowConfirmClear(false); }} className="flex-1 py-3 bg-rose-600 rounded-xl text-xs font-black text-white">Clear All</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
