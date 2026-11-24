import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  PatientProfileSummary,
  PatientProfileDetail,
  PatientSymptomItem,
  PatientMedicationItem,
  PatientMedicalHistoryItem,
  PatientAllergyItem,
  PatientObservationItem,
  PatientTimelineEventItem
} from '../types';
import {
  Users,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Pill,
  HeartPulse,
  Activity,
  History,
  FileText,
  UserCheck,
  RefreshCw,
  X,
  Edit2,
  Check,
  MessageSquare,
  ShieldCheck,
  Info,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface PatientManagementViewProps {
  onSelectConversation?: (conversationId: string) => void;
}

export const PatientManagementView: React.FC<PatientManagementViewProps> = ({ onSelectConversation }) => {
  const [patients, setPatients] = useState<PatientProfileSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [minAge, setMinAge] = useState<string>('');
  const [maxAge, setMaxAge] = useState<string>('');
  const [symptomFilter, setSymptomFilter] = useState('');

  // Selected Patient Detail Modal State
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [patientDetail, setPatientDetail] = useState<PatientProfileDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState<
    'personal' | 'health' | 'history' | 'meds' | 'allergies' | 'lifestyle' | 'chats' | 'timeline'
  >('health');

  // Edit Patient State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [savingEdit, setSavingEdit] = useState(false);

  // Re-extraction State
  const [reExtracting, setReExtracting] = useState(false);
  const [reExtractSuccess, setReExtractSuccess] = useState<string | null>(null);

  // Verification Note State
  const [verifyingObsId, setVerifyingObsId] = useState<string | null>(null);
  const [verifyNote, setVerifyNote] = useState('');

  const loadPatients = async () => {
    setLoading(true);
    try {
      const res = await api.adminGetPatientProfiles({
        search,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        minAge: minAge ? parseInt(minAge, 10) : undefined,
        maxAge: maxAge ? parseInt(maxAge, 10) : undefined,
        symptom: symptomFilter || undefined,
        page,
        limit: 12
      });

      if (res.success) {
        setPatients(res.patients || []);
        setTotal(res.total || 0);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load patient profiles', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadPatients();
  };

  const handleViewPatient = async (patientId: string) => {
    setSelectedPatientId(patientId);
    setDetailLoading(true);
    try {
      const res = await api.adminGetPatientProfileDetails(patientId);
      if (res.success && res.patient) {
        setPatientDetail(res.patient);
        setEditForm({
          fullName: res.patient.profile.fullName,
          age: res.patient.profile.age || '',
          gender: res.patient.profile.gender || 'unspecified',
          phone: res.patient.profile.phone || '',
          email: res.patient.profile.email || '',
          location: res.patient.profile.location || '',
          profileStatus: res.patient.profile.profileStatus || 'active'
        });
      }
    } catch (err) {
      console.error('Failed to load patient detail', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleVerifyObservation = async (obsId: string, status: string) => {
    if (!selectedPatientId) return;
    try {
      const res = await api.adminVerifyPatientObservation(selectedPatientId, obsId, status, verifyNote || undefined);
      if (res.success) {
        setVerifyingObsId(null);
        setVerifyNote('');
        // Refresh detail
        handleViewPatient(selectedPatientId);
      }
    } catch (err) {
      console.error('Verification update failed', err);
    }
  };

  const handleSaveProfileEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return;
    setSavingEdit(true);
    try {
      const res = await api.adminUpdatePatientProfile(selectedPatientId, editForm);
      if (res.success) {
        setIsEditingProfile(false);
        handleViewPatient(selectedPatientId);
        loadPatients();
      }
    } catch (err) {
      console.error('Failed to update patient profile', err);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleReExtract = async () => {
    if (!selectedPatientId) return;
    setReExtracting(true);
    setReExtractSuccess(null);
    try {
      const res = await api.adminReExtractPatientProfile(selectedPatientId);
      if (res.success) {
        setReExtractSuccess('Successfully re-analyzed chat conversations and updated clinical history.');
        handleViewPatient(selectedPatientId);
        loadPatients();
        setTimeout(() => setReExtractSuccess(null), 4000);
      }
    } catch (err) {
      console.error('Re-extraction failed', err);
    } finally {
      setReExtracting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
      case 'practitioner_verified':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Practitioner Verified
          </span>
        );
      case 'needs_review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5" /> Needs Review
          </span>
        );
      case 'patient_confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/15 text-teal-400 border border-teal-500/30">
            <UserCheck className="w-3.5 h-3.5" /> Patient Confirmed
          </span>
        );
      case 'corrected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
            <Edit2 className="w-3.5 h-3.5" /> Corrected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            <Sparkles className="w-3.5 h-3.5" /> AI Extracted
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top KPI Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Patients</p>
              <h3 className="text-2xl font-bold text-white mt-1">{total}</h3>
              <p className="text-xs text-slate-500 mt-1">Auto-profiled from AI chats</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Health Profiles</p>
              <h3 className="text-2xl font-bold text-emerald-400 mt-1">
                {patients.filter(p => p.profileStatus === 'active' || p.profileStatus === 'verified').length}
              </h3>
              <p className="text-xs text-slate-500 mt-1">Real-time symptom tracking</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <HeartPulse className="w-6 h-6" />
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Practitioner Verified</p>
              <h3 className="text-2xl font-bold text-teal-400 mt-1">
                {patients.filter(p => p.profileStatus === 'verified').length}
              </h3>
              <p className="text-xs text-slate-500 mt-1">Clinically audited records</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-teal-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Multilingual Extraction</p>
              <h3 className="text-2xl font-bold text-purple-400 mt-1">EN • HI • MR</h3>
              <p className="text-xs text-slate-500 mt-1">Continuous NLP extraction</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Activity className="w-6 h-6" />
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 shadow-md">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by patient name, phone, symptoms, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-300 py-2 px-3 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="verified">Verified</option>
              <option value="needs_review">Needs Review</option>
            </select>

            <div className="flex items-center gap-1 bg-slate-950/60 border border-slate-800 rounded-xl px-2 py-1 text-xs text-slate-400">
              <span>Age:</span>
              <input
                type="number"
                placeholder="Min"
                value={minAge}
                onChange={(e) => setMinAge(e.target.value)}
                className="w-12 bg-transparent text-center text-slate-200 focus:outline-none"
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxAge}
                onChange={(e) => setMaxAge(e.target.value)}
                className="w-12 bg-transparent text-center text-slate-200 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Filter className="w-3.5 h-3.5" /> Apply
            </button>

            <button
              type="button"
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
                setMinAge('');
                setMaxAge('');
                setSymptomFilter('');
                setPage(1);
                loadPatients();
              }}
              className="p-2 text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 rounded-xl transition-colors"
              title="Reset Filters"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Patient Listing Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-slate-200 text-sm">Registered Patients & Extracted Clinical Profiles</h4>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-slate-800 text-slate-400">
              {total} total
            </span>
          </div>
          <span className="text-xs text-slate-500">Auto-extracted from patient chat interactions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Patient ID & Name</th>
                <th className="py-3 px-3">Age / Gender</th>
                <th className="py-3 px-3">Primary Symptoms Reported</th>
                <th className="py-3 px-3 text-center">Chats</th>
                <th className="py-3 px-3">Last Active</th>
                <th className="py-3 px-3">Completeness</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
                      <span>Loading clinical profiles...</span>
                    </div>
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No patient profiles found matching the criteria. Start chatting with the AI bot to generate records.
                  </td>
                </tr>
              ) : (
                patients.map((pat) => (
                  <tr
                    key={pat.id}
                    onClick={() => handleViewPatient(pat.id)}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-600/30 to-purple-600/30 border border-cyan-500/20 flex items-center justify-center text-cyan-300 font-bold text-xs uppercase">
                          {pat.fullName.slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                            {pat.fullName}
                          </p>
                          <p className="text-[11px] font-mono text-slate-500">{pat.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="text-slate-300">{pat.age ? `${pat.age} yrs` : 'Unspecified'}</span>
                      <span className="text-slate-500 ml-1">/ {pat.gender || '—'}</span>
                    </td>
                    <td className="py-3.5 px-3 max-w-xs">
                      {pat.primarySymptoms ? (
                        <p className="text-slate-300 line-clamp-1 text-[11px] font-medium" title={pat.primarySymptoms}>
                          {pat.primarySymptoms}
                        </p>
                      ) : (
                        <span className="text-slate-500 italic">No active symptoms recorded</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-[11px]">
                        <MessageSquare className="w-3 h-3 text-cyan-400" />
                        {pat.totalConversations || 1}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-400 text-[11px]">
                      {new Date(pat.lastInteractionAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="w-24">
                        <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                          <span>{pat.completenessScore}%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              pat.completenessScore > 75
                                ? 'bg-emerald-400'
                                : pat.completenessScore > 40
                                ? 'bg-cyan-400'
                                : 'bg-amber-400'
                            }`}
                            style={{ width: `${pat.completenessScore}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">{getStatusBadge(pat.profileStatus)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewPatient(pat.id);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-cyan-600/30 text-slate-400 hover:text-cyan-300 transition-colors"
                        title="View Full Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Individual Patient Profile Drawer / Modal */}
      {selectedPatientId && patientDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 md:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-950/50">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {patientDetail.profile.fullName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white">{patientDetail.profile.fullName}</h3>
                    {getStatusBadge(patientDetail.profile.profileStatus)}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="font-mono text-cyan-400">ID: {patientDetail.profile.id}</span>
                    <span>•</span>
                    <span>Age: {patientDetail.profile.age || 'Unspecified'}</span>
                    <span>•</span>
                    <span>Gender: {patientDetail.profile.gender || 'Unspecified'}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      Last Active:{' '}
                      {new Date(patientDetail.profile.lastInteractionAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={handleReExtract}
                  disabled={reExtracting}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                  title="Re-analyze conversations to update medical facts"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${reExtracting ? 'animate-spin text-cyan-400' : ''}`} />
                  {reExtracting ? 'Extracting...' : 'Re-extract from Chats'}
                </button>

                <button
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="px-3 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  {isEditingProfile ? 'Cancel Edit' : 'Edit Profile'}
                </button>

                <button
                  onClick={() => {
                    setSelectedPatientId(null);
                    setPatientDetail(null);
                  }}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Re-extraction Success Alert */}
            {reExtractSuccess && (
              <div className="px-5 py-2.5 bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{reExtractSuccess}</span>
              </div>
            )}

            {/* Inline Profile Edit Form */}
            {isEditingProfile && (
              <form onSubmit={handleSaveProfileEdit} className="p-4 bg-slate-950/70 border-b border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 font-semibold mb-1 block">Full Name</label>
                  <input
                    type="text"
                    value={editForm.fullName}
                    onChange={e => setEditForm({ ...editForm, fullName: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold mb-1 block">Age</label>
                  <input
                    type="number"
                    value={editForm.age}
                    onChange={e => setEditForm({ ...editForm, age: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold mb-1 block">Gender</label>
                  <select
                    value={editForm.gender}
                    onChange={e => setEditForm({ ...editForm, gender: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200"
                  >
                    <option value="unspecified">Unspecified</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-semibold mb-1 block">Phone</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold mb-1 block">Location</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold mb-1 block">Status</label>
                  <select
                    value={editForm.profileStatus}
                    onChange={e => setEditForm({ ...editForm, profileStatus: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200"
                  >
                    <option value="active">Active</option>
                    <option value="verified">Verified</option>
                    <option value="needs_review">Needs Review</option>
                  </select>
                </div>
                <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    {savingEdit ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                    Save Changes
                  </button>
                </div>
              </form>
            )}

            {/* Navigation Tabs (8 Dedicated Sections) */}
            <div className="flex items-center gap-1 px-4 border-b border-slate-800 overflow-x-auto bg-slate-950/30 text-xs font-semibold">
              <button
                onClick={() => setActiveDetailTab('health')}
                className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
                  activeDetailTab === 'health'
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <HeartPulse className="w-4 h-4" />
                Current Health & Symptoms ({patientDetail.symptoms.length})
              </button>

              <button
                onClick={() => setActiveDetailTab('meds')}
                className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
                  activeDetailTab === 'meds'
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Pill className="w-4 h-4" />
                Medication History ({patientDetail.medications.length})
              </button>

              <button
                onClick={() => setActiveDetailTab('history')}
                className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
                  activeDetailTab === 'history'
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <History className="w-4 h-4" />
                Medical History ({patientDetail.medicalHistory.length})
              </button>

              <button
                onClick={() => setActiveDetailTab('allergies')}
                className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
                  activeDetailTab === 'allergies'
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <AlertCircle className="w-4 h-4" />
                Allergies ({patientDetail.allergies.length})
              </button>

              <button
                onClick={() => setActiveDetailTab('lifestyle')}
                className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
                  activeDetailTab === 'lifestyle'
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Activity className="w-4 h-4" />
                Lifestyle & Vitals
              </button>

              <button
                onClick={() => setActiveDetailTab('timeline')}
                className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
                  activeDetailTab === 'timeline'
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Patient Timeline ({patientDetail.timeline.length})
              </button>

              <button
                onClick={() => setActiveDetailTab('chats')}
                className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
                  activeDetailTab === 'chats'
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Chat History ({patientDetail.conversations?.length || 0})
              </button>

              <button
                onClick={() => setActiveDetailTab('personal')}
                className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
                  activeDetailTab === 'personal'
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Info className="w-4 h-4" />
                Demographics
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* TAB 1: CURRENT HEALTH OVERVIEW & SYMPTOMS */}
              {activeDetailTab === 'health' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-white text-base">Active & Historical Symptoms</h4>
                      <p className="text-xs text-slate-400">Extracted from patient statements with status change tracking</p>
                    </div>
                  </div>

                  {patientDetail.symptoms.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                      No symptoms recorded yet for this patient.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {patientDetail.symptoms.map((sym) => (
                        <div key={sym.id} className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 shadow-sm relative space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h5 className="font-semibold text-slate-200 text-sm">{sym.symptom}</h5>
                              <p className="text-xs text-slate-400 mt-0.5">{sym.description}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                              sym.currentStatus === 'improving' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                              sym.currentStatus === 'resolved' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                              sym.currentStatus === 'recurred' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                              'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}>
                              {sym.currentStatus}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                            {sym.duration && (
                              <span className="bg-slate-800/60 px-2 py-0.5 rounded text-[11px]">
                                Duration: {sym.duration}
                              </span>
                            )}
                            {sym.severity && (
                              <span className="bg-slate-800/60 px-2 py-0.5 rounded text-[11px]">
                                Severity: {sym.severity}
                              </span>
                            )}
                            <span className="ml-auto">{getStatusBadge(sym.verificationStatus)}</span>
                          </div>

                          {sym.originalStatement && (
                            <div className="mt-2 p-2 bg-slate-900/80 border border-slate-800/60 rounded-xl text-[11px] text-slate-300 italic">
                              "{sym.originalStatement}"
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: MEDICATION HISTORY */}
              {activeDetailTab === 'meds' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-white text-base">Medication & Prescription History</h4>
                    <p className="text-xs text-slate-400">Distinguishes currently active, previously taken, and discontinued medications</p>
                  </div>

                  {patientDetail.medications.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                      No medications disclosed by patient.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {patientDetail.medications.map((med) => (
                        <div key={med.id} className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 shadow-sm space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h5 className="font-semibold text-slate-200 text-sm flex items-center gap-1.5">
                                <Pill className="w-4 h-4 text-cyan-400" />
                                {med.medicationName}
                              </h5>
                              {med.condition && <p className="text-xs text-slate-400">For: {med.condition}</p>}
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                              med.medicationStatus === 'current' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                              med.medicationStatus === 'stopped' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                              'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}>
                              {med.medicationStatus}
                            </span>
                          </div>

                          {(med.dosage || med.frequency || med.sideEffects) && (
                            <div className="text-xs text-slate-400 space-y-1 pt-1">
                              {med.dosage && <div>Dosage: <span className="text-slate-300">{med.dosage}</span></div>}
                              {med.frequency && <div>Frequency: <span className="text-slate-300">{med.frequency}</span></div>}
                              {med.sideEffects && <div className="text-amber-400/90">Reported Adverse Effects: {med.sideEffects}</div>}
                            </div>
                          )}

                          {med.originalStatement && (
                            <div className="mt-2 p-2 bg-slate-900/80 border border-slate-800/60 rounded-xl text-[11px] text-slate-300 italic">
                              "{med.originalStatement}"
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: MEDICAL HISTORY */}
              {activeDetailTab === 'history' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-white text-base">Past Medical & Chronic Conditions</h4>
                    <p className="text-xs text-slate-400">Historical conditions, prior treatments, and family medical background</p>
                  </div>

                  {patientDetail.medicalHistory.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                      No prior medical history disclosed.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {patientDetail.medicalHistory.map((hist) => (
                        <div key={hist.id} className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div>
                            <h5 className="font-semibold text-slate-200 text-sm">{hist.condition}</h5>
                            <p className="text-xs text-slate-400 mt-0.5">{hist.description}</p>
                            {hist.originalStatement && (
                              <p className="text-[11px] text-slate-500 italic mt-1">"{hist.originalStatement}"</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-800 text-slate-400">
                              {hist.status}
                            </span>
                            {getStatusBadge(hist.verificationStatus)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: ALLERGIES */}
              {activeDetailTab === 'allergies' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-white text-base">Documented Patient Allergies</h4>
                    <p className="text-xs text-slate-400">Critical safety considerations for Electropathy remedy compounding</p>
                  </div>

                  {patientDetail.allergies.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                      No known allergies recorded.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {patientDetail.allergies.map((alg) => (
                        <div key={alg.id} className="bg-slate-950/60 border border-rose-500/20 rounded-2xl p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <h5 className="font-semibold text-rose-300 text-sm flex items-center gap-1.5">
                              <AlertCircle className="w-4 h-4 text-rose-400" />
                              {alg.allergen}
                            </h5>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300">
                              {alg.severity || 'Moderate'}
                            </span>
                          </div>
                          {alg.reaction && <p className="text-xs text-slate-300">Reaction: {alg.reaction}</p>}
                          {alg.originalStatement && (
                            <p className="text-[11px] text-slate-500 italic">"{alg.originalStatement}"</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: LIFESTYLE & VITALS */}
              {activeDetailTab === 'lifestyle' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-white text-base">Lifestyle & Environmental Factors</h4>
                    <p className="text-xs text-slate-400">Factors influencing Count Mattei bioelectric constitution and temperament</p>
                  </div>

                  {patientDetail.lifestyle ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-1">
                        <span className="text-xs text-slate-500 font-semibold uppercase">Dietary Habits</span>
                        <p className="text-sm text-slate-200">{patientDetail.lifestyle.diet || 'Not disclosed'}</p>
                      </div>
                      <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-1">
                        <span className="text-xs text-slate-500 font-semibold uppercase">Sleep Patterns</span>
                        <p className="text-sm text-slate-200">{patientDetail.lifestyle.sleep || 'Not disclosed'}</p>
                      </div>
                      <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-1">
                        <span className="text-xs text-slate-500 font-semibold uppercase">Physical Activity</span>
                        <p className="text-sm text-slate-200">{patientDetail.lifestyle.physicalActivity || 'Not disclosed'}</p>
                      </div>
                      <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-1">
                        <span className="text-xs text-slate-500 font-semibold uppercase">Substance Use / Exposure</span>
                        <p className="text-sm text-slate-200">{patientDetail.lifestyle.substanceUse || 'Not disclosed'}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                      No lifestyle information disclosed yet.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: PATIENT TIMELINE */}
              {activeDetailTab === 'timeline' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-white text-base">Chronological Patient Health Timeline</h4>
                    <p className="text-xs text-slate-400">Evolution of symptoms, medications, and practitioner verifications over time</p>
                  </div>

                  {patientDetail.timeline.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                      No timeline events recorded yet.
                    </div>
                  ) : (
                    <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                      {patientDetail.timeline.map((event) => (
                        <div key={event.id} className="relative group">
                          <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-slate-900 border-2 border-cyan-400 group-hover:scale-125 transition-transform" />
                          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 shadow-sm space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <h5 className="font-semibold text-slate-200 text-sm">{event.title}</h5>
                              <span className="text-[11px] font-mono text-slate-500">
                                {new Date(event.createdAt).toLocaleDateString([], {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400">{event.description}</p>
                            <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800/80 text-cyan-300">
                              {event.eventType}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 7: CHAT HISTORY */}
              {activeDetailTab === 'chats' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-white text-base">Consultation Chat History & Source Verification</h4>
                    <p className="text-xs text-slate-400">All chatbot conversations from which medical facts were extracted</p>
                  </div>

                  {!patientDetail.conversations || patientDetail.conversations.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                      No previous chat sessions linked to this patient.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {patientDetail.conversations.map((conv) => (
                        <div
                          key={conv.id}
                          className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center justify-between gap-4 hover:border-cyan-500/40 transition-colors"
                        >
                          <div className="space-y-1">
                            <h5 className="font-semibold text-slate-200 text-sm">{conv.title}</h5>
                            <div className="flex items-center gap-3 text-xs text-slate-500">
                              <span className="font-mono text-cyan-400">{conv.id}</span>
                              <span>•</span>
                              <span>{conv.messageCount} messages</span>
                              <span>•</span>
                              <span>Language: {conv.language.toUpperCase()}</span>
                              <span>•</span>
                              <span>{new Date(conv.updatedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          {onSelectConversation && (
                            <button
                              onClick={() => onSelectConversation(conv.id)}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-cyan-600/30 text-cyan-300 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                            >
                              Open Transcript <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 8: DEMOGRAPHICS */}
              {activeDetailTab === 'personal' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-white text-base">Demographics & Identity</h4>
                    <p className="text-xs text-slate-400">Primary patient contact information and privacy consent status</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-1">
                      <span className="text-xs text-slate-500 font-semibold uppercase flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" /> Phone Number
                      </span>
                      <p className="text-sm text-slate-200">{patientDetail.profile.phone || 'Not voluntarily disclosed'}</p>
                    </div>

                    <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-1">
                      <span className="text-xs text-slate-500 font-semibold uppercase flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" /> Email Address
                      </span>
                      <p className="text-sm text-slate-200">{patientDetail.profile.email || 'Not voluntarily disclosed'}</p>
                    </div>

                    <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-1">
                      <span className="text-xs text-slate-500 font-semibold uppercase flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> Location / City
                      </span>
                      <p className="text-sm text-slate-200">{patientDetail.profile.location || 'Not voluntarily disclosed'}</p>
                    </div>

                    <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-1">
                      <span className="text-xs text-slate-500 font-semibold uppercase flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Consent Status
                      </span>
                      <p className="text-sm text-emerald-400 capitalize">{patientDetail.profile.consentStatus}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
