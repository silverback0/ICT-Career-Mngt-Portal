import React, { useState, useEffect } from 'react';
import AdminPipeline from './pages/AdminPipeline';
import { JobProvider } from './context/JobContext';
import AdminDashboard from './pages/AdminDashboard';
import { supabase } from './supabaseClient';
import Auth from './components/Auth'; 
import InternDashboard from './pages/InternDashboard';
import LandingPage from './pages/LandingPage'; // 1. Import your Landing Page component

const RequireRole = ({ role, requiredRole, children, fallback }) => {
  if (role !== requiredRole) return fallback;
  return children;
};

function App() {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // 2. Track whether the user wants to see the login view vs landing page
  const [showAuth, setShowAuth] = useState(false);

  // LIFECYCLE 1: Monitor auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        if (event === 'TOKEN_REFRESHED') return;

        setSession(currentSession);

        if (!currentSession) {
          setRole(null);
          setLoading(false);
        }
      }
    );

    // Also get the initial session on first mount
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      if (!initialSession) {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // LIFECYCLE 2: Fetch role from profiles table
  useEffect(() => {
    if (!session?.user?.id) return;

    async function verifyUserRole() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error("Database Error:", error.message);
          setRole(null);
        } else {
          console.log("Role matched successfully:", data?.role);
          setRole(data?.role || null);
        }
      } catch (crash) {
        console.error("Network Exception:", crash);
        setRole(null);
      } finally {
        setLoading(false);
      }
    }

    verifyUserRole();
  }, [session?.user?.id]);

  // LIFECYCLE 3: Inactivity timeout — auto logout after 30 mins of no interaction
  useEffect(() => {
    if (!session) return;

    let timeout;
    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(async () => {
        await supabase.auth.signOut();
        window.location.reload();
      }, 30 * 60 * 1000); // 30 minutes
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timeout);
      events.forEach(e => window.removeEventListener(e, resetTimer));
    };
  }, [session]);

  // Loading spinner
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 font-medium text-slate-400 gap-3">
        <div className="w-9 h-9 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="tracking-wide text-sm">Verifying access credentials...</span>
      </div>
    );
  }

  // 3. LOGGED-OUT FLOW:
  // Show Landing Page by default. Pass `onNavigateToAuth` so buttons can trigger the Auth component.
  if (!session) {
    if (showAuth) {
      return (
        <div>
          {/* Back button so users aren't trapped on the Auth screen */}
          <div className="bg-slate-950 p-4">
            <button 
              onClick={() => setShowAuth(false)}
              className="text-slate-400 hover:text-white text-sm transition-colors"
            >
              ← Back to Home
            </button>
          </div>
          <Auth />
        </div>
      );
    }
    
    return <LandingPage onNavigateToAuth={() => setShowAuth(true)} />;
  }

  // 4. LOGGED-IN FLOW:
  return (
    <JobProvider>
      <RequireRole
        role={role}
        requiredRole="admin"
        fallback={<InternDashboard talentId={session.user.id} />}
      >
        <AdminDashboard />
      </RequireRole>
    </JobProvider>
  );
}

export default App;