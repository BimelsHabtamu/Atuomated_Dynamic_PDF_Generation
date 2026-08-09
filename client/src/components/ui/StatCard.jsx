export default function StatCard({ label, value, sub, icon, iconBg, trend }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1.5 leading-none">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          {icon}
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-1.5 pt-1 border-t border-gray-50">
          <span className={`text-xs font-semibold ${trend.up ? 'text-emerald-500' : 'text-red-400'}`}>
            {trend.up ? '↑' : '↓'} {trend.label}
          </span>
          <span className="text-xs text-gray-400">{trend.sub}</span>
        </div>
      )}
    </div>
  );
}
