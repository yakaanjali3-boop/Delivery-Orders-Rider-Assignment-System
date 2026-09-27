import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Sliders,
  RotateCcw,
  Database,
  ShieldCheck,
  User,
  KeyRound,
  CheckCircle2,
  Server,
} from 'lucide-react';
import { DEFAULT_WEIGHTS } from '../../utils/assignment';

export const SettingsPage: React.FC = () => {
  const {
    currentUser,
    scoringWeights,
    setScoringWeights,
    resetDatabase,
    addToast,
  } = useApp();

  const [weights, setWeights] = useState(scoringWeights);
  const [dbHost, setDbHost] = useState('localhost:3306');
  const [dbName, setDbName] = useState('delivery_management');
  const [dbUser, setDbUser] = useState('root');

  const handleSaveWeights = (e: React.FormEvent) => {
    e.preventDefault();
    setScoringWeights(weights);
    addToast({
      type: 'success',
      title: 'Scoring Weights Saved',
      message: `Workload (${weights.workloadWeight}), Distance (${weights.distanceWeight}), ETA (${weights.etaWeight}) updated.`,
    });
  };

  const handleResetWeights = () => {
    setWeights(DEFAULT_WEIGHTS);
    setScoringWeights(DEFAULT_WEIGHTS);
    addToast({
      type: 'info',
      title: 'Default Weights Restored',
      message: 'Workload: 0.35, Distance: 0.40, ETA: 0.25.',
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">System Settings & Algorithm Tuning</h2>
        <p className="text-xs text-slate-400">
          Configure algorithmic scoring coefficients, database configuration, and active credentials
        </p>
      </div>

      {/* Algorithmic Scoring Weights Card */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Rider Assignment Scoring Weights</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Score = (W_workload × Active Orders) + (W_distance × Distance) + (W_eta × ETA)
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetWeights}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            Reset to Default
          </button>
        </div>

        <form onSubmit={handleSaveWeights} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-850 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-300">Workload Weight (W_w)</span>
                <span className="font-mono text-emerald-400">{weights.workloadWeight}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.80"
                step="0.05"
                value={weights.workloadWeight}
                onChange={(e) => setWeights({ ...weights, workloadWeight: parseFloat(e.target.value) })}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <p className="text-[10px] text-slate-400">Penalizes riders with stacked order queues</p>
            </div>

            <div className="p-4 bg-slate-850 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-300">Distance Weight (W_d)</span>
                <span className="font-mono text-emerald-400">{weights.distanceWeight}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.80"
                step="0.05"
                value={weights.distanceWeight}
                onChange={(e) => setWeights({ ...weights, distanceWeight: parseFloat(e.target.value) })}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <p className="text-[10px] text-slate-400">Favors couriers closest to pickup restaurant</p>
            </div>

            <div className="p-4 bg-slate-850 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-300">ETA Weight (W_t)</span>
                <span className="font-mono text-emerald-400">{weights.etaWeight}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.80"
                step="0.05"
                value={weights.etaWeight}
                onChange={(e) => setWeights({ ...weights, etaWeight: parseFloat(e.target.value) })}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <p className="text-[10px] text-slate-400">Prioritizes fastest end-to-end customer delivery</p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              Update Algorithm Weights
            </button>
          </div>
        </form>
      </div>

      {/* Database Connection Info Card */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <Database className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-white">MySQL Database Settings (College Environment)</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Database Host & Port</label>
            <input
              type="text"
              value={dbHost}
              onChange={(e) => setDbHost(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Database Name</label>
            <input
              type="text"
              value={dbName}
              onChange={(e) => setDbName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Database Username</label>
            <input
              type="text"
              value={dbUser}
              onChange={(e) => setDbUser(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono"
            />
          </div>
        </div>

        <div className="p-3 bg-slate-850 rounded-xl border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
          The application supports dual operation: live instant preview in the browser via responsive state, and exportable Python Flask backend (<code className="text-emerald-400 font-mono">app.py</code>) connecting directly to MySQL database <code className="text-emerald-400 font-mono">delivery_management</code>.
        </div>
      </div>

      {/* Demo Reset Card */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Reset Database to Initial Sample State</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Restores initial sample data for C001 Anjali, R001 Spice Hub, D001 Arun, and sample orders
          </p>
        </div>

        <button
          onClick={resetDatabase}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-800/50 text-xs font-semibold transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Sample DB</span>
        </button>
      </div>
    </div>
  );
};
