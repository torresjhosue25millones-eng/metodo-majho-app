import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import JournalView from '../components/JournalView';

export default function Journal() {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8">
        <JournalView />
      </main>
      <Footer />
    </div>
  );
}
