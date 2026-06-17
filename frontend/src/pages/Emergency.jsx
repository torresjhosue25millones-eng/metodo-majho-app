import Navbar from '../components/layout/Navbar';
import EmergencyView from '../components/EmergencyView';

export default function Emergency() {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8">
        <EmergencyView />
      </main>
    </div>
  );
}
