const ACTION_STYLES = {
  GENERATE: { bg: 'bg-blue-100',   text: 'text-blue-700',   label: 'Generate' },
  SIGN:     { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Sign'     },
  DELIVER:  { bg: 'bg-green-100',  text: 'text-green-700',  label: 'Deliver'  },
  VERIFY:   { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Verify'   },
  PREVIEW:  { bg: 'bg-gray-100',   text: 'text-gray-600',   label: 'Preview'  },
};

const STATUS_STYLES = {
  draft:     { bg: 'bg-gray-100',   text: 'text-gray-600'   },
  pending:   { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  signed:    { bg: 'bg-blue-100',   text: 'text-blue-700'   },
  delivered: { bg: 'bg-green-100',  text: 'text-green-700'  },
  rejected:  { bg: 'bg-red-100',    text: 'text-red-600'    },
};

function ActionBadge({ action }) {
  const s = ACTION_STYLES[action] || ACTION_STYLES.PREVIEW;
  return (
    <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.draft;
  return (
    <span className={`inline-flex items-center text-[11px] font-medium px-2.5 py-1 rounded-full capitalize ${s.bg} ${s.text}`}>
      {status}
    </span>
  );
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function ActivityTable({ rows = [] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-900">Recent Activity</h3>
          <p className="text-xs text-gray-400 mt-0.5">Latest document actions across the system</p>
        </div>
        <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-lg font-medium">
          {rows.length} records
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['Document ID', 'Template', 'Action', 'Status', 'User', 'Date'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center">
                  <svg className="w-10 h-10 text-gray-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-sm text-gray-400">No recent activity</p>
                </td>
              </tr>
            )}
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">{row.doc_id}</span>
                </td>
                <td className="px-5 py-4 text-gray-700 font-medium text-xs">{row.template}</td>
                <td className="px-5 py-4"><ActionBadge action={row.action} /></td>
                <td className="px-5 py-4"><StatusBadge status={row.status} /></td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold text-white">{row.user.charAt(0)}</span>
                    </div>
                    <span className="text-xs text-gray-600">{row.user}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">{formatDate(row.date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
