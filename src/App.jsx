import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LayoutDashboard, Shirt, Wallet, Users, Banknote, TrendingUp, Plus, Trash2, Pencil, X, Check, Search, ChevronDown, ChevronRight } from 'lucide-react';

const API_URL = "https://script.google.com/macros/s/AKfycbyKnDIvktjaRSITpULKVXwgBsDF4LCTNvK1yIBCvkS8Jo9JFy_0w_m9Cq0oetxkMxkO/exec";

const KEYS = { orders: "orders", expenses: "expenses", workers: "workers", activities: "activities", payRates: "payRates", clothTypes: "clothTypes" };

const getCredentials = () => ({
  username: sessionStorage.getItem("vvsk_user"),
  password: sessionStorage.getItem("vvsk_pass")
});

async function loadKey(key, fallback) {
  const { username, password } = getCredentials();
  try {
    const res = await fetch(`${API_URL}?key=${key}&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`);
    const data = await res.json();
    return data && !data.error && (Array.isArray(data) ? data.length !== 0 : Object.keys(data).length !== 0) ? data : fallback;
  } catch (e) { return fallback; }
}

async function saveKey(key, value) {
  const { username, password } = getCredentials();
  try {
    await fetch(API_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "save", key: key, value: value, username, password })
    });
  } catch (e) { console.error("Save failed", e); }
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!sessionStorage.getItem("vvsk_user"));
  const [tab, setTab] = useState("dashboard");
  const [loaded, setLoaded] = useState(false);
  
  // State for all your data
  const [orders, setOrders] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [payRates, setPayRates] = useState({});
  const [clothTypes, setClothTypes] = useState(["Pant", "Shirt", "Trouser", "Top", "Bottom", "Coat", "Binoform"]);

  // Load data once logged in
  useEffect(() => {
    if (isLoggedIn) {
      (async () => {
        setOrders(await loadKey(KEYS.orders, []));
        setExpenses(await loadKey(KEYS.expenses, []));
        setWorkers(await loadKey(KEYS.workers, []));
        setActivities(await loadKey(KEYS.activities, []));
        setPayRates(await loadKey(KEYS.payRates, {}));
        setClothTypes(await loadKey(KEYS.clothTypes, ["Pant", "Shirt", "Trouser", "Top", "Bottom", "Coat", "Binoform"]));
        setLoaded(true);
      })();
    }
  }, [isLoggedIn]);

  // If not logged in, show the Login screen
  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  // If logged in, show the main dashboard
  return (
    <div className="min-h-screen bg-stone-100">
      {/* HEADER & NAV GO HERE */}
      <header className="bg-slate-800 text-white p-4">
        <h1 className="text-xl font-bold">VVSK Fashions Ledger</h1>
        {/* Your tab buttons go here */}
      </header>

      <main className="p-6">
        {!loaded ? (
          <div>Loading your data...</div>
        ) : (
          <>
            {tab === "dashboard" && <DashboardTab orders={orders} expenses={expenses} />}
            {/* ... other tab components ... */}
          </>
        )}
      </main>
    </div>
  );
}

function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isAttempting, setIsAttempting] = useState(false);
  const [error, setError] = useState("");
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsAttempting(true);
    try {
      const res = await fetch(`${API_URL}?key=clothTypes&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`);
      const data = await res.json();
      if (data.error === "Access Denied") {
        setError("Invalid credentials.");
        setIsAttempting(false);
      } else {
        sessionStorage.setItem("vvsk_user", username);
        sessionStorage.setItem("vvsk_pass", password);
        onLogin();
      }
    } catch (err) { setError("Network error."); setIsAttempting(false); }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-sm w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">VVSK Fashions</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input className="w-full border p-2 rounded" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
          <input type="password" className="w-full border p-2 rounded" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={isAttempting} className="w-full bg-slate-800 text-white p-2 rounded">
            {isAttempting ? "Verifying..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;


