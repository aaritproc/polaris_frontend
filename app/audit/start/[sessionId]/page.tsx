'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import Link from 'next/link'
import {
  Loader2, FileText, ExternalLink, CheckCircle2,
  AlertTriangle, Clock, ChevronRight, UserCheck,
} from 'lucide-react'
// import { config } from '@/lib/config'
// import { TokenStore } from '@/services/api'
import { useCurrentUser } from '@/hooks'
import type { AuditFormDetail } from '@/types/polaris'
import { mockAuditDetails, mockAuditors } from '@/utils/mockData'

function DetailField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11.5px] font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
      <span className="text-[13.5px] text-slate-800">{value || '—'}</span>
    </div>
  )
}

function AiStatusPill({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    not_started: { cls: 'bg-slate-100 text-slate-500', label: 'Not Started' },
    pending:     { cls: 'bg-slate-100 text-slate-500', label: 'Not Started' },
    fetching:    { cls: 'bg-blue-100 text-blue-700',   label: 'Fetching' },
    identifying: { cls: 'bg-blue-100 text-blue-700',   label: 'Identifying' },
    parsing:     { cls: 'bg-blue-100 text-blue-700',   label: 'Parsing' },
    auditing:    { cls: 'bg-blue-100 text-blue-700',   label: 'Auditing' },
    summarising: { cls: 'bg-blue-100 text-blue-700',   label: 'Summarising' },
    exporting:   { cls: 'bg-blue-100 text-blue-700',   label: 'Exporting' },
    done:        { cls: 'bg-emerald-100 text-emerald-700', label: 'Completed' },
    failed:      { cls: 'bg-red-100 text-red-700',     label: 'Failed' },
  }
  const { cls, label } = map[status] ?? { cls: 'bg-slate-100 text-slate-600', label: status }
  const spinning = ['fetching','identifying','parsing','auditing','summarising','exporting'].includes(status)
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold ${cls}`}>
      {status === 'done' && <CheckCircle2 size={13} />}
      {status === 'failed' && <AlertTriangle size={13} />}
      {spinning && <Loader2 size={13} className="animate-spin" />}
      {(status === 'not_started' || status === 'pending') && <Clock size={13} />}
      {label}
    </span>
  )
}

// ─── Assign Auditor Panel (admin only) ────────────────────────────────────────
function AssignAuditorPanel({
  sessionId,
  currentAuditorName,
  currentAuditorEmail,
}: {
  sessionId: string
  currentAuditorName?: string | null
  currentAuditorEmail?: string | null
}) {
  const [auditors, setAuditors] = useState<{ user_id: string; user_name: string; azure_email: string }[]>([])
  const [selected, setSelected] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
      setAuditors(mockAuditors)

    if (currentAuditorEmail) {
      const currentAuditor = mockAuditors.find(
        auditor => auditor.azure_email === currentAuditorEmail
      )

      if (currentAuditor) {
        setSelected(currentAuditor.user_id)
      }
    }
  }, [currentAuditorEmail])

  const assign = async () => {
    if (!selected) return

    setSaving(true)

    await new Promise(resolve => setTimeout(resolve, 500))

    setDone(true)
    setSaving(false)
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm mb-5 p-5">
      <div className="flex items-center gap-2 mb-3">
        <UserCheck size={16} className="text-blue-600" />
        <h2 className="text-[15px] font-semibold text-slate-800">Assign Auditor</h2>
        {currentAuditorName && (
          <span className="ml-auto text-[12px] text-slate-500">
            Currently: <strong className="text-slate-700">{currentAuditorName}</strong>
          </span>
        )}
      </div>
      {done ? (
        <div className="flex items-center gap-2 text-emerald-600 text-[13px]">
          <CheckCircle2 size={16} /> Auditor assigned successfully
        </div>
      ) : (
        <div className="flex gap-3 items-center">
          <select value={selected} onChange={e => setSelected(e.target.value)}
            className="flex-1 px-3 py-2 text-[13.5px] border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">{currentAuditorName}</option>
            {auditors.map(a => (
              <option key={a.user_id} value={a.user_id}>{a.user_name} ({a.azure_email})</option>
            ))}
          </select>
          <button onClick={assign} disabled={!selected || saving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-[13px] font-semibold rounded-lg transition-colors flex items-center gap-1.5">
            {saving && <Loader2 size={13} className="animate-spin" />}
            Assign
          </button>
        </div>
      )}
      {auditors.length === 0 && (
        <p className="text-[12px] text-slate-400 mt-2">
          No auditors found. Add users with the "Auditor" Azure AD app role.
        </p>
      )}
    </div>
  )
}

export default function ProjectDetailsPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const { data: currentUser } = useCurrentUser()
  const [detail, setDetail] = useState<AuditFormDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) return

    const mockDetail = mockAuditDetails[sessionId]

    if (mockDetail) {
      setDetail(mockDetail)
      setError(null)
    } else {
      setDetail(null)
      setError('Audit not found')
    }
  }, [sessionId])

  if (loading) return <AppShell><div className="flex items-center justify-center min-h-[50vh]"><Loader2 size={28} className="animate-spin text-blue-500" /></div></AppShell>
  if (error || !detail) return <AppShell><div className="p-6 text-red-600">{error ?? 'Not found'}</div></AppShell>

  const isAdmin = currentUser?.role === 'admin'
  const isStarAudit = detail.audit_type === 'STAR'

  return (
    <AppShell>
      <div className="flex items-center gap-1.5 text-[12px] text-slate-400 mb-4">
        <Link href="/home" className="hover:text-blue-600">Home</Link>
        <span>›</span>
        <Link href="/audit/start" className="hover:text-blue-600">Start Audit</Link>
        <span>›</span>
        <span className="text-slate-600">Project Details</span>
      </div>

      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{detail.client_name}</h1>
          <p className="text-[14px] text-slate-500">{detail.project_name}</p>
        </div>
        {detail.ai_audit_score != null && (
          <div className="flex-shrink-0 bg-white border border-slate-200 rounded-lg px-5 py-3 text-center shadow-sm">
            <div className="text-2xl font-bold text-slate-900">
              {detail.ai_audit_score.toFixed(1)} <small className="text-[14px] text-slate-400 font-normal">/ 5</small>
            </div>
            <div className="text-[11px] text-slate-500 uppercase tracking-wide mt-0.5">AI Score</div>
          </div>
        )}
      </div>

      {/* Admin: assign auditor panel */}
      {isAdmin && <AssignAuditorPanel sessionId={sessionId!} currentAuditorName={detail.assigned_auditor_name} currentAuditorEmail={detail.assigned_auditor_email} />}

      {/* AI Audit Status */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm mb-5">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-[15px] font-semibold text-slate-800">AI Document Audit</h2>
        </div>
        <div className="p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AiStatusPill status={detail.ai_audit_status} />
            {detail.ai_audit_score != null && (
              <span className="text-[13px] text-slate-600">Score: <strong>{detail.ai_audit_score.toFixed(1)} / 5</strong></span>
            )}
          </div>
          {detail.ai_audit_report_url && (
            <a href={detail.ai_audit_report_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[12.5px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors">
              AI Doc Review Report <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>

      {/* Project details */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm mb-5">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-[15px] font-semibold text-slate-800">Project Information</h2>
        </div>
        <div className="p-5 grid grid-cols-2 md:grid-cols-3 gap-5">
          <DetailField label="Client Name" value={detail.client_name} />
          <DetailField label="Project Name" value={detail.project_name} />
          <DetailField label="Project Code" value={detail.project_code} />
          <DetailField label="Project Manager" value={detail.project_manager} />
          <DetailField label="Audit Type" value={detail.audit_type} />
          <DetailField label="Phase" value={detail.phase} />
          <DetailField label="SOW Signed Date" value={detail.sow_signed_date} />
          <DetailField label="Project Start Date" value={detail.project_start_date} />
          <DetailField label="Project End Date" value={detail.project_end_date} />
          <DetailField label="Estimated Budget" value={detail.estimated_budget} />
        </div>
      </div>

      {/* Documents */}
      {detail.documents.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm mb-5">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-[15px] font-semibold text-slate-800">Documents ({detail.documents.length})</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {detail.documents.map(doc => (
              <div key={doc.document_id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <FileText size={14} className="text-blue-600" />
                </div>
                <span className="flex-1 text-[13.5px] text-slate-700 truncate">{doc.file_name}</span>
                {doc.sharepoint_url ? (
                  <a href={doc.sharepoint_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-blue-600 border border-blue-200 rounded hover:bg-blue-50 transition-colors">
                    View <ExternalLink size={11} />
                  </a>
                ) : <span className="text-[12px] text-slate-300">No link</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 mt-2">
        <Link href={`/audit/start/${sessionId}/findings`}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[13.5px] font-semibold rounded-lg transition-colors">
          Upload Findings <ChevronRight size={14} />
        </Link>
        <Link href="/audit/start" className="text-[13px] text-slate-500 hover:text-slate-700">
          Back to queue
        </Link>
      </div>
    </AppShell>
  )
}
