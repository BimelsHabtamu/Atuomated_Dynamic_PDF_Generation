import { useAuth } from '../context/AuthContext';

function StatCard({ label, value, color }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 border-l-4 ${color}`}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
    </div>
  );
}
export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-sm text-gray-500 mt-1">
          Welcome, {user?.full_name}. Here's what's happening today.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Docs Generated Today" value="—"  color="border-blue-500" />
        <StatCard label="Pending Approvals"     value="—"  color="border-yellow-500" />
        <StatCard label="Avg Approval Time"     value="—"  color="border-green-500" />
        <StatCard label="Total Documents"       value="—"  color="border-purple-500" />
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-700 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <a href="/generate"  className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700">Generate Document</a>
          <a href="/templates" className="bg-gray-100 text-gray-700 text-sm px-4 py-2 rounded-lg hover:bg-gray-200">Manage Templates</a>
          <a href="/approvals" className="bg-yellow-100 text-yellow-700 text-sm px-4 py-2 rounded-lg hover:bg-yellow-200">View Approvals</a>
          <a href="/verify"    className="bg-green-100 text-green-700 text-sm px-4 py-2 rounded-lg hover:bg-green-200">Verify Document</a>
        </div>
      </div>
    </div>
  );
}
