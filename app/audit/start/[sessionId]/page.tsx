'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import Link from 'next/dist/client/link'
import { Loader2, FileText, ExternalLink, ChevronRight, AlertCircle, Zap } from 'lucide-react'
import { config } from '@/lib/config'
import { TokenStore } from '@/services/api'
import { useCurrentUser } from '@/hooks'

function FormField({ label, value, fullWidth }: {
  label: string; value?: string | null; fullWidth?: boolean
}) {
  return (
    <div className={`flex flex-col gap-1 ${fullWidth ? 'col-span-2' : ''}`}>
      <label className="text-[13px] font-semibold text-slate-700">{label}</label>
      <div className="px-3 py-2.5 border border-slate-300 rounded bg-white text-[13.5px] text-slate-800 min-h-[40px]">
        {value || <span className="text-slate-400 italic">—</span>}
      </div>
    </div>
  )
}

// Status pill for AI audit pipeline status
function AiStatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending:  'bg-yellow-50 text-yellow-700 border-yellow-200',
    done:     'bg-green-50  text-green-700  border-green-200',
    failed:   'bg-red-50    text-red-700    border-red-200',
    running:  'bg-blue-50   text-blue-700   border-blue-200',
  }
  const colour = map[status] ?? 'bg-slate-50 text-slate-600 border-slate-200'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${colour}`}>
      {status}
    </span>
  )
}

export default function ProjectDetailsPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const { data: currentUser } = useCurrentUser()
  const [detail, setDetail]   = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  // RBAC guard — admins and auditors only
  const canAccess = !currentUser || currentUser.role === 'admin' || currentUser.role === 'auditor'

  useEffect(() => {
    if (!sessionId) return
    fetch(`${config.apiUrl}/polaris/audit/${sessionId}/details`, {
      headers: { Authorization: `Bearer ${TokenStore.getAccess() ?? ''}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject(`Error ${r.status}`))
      .then(setDetail)
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false))
  }, [sessionId])

  if (!canAccess) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center">
          <AlertCircle size={40} className="text-slate-300" />
          <h2 className="text-lg font-semibold text-slate-700">Access Restricted</h2>
          <p className="text-slate-500 text-sm">You don't have permission to view this page.</p>
          <Link href="/home" className="text-blue-600 hover:underline text-sm mt-2">Go to Home</Link>
        </div>
      </AppShell>
    )
  }

  if (loading) return (
    <AppShell>
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 size={28} className="animate-spin text-blue-500" />
      </div>
    </AppShell>
  )
  if (error || !detail) return (
    <AppShell><div className="p-6 text-red-600">{error ?? 'Not found'}</div></AppShell>
  )

  const isStarAudit = detail.audit_type === 'STAR'

  // "Get AI Review" URL — uses the real SP item ID so the pipeline can
  // call get_audit_context(item_id) to fetch project + documents from SharePoint.
  // Falls back to session-only view if SP item ID is not yet available.
  const aiReviewUrl = detail.sharepoint_item_id
    ? `/ai-audit?item_id=${encodeURIComponent(detail.sharepoint_item_id)}`
    : null

  return (
    <AppShell>
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[12px] text-slate-400 mb-5">
        <Link href="/home" className="hover:text-blue-600">Home</Link>
        <span>›</span>
        <Link href="/audit/start" className="hover:text-blue-600">Start Audit</Link>
        <span>›</span>
        <span className="text-slate-600">Project Details</span>
      </div>

      {/* Header row: client name + AI status + Get AI Review button */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{detail.client_name}</h1>
          <p className="text-[14px] text-slate-500">{detail.project_name}</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* AI pipeline status badge */}
          <div className="flex flex-col items-end gap-1">
            <span className="text-[11px] text-slate-400 font-medium">AI Audit Status</span>
            <AiStatusPill status={detail.ai_audit_status ?? 'pending'} />
          </div>

          {/* Get AI Review — only shown when SP item ID is available */}
          {aiReviewUrl ? (
            <a
              href={aiReviewUrl}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold rounded-lg transition-colors"
            >
              <Zap size={14} />
              Get AI Review
            </a>
          ) : (
            <span className="text-[12px] text-slate-400 italic">AI Review not yet available</span>
          )}

          {/* View report if AI audit is done */}
          {detail.ai_audit_report_url && (
            <a
              href={detail.ai_audit_report_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-300 hover:border-slate-400 text-slate-700 text-[13px] font-semibold rounded-lg transition-colors"
            >
              <ExternalLink size={13} />
              View AI Report
            </a>
          )}
        </div>
      </div>

      {/* Form fields card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mb-5">
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          {isStarAudit ? (
            <>
              <FormField label="Estimated SOW Signed Date"        value={detail.sow_signed_date} />
              <FormField label="Project Start Date (as per SOW)"  value={detail.project_start_date} />
              <FormField label="Project End Date (as per SOW)"    value={detail.project_end_date} />
              <FormField label="Project Duration (in months)"     value={detail.project_duration_months} />
              <FormField label="Project Duration (in weeks)"      value={detail.project_duration_weeks} />
              <FormField label="Estimated Budget (as per SOW) ($)" value={detail.estimated_budget} />
              <FormField label="Estimated Project Margin (%)"     value={detail.estimated_project_margin} />
              <FormField label="Discount Provided?"               value={detail.discount_provided} />
              <FormField label="Discount (%)"                     value={detail.discount_percentage} />
              <FormField label="Discount Approver's Email"        value={detail.discount_approver_email} />
              <FormField label="Project Details"                  value={detail.project_details} fullWidth />
            </>
          ) : (
            <>
              <FormField label="SOW Signed Date"              value={detail.sow_signed_date} />
              <FormField label="Phase"                        value={detail.phase} />
              <FormField label="Project Start Date"           value={detail.project_start_date} />
              <FormField label="Project End Date"             value={detail.project_end_date} />
              <FormField label="Actual Project Start Date"    value={detail.actual_project_start_date} />
              <FormField label="Estimated Project End Date"   value={detail.estimated_project_end_date} />
              <FormField label="Project Duration (months)"    value={detail.project_duration_months} />
              <FormField label="Project Duration (weeks)"     value={detail.project_duration_weeks} />
              <FormField label="Estimated Budget ($)"         value={detail.estimated_budget} />
              <FormField label="Consumed Budget ($)"          value={detail.consumed_budget} />
              <FormField label="Current Project Margin (%)"   value={detail.current_project_margin} />
              <FormField label="SharePoint Link"              value={detail.sharepoint_link} fullWidth />
              <FormField label="Project Details"              value={detail.project_details} fullWidth />
            </>
          )}
        </div>

        {/* Documents list */}
        {detail.documents?.length > 0 && (
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[13px] font-semibold text-slate-700 mb-3">Submitted Documents</p>
            <div className="flex flex-col gap-3">
              {detail.documents.map((doc: any) => (
                <div key={doc.document_id ?? doc.file_name} className="flex items-center gap-3 group">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
                    <FileText size={16} className="text-slate-500" />
                  </div>
                  <span className="flex-1 text-[13.5px] text-slate-700 truncate">{doc.file_name}</span>
                  {doc.sharepoint_url ? (
                    <a href={doc.sharepoint_url} target="_blank" rel="noopener noreferrer"
                      className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold rounded-lg transition-colors">
                      View Document <ExternalLink size={13} />
                    </a>
                  ) : (
                    <span className="text-[12px] text-slate-400 italic">No link available</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Auditor assignment info */}
        {detail.assigned_auditor_name && (
          <div className="mt-5 pt-4 border-t border-slate-100">
            <p className="text-[12px] text-slate-500 font-medium mb-1">Assigned Auditor</p>
            <p className="text-[13.5px] text-slate-800 font-semibold">{detail.assigned_auditor_name}</p>
            {detail.assigned_auditor_email && (
              <p className="text-[12px] text-slate-500">{detail.assigned_auditor_email}</p>
            )}
          </div>
        )}

        {/* Bottom action row */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3 flex-wrap">
          <Link
            href={`/audit/start/${sessionId}/findings`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white text-[14px] font-semibold rounded-lg transition-colors"
          >
            Upload Findings <ChevronRight size={16} />
          </Link>

          {aiReviewUrl && (
            <a
              href={aiReviewUrl}
              className="inline-flex items-center gap-2 px-5 py-3 border border-blue-300 hover:border-blue-500 text-blue-700 text-[13.5px] font-semibold rounded-lg transition-colors"
            >
              <Zap size={14} />
              Get AI Review
            </a>
          )}
        </div>
      </div>
    </AppShell>
  )
}
