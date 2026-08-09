import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-black text-gray-100 mb-4 leading-none">404</div>
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
        <p className="text-gray-500 text-sm mb-6">The page you're looking for doesn't exist or you don't have permission to access it.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate(-1)} className="bg-gray-100 text-gray-700 text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-gray-200 transition-colors">
            Go Back
          </button>
          <button onClick={() => navigate('/dashboard')} className="bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors">
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
