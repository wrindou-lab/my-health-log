import React, { useState, useEffect } from 'react';
import { 
  Sun, Moon, History, Trash2, Mic, Calendar as CalendarIcon, 
  List, CheckCircle2, Cloud, Shirt, RefreshCw, Download, AlertCircle
} from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('morning');
  const [logs, setLogs] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  
  const GAS_URL = "https://script.google.com/macros/s/AKfycbxaGaeo6L708lZYNxTx0sj7fJT8T0X9sonf08pU8UAqZVkzQNRhdZ2iNXegXyNtWohawg/exec";

  const [weatherInfo, setWeatherInfo] = useState(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);

  const [morningData, setMorningData] = useState({
    sleepTime: '', wakeTime: '', mood: 5, note: ''
  });

  const [nightData, setNightData] = useState({
    goodThings: ['', '', ''], mood: 5, thoughts: '', medication: false, period: false, bath: false, steps: ''
  });

  useEffect(() => {
    const savedLogs = localStorage.getItem('health_logs_v6');
    if (savedLogs) setLogs(JSON.parse(savedLogs));
    fetchWeather();
  }, []);

  const fetchWeather = () => {
    setIsLoadingWeather(true);
    setTimeout(() => {
      setWeatherInfo({
        temp: 12, condition: '晴れのち曇り', clothing: '厚手のコートやマフラーがおすすめです',
      });
      setIsLoadingWeather(false);
    }, 1000);
  };

  const handleVoiceInput = (targetField, setter, currentState) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = 'ja-JP';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (targetField === 'morning_note') {
        setter({ ...currentState, note: (currentState.note ? currentState.note + ' ' : '') + transcript });
      } else if (targetField === 'night_thoughts') {
        setter({ ...currentState, thoughts: (currentState.thoughts ? currentState.thoughts + ' ' : '') + transcript });
      }
    };
    recognition.start();
  };

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

  const exportToCSV = () => {
    if (logs.length === 0) return;
    const headers = ["日付", "時刻", "区分", "気分(10点)", "メモ/思考"];
    const csvRows = logs.map(log => [
      log.displayDate, log.timestamp, log.type === 'morning' ? '朝' : '夜',
      log.data.mood, log.type === 'morning' ? log.data.note : log.data.thoughts
    ].map(field => `"${String(field || '').replace(/"/g, '""')}"`).join(','));
    const csvContent = "\uFEFF" + [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `health_log_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const renderCalendar = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} className="h-14 bg-slate-50/50"></div>);
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dayLogs = logs.filter(l => l.date === dateStr);
      days.push(
        <div key={i} className="h-14 border border-slate-100 p-1 flex flex-col items-center bg-white">
          <span className="text-[10px] text-slate-400 self-start">{i}</span>
          <div className="flex space-x-1">
            {dayLogs.some(l => l.type === 'morning') && <div className="w-2 h-2 rounded-full bg-amber-400"></div>}
            {dayLogs.some(l => l.type === 'night') && <div className="w-2 h-2 rounded-full bg-indigo-500"></div>}
          </div>
        </div>
      );
    }
    return days;
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-slate-50 min-h-screen font-sans text-slate-800 pb-10">
      <header className="mb-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black text-indigo-900">体調管理ログ</h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase">{new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        {isListening && <div className="text-red-500 animate-pulse text-[10px] font-black">Rec...</div>}
      </header>

      <div className="flex mb-4 bg-white rounded-2xl p-1 shadow-sm">
        <button onClick={() => setActiveTab('morning')} className={`flex-1 py-2.5 rounded-xl text-xs font-black ${activeTab === 'morning' ? 'bg-amber-400 text-white' : 'text-slate-400'}`}>朝</button>
        <button onClick={() => setActiveTab('night')} className={`flex-1 py-2.5 rounded-xl text-xs font-black ${activeTab === 'night' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>夜</button>
        <button onClick={() => setActiveTab('history')} className={`flex-1 py-2.5 rounded-xl text-xs font-black ${activeTab === 'history' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}>管理</button>
      </div>

      <main>
        {activeTab === 'morning' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-3xl shadow-sm space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <input type="time" className="p-3 bg-slate-50 rounded-2xl" value={morningData.sleepTime} onChange={e => setMorningData({...morningData, sleepTime: e.target.value})} />
                <input type="time" className="p-3 bg-slate-50 rounded-2xl" value={morningData.wakeTime} onChange={e => setMorningData({...morningData, wakeTime: e.target.value})} />
              </div>
              <input type="range" min="1" max="10" className="w-full" value={morningData.mood} onChange={e => setMorningData({...morningData, mood: parseInt(e.target.value)})} />
              <div className="flex justify-between items-center">
                <span className="text-xs font-black">Morning Note</span>
                <button onClick={() => handleVoiceInput('morning_note', setMorningData, morningData)} className="p-2 bg-slate-50 rounded-full"><Mic size={18}/></button>
              </div>
              <textarea className="w-full p-4 bg-slate-50 rounded-2xl h-24 text-sm" value={morningData.note} onChange={e => setMorningData({...morningData, note: e.target.value})} />
              <button onClick={() => saveLog('morning')} className="w-full bg-amber-400 text-white font-black py-4 rounded-2xl">Save Morning</button>
            </div>
          </div>
        )}
        {activeTab === 'night' && (
          <div className="bg-white p-5 rounded-3xl shadow-sm space-y-6">
            {nightData.goodThings.map((t, i) => (
              <input key={i} className="w-full p-3 bg-slate-50 rounded-2xl text-sm" value={t} onChange={e => { const nt = [...nightData.goodThings]; nt[i] = e.target.value; setNightData({...nightData, goodThings: nt}); }} placeholder={`${i+1}つ目のいいこと`} />
            ))}
            <button onClick={() => saveLog('night')} className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl">Save Night</button>
          </div>
        )}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="flex justify-between bg-white p-3 rounded-2xl">
              <button onClick={() => setViewMode('list')} className="p-2"><List size={16}/></button>
              <button onClick={() => setViewMode('calendar')} className="p-2"><CalendarIcon size={16}/></button>
              <button onClick={exportToCSV} className="p-2 text-indigo-600"><Download size={16}/></button>
              <button onClick={() => setShowConfirmClear(true)} className="p-2 text-rose-600"><Trash2 size={16}/></button>
            </div>
            {viewMode === 'calendar' ? (
              <div className="bg-white p-4 rounded-3xl grid grid-cols-7 gap-1">{renderCalendar()}</div>
            ) : (
              <div className="space-y-3">
                {logs.map(log => (
                  <div key={log.id} className="p-4 bg-white rounded-3xl relative">
                    <button onClick={() => deleteLog(log.id)} className="absolute top-4 right-4 text-slate-200"><Trash2 size={14}/></button>
                    <span className="text-[9px] font-black">{log.displayDate} ({log.type})</span>
                    <p className="text-xs italic truncate">「{log.type === 'morning' ? log.data.note : log.data.thoughts}」</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {showConfirmClear && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-xs rounded-3xl p-6 space-y-4">
            <h3 className="font-black text-center">すべて削除しますか？</h3>
            <div className="flex space-x-3">
              <button onClick={() => setShowConfirmClear(false)} className="flex-1 py-3 bg-slate-100 rounded-xl text-xs">Cancel</button>
              <button onClick={() => { setLogs([]); localStorage.removeItem('health_logs_v6'); setShowConfirmClear(false); }} className="flex-1 py-3 bg-rose-600 text-white rounded-xl text-xs">Clear All</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
