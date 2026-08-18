import PublicNavbar from './PublicNavbar';
import Footer from './Footer';

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PublicNavbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
