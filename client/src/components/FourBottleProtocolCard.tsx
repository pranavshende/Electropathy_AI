import React, { useState } from 'react';
import { ShieldCheck, Zap, Droplets, Sparkles, AlertCircle, RefreshCw, Layers } from 'lucide-react';

export interface ProtocolBottleItem {
  bottleNumber: 1 | 2 | 3 | 4;
  bottleName: string;
  bottlePurpose: string;
  remedies: Array<{
    code: string;
    name: string;
    group: string;
    role: string;
    convergenceCategory: string;
  }>;
  electricity?: {
    code: string;
    name: string;
    polarity: string;
    role: string;
  };
  recommendedDilution: string;
  dosageSchedule: string;
}

export interface OptimizedElectropathyProtocol {
  protocolId: string;
  patientName: string;
  primaryConditionState: string;
  chronicityStage: string;
  optionLabel: 'Option A (Primary)' | 'Option B (Alternative)';
  bottles: ProtocolBottleItem[];
  totalUniqueRemedies: number;
  totalUniqueElectricities: number;
  externalLocalApplications: string[];
  constitutionalGuidance: string;
  practitionerNotice: string;
}

export interface DualProtocolOptimizationOutput {
  optimizationId: string;
  convergenceId: string;
  patientName: string;
  primaryState: string;
  optionA: OptimizedElectropathyProtocol;
  optionB?: OptimizedElectropathyProtocol;
}

interface FourBottleProtocolCardProps {
  dualProtocol: DualProtocolOptimizationOutput;
}

export const FourBottleProtocolCard: React.FC<FourBottleProtocolCardProps> = ({ dualProtocol }) => {
  const [activeOption, setActiveOption] = useState<'A' | 'B'>('A');

  const currentProtocol = activeOption === 'A' ? dualProtocol.optionA : (dualProtocol.optionB || dualProtocol.optionA);
  const isEmergencyIntercept = currentProtocol.bottles.length === 0;

  if (isEmergencyIntercept) {
    return (
      <div className="my-4 rounded-xl border border-red-500/40 bg-red-950/20 p-5 backdrop-blur-sm">
        <div className="flex items-center gap-3 text-red-400">
          <AlertCircle className="h-6 w-6 shrink-0" />
          <h4 className="text-lg font-bold">Clinical Safety Intercept Active</h4>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-red-200">
          {currentProtocol.practitionerNotice}
        </p>
      </div>
    );
  }

  const getElectricityBadgeClass = (code?: string) => {
    switch (code) {
      case 'R.E.':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      case 'B.E.':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'Y.E.':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
      case 'W.E.':
        return 'bg-slate-300/20 text-slate-200 border-slate-300/40';
      case 'G.E.':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      default:
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
    }
  };

  const getCategoryBadgeClass = (cat?: string) => {
    if (cat?.includes('Category_A')) {
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    }
    if (cat?.includes('Category_B')) {
      return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
    }
    return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
  };

  return (
    <div className="my-4 overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900/90 shadow-2xl backdrop-blur-md">
      {/* Header Banner */}
      <div className="border-b border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/30">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-100">Count Cesare Mattei 4-Bottle Protocol</h3>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 ring-1 ring-emerald-500/30">
                  Dual-Table Converged
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Primary State: <span className="font-semibold text-slate-300">{currentProtocol.primaryConditionState}</span> • Stage: <span className="font-medium text-indigo-300">{currentProtocol.chronicityStage}</span>
              </p>
            </div>
          </div>

          {/* Option A / Option B Toggle Buttons */}
          {dualProtocol.optionB && (
            <div className="flex items-center rounded-xl bg-slate-800/80 p-1 ring-1 ring-slate-700">
              <button
                type="button"
                onClick={() => setActiveOption('A')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeOption === 'A'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Option A (Primary)
              </button>
              <button
                type="button"
                onClick={() => setActiveOption('B')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeOption === 'B'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Option B (Alternative)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4 Bottles Grid */}
      <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 lg:grid-cols-4">
        {currentProtocol.bottles.map((bottle) => (
          <div
            key={bottle.bottleNumber}
            className="group relative flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-800/40 p-4 transition-all duration-200 hover:border-slate-700 hover:bg-slate-800/70"
          >
            <div>
              {/* Bottle Header */}
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-900/80 px-2 py-0.5 text-xs font-bold text-indigo-400 ring-1 ring-slate-700">
                  Bottle {bottle.bottleNumber}
                </span>
                <span className="text-[11px] font-medium text-emerald-400">
                  {bottle.recommendedDilution}
                </span>
              </div>

              {/* Title & Purpose */}
              <div className="mt-2.5">
                <h4 className="text-sm font-semibold text-slate-200">{bottle.bottleName}</h4>
                <p className="mt-0.5 text-[11px] leading-tight text-slate-400">{bottle.bottlePurpose}</p>
              </div>

              {/* Remedies List */}
              <div className="mt-3.5 space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Remedies (Max 2)</div>
                {bottle.remedies.map((remedy) => (
                  <div
                    key={remedy.code}
                    className="flex items-center justify-between rounded-lg border border-slate-700/60 bg-slate-900/60 p-2"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-100">{remedy.code}</span>
                        <span className="text-xs text-slate-400">({remedy.name})</span>
                      </div>
                      <div className="mt-0.5 text-[10px] text-slate-400">{remedy.group} • {remedy.role}</div>
                    </div>
                    <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold border ${getCategoryBadgeClass(remedy.convergenceCategory)}`}>
                      {remedy.convergenceCategory?.replace('Category_', 'Cat-') || 'Cat-C'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Electricity */}
              <div className="mt-3 space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Electricity (Max 1)</div>
                {bottle.electricity ? (
                  <div
                    className={`flex items-center justify-between rounded-lg border p-2 ${getElectricityBadgeClass(
                      bottle.electricity.code
                    )}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 shrink-0" />
                      <span className="text-xs font-bold">{bottle.electricity.code}</span>
                      <span className="text-[11px]">({bottle.electricity.polarity})</span>
                    </div>
                    <span className="text-[10px] opacity-80">{bottle.electricity.name}</span>
                  </div>
                ) : (
                  <div className="rounded-lg border border-slate-800 bg-slate-900/40 px-2 py-1.5 text-center text-[11px] italic text-slate-400">
                    None (Equilibrium preserved)
                  </div>
                )}
              </div>
            </div>

            {/* Dosage Schedule Footer */}
            <div className="mt-4 border-t border-slate-800/80 pt-2.5">
              <div className="flex items-center gap-1 text-[11px] font-medium text-slate-300">
                <Droplets className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
                <span>{bottle.dosageSchedule}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* External Applications & Guidance Strip */}
      <div className="border-t border-slate-800 bg-slate-950/60 px-6 py-3.5">
        <div className="flex flex-col gap-2 text-xs md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-slate-300">
            <Sparkles className="h-4 w-4 shrink-0 text-indigo-400" />
            <span>
              <strong className="text-slate-100">External Compresses:</strong>{' '}
              {currentProtocol.externalLocalApplications.length > 0
                ? currentProtocol.externalLocalApplications.join(' • ')
                : 'None required'}
            </span>
          </div>
          <div className="text-slate-400">
            <strong className="text-slate-200">Constitutional:</strong> {currentProtocol.constitutionalGuidance}
          </div>
        </div>
      </div>
    </div>
  );
};
