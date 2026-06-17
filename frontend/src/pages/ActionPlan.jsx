import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ActionPlanView from '../components/ActionPlanView';

export default function ActionPlan() {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        <ActionPlanView />
      </main>
      <Footer />
    </div>
  );
}
