import React, { useState, useEffect } from 'react';

// アイコン代わりの絵文字
const Sun = () => <span>☀️</span>;
const Moon = () => <span>🌙</span>;
const History = () => <span>📋</span>;
const Trash2 = () => <span>🗑️</span>;
const Mic = () => <span>🎤</span>;
const CalendarIcon = () => <span>📅</span>;
const List = () => <span>📜</span>;
const Cloud = () => <span>☁️</span>;
const Shirt = () => <span>👕</span>;
const Download = () => <span>📥</span>;
const AlertCircle = () => <span>⚠️</span>;

const App = () => {
  const [activeTab, setActiveTab] = useState('morning');
  const [logs, setLogs] = useState([]);
  const [viewMode, setViewMode] = useState('list');
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  
  const GAS_URL = "https://script.google.com/macros/s/AKfycbxaGaeo6L708lZYNxTx0sj7fJT8T0X9sonf08pU8UAqZVkzQNRhdZ2iNXegXyNtWohawg/exec";

  // 朝の情報（固定値ですが、服装提案を表示します）
  const weatherInfo = {
    temp: 12,
    condition: '晴れのち曇り',
    clothing: '厚手のコートやマフラーがおすすめです',
  };

  const [morningData, setMorningData] = useState({
    sleepTime: '', wakeTime: '', mood: 5, note: ''
  });

  const [nightData, setNightData] = useState({
    goodThings: ['', '', ''],
    mood: 5,
    thoughts: '',
    medication: false,
    period: false,
    bath: false,
    steps: ''
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

  // CSV書き出し
  const exportToCSV = () => {
    if (logs.length === 0) return;
    const headers = ["日付", "区分", "心情", "メモ"];
    const csvRows = logs.map(log => [
      log.displayDate,
      log.type === 'morning' ? '朝' : '夜',
      log.data.mood,
      log.type === 'morning' ? log.data.note : log.data.thoughts
    ].map(f => `"${f}"`).join(','));
    const content = "\uFEFF" + [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'health_log.csv';
    a.click();
  };

  const renderCalendar = () => {
    const days = [];
    for (let i = 1; i <= 31; i++) {
      days.push(
        <div key={i} className="h-10 border border-slate-100 flex items-center justify-center text-[10px] bg-white">
          {i}
        </div>
      );
    }
    return days;
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-slate-50 min-h-screen font-sans text-slate-800 pb-10">
      <header className="mb-4">
        <h1 className="text-xl font-black text-indigo-900">体調管理ログ</h1>
      </header>

      {/* タブ */}
      <div className="flex mb-4 bg-white rounded-2xl p-1 shadow-sm border border-slate-200">
        <button onClick={() => setActiveTab('morning')} className={`flex-1 py-2.5 rounded-xl text-xs font-black ${activeTab === 'morning' ? 'bg-amber-400 text-white' : 'text-slate-400'}`}><Sun /> 朝</button>
        <button onClick={() => setActiveTab('night')} className={`flex-1 py-2.5 rounded-xl text-xs font-black ${activeTab === 'night' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}><Moon /> 夜</button>
        <button onClick={() => setActiveTab('history')} className={`flex-1 py-2.5 rounded-xl text-xs font-black ${activeTab === 'history' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}><History /> 管理</button>
      </div>

      <main className="space-y-4">
        {activeTab === 'morning' && (
          <div className="space-y-4">
            {/* 服装提案セクション */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-3xl border border-amber-100 shadow-sm">
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center space-x-3">
                  <div className="bg-white p-2 rounded-2xl shadow-sm text-amber-500"><Cloud /></div>
                  <div><p className="text-[10px] font-bold text-amber-700/60 uppercase">Weather</p><p className="text-sm font-black text-amber-900">{weatherInfo.temp}℃ / {weatherInfo.condition}</p></div>
                </div>
                <div className="flex items-start space-x-3 bg-white/50 p-3 rounded-2xl border border-amber-100/50">
                  <Shirt />
                  <div><p className="text-[10px] font-bold text-amber-700/60 uppercase">Recommend</p><p className="text-xs font-bold text-amber-900">{weatherInfo.clothing}</p></div>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><span className="text-[10px] font-black text-slate-300 ml-1">Sleep</span><input type="time" className="w-full p-3 bg-slate-50 rounded-2xl text-sm font-bold" value={morningData.sleepTime} onChange={e => setMorningData({...morningData, sleepTime: e.target.value})} /></div>
                <div className="space-y-1"><span className="text-[10px] font-black text-slate-300 ml-1">Wake</span><input type="time" className="w-full p-3 bg-slate-50 rounded-2xl text-sm font-bold" value={morningData.wakeTime} onChange={e => setMorningData({...morningData, wakeTime: e.target.value})} /></div>
              </div>
              <div className="space-y-3"><span className="text-[10px] font-black text-slate-300 ml-1">Mood ({morningData.mood}/10)</span><input type="range" min="1" max="10" className="w-full accent-amber-400" value={morningData.mood} onChange={e => setMorningData({...morningData, mood: parseInt(e.target.value)})} /></div>
              <textarea className="w-full p-4 bg-slate-50 rounded-2xl h-24 text-sm" placeholder="朝のメモ..." value={morningData.note} onChange={e => setMorningData({...morningData, note: e.target.value})} />
              <button onClick={() => saveLog('morning')} className="w-full bg-amber-400 text-white font-black py-4 rounded-2xl shadow-xl shadow-amber-100 uppercase tracking-widest text-sm">Save Morning</button>
            </div>
          </div>
        )}

        {activeTab === 'night' && (
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-6">
            <div className="space-y-3">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">3 Good Things</span>
              {nightData.goodThings.map((t, i) => (
                <input key={i} className="w-full p-3 bg-slate-50 rounded-2xl text-sm font-medium outline-none" placeholder={`${i+1}つ目のいいこと`} value={t} onChange={e => { const nt = [...nightData.goodThings]; nt[i] = e.target.value; setNightData({...nightData, goodThings: nt}); }} />
              ))}
            </div>
            
            {/* 夜の追加項目（チェックボックス・歩数） */}
            <div className="grid grid-cols-2 gap-3">
              {['medication', 'bath', 'period'].map(key => (
                <button key={key} onClick={() => setNightData({...nightData, [key]: !nightData[key]})} className={`p-3 rounded-2xl text-[10px] font-black border transition-all ${nightData[key] ? 'bg-indigo-600 text-white' : 'bg-white text-slate-300 border-slate-100'}`}>
                  {key === 'medication' ? 'Meds' : key === 'bath' ? 'Bath' : 'Cycle'}
                </button>
              ))}
              <div className="flex items-center bg-slate-50 rounded-2xl px-3"><span className="text-[9px] font-black text-slate-300 mr-2 uppercase">Steps</span><input type="number" className="w-full bg-transparent border-none text-xs font-bold text-right outline-none py-2.5" value={nightData.steps} onChange={e => setNightData({...nightData, steps: e.target.value})} /></div>
            </div>

            <div className="space-y-3"><span className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">Mood ({nightData.mood}/10)</span><input type="range" min="1" max="10" className="w-full accent-indigo-600" value={nightData.mood} onChange={e => setNightData({...nightData, mood: parseInt(e.target.value)})} /></div>
            <textarea className="w-full p-4 bg-slate-50 rounded-2xl h-24 text-sm" placeholder="夜の振り返り..." value={nightData.thoughts} onChange={e => setNightData({...nightData, thoughts: e.target.value})} />
            <button onClick={() => saveLog('night')} className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-100 uppercase tracking-widest text-sm">Save Night</button>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-3 rounded-2xl border border-slate-100">
              <div className="flex space-x-2">
                <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-slate-100 text-indigo-600' : 'text-slate-300'}`}><List /></button>
                <button onClick={() => setViewMode('calendar')} className={`p-2 rounded-lg ${viewMode === 'calendar' ? 'bg-slate-100 text-indigo-600' : 'text-slate-300'}`}><CalendarIcon /></button>
              </div>
              <div className="flex space-x-2">
                <button onClick={exportToCSV} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Download /></button>
                <button onClick={() => setShowConfirmClear(true)} className="p-2 bg-rose-50 text-rose-600 rounded-lg"><Trash2 /></button>
              </div>
            </div>

            {viewMode === 'calendar' ? (
              <div className="bg-white p-4 rounded-3xl grid grid-cols-7 gap-1 border border-slate-100">
                {renderCalendar()}
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {logs.map(log => (
                  <div key={log.id} className="p-4 bg-white border border-slate-100 rounded-3xl relative">
                    <button onClick={() => deleteLog(log.id)} className="absolute top-4 right-4 text-slate-200"><Trash2 /></button>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-black ${log.type === 'morning' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>{log.type.toUpperCase()}</span>
                      <span className="text-[9px] font-bold text-slate-300">{log.displayDate}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-600 italic truncate">「{log.type === 'morning' ? log.data.note : log.data.thoughts}」</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* 削除モーダル */}
      {showConfirmClear && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-xs rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-center text-rose-500"><AlertCircle /></div>
            <h3 className="font-black text-slate-800 text-center">記録をすべて削除しますか？</h3>
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
