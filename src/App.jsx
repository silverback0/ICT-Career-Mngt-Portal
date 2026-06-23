import React, { useState, useEffect } from 'react';
import { JobProvider } from './context/JobContext';
import AdminDashboard from './pages/AdminDashboard';
import AdminPipeline from './pages/AdminPipeline';
import { supabase } from './supabaseClient';
import Auth from './components/Auth'; 
import InternDashboard from './pages/InternDashboard';

function App() {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // LIFECYCLE 1: Natively monitor authentication states
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      
      // If there is no active user, instantly kill the loader and clear roles
      if (!currentSession) {
        setRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // LIFECYCLE 2: Isolated database profile fetcher
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
        // This execution guarantee prevents the screen from freezing permanently
        setLoading(false);
      }
    }

    verifyUserRole();
  }, [session]); // Fires cleanly only when the session object mutates

  // Render UI Layouts
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 font-medium text-slate-600 gap-3">
        <div className="w-9 h-9 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="tracking-wide text-sm">Verifying security access credentials...</span>
      </div>
    );
  }
  
  if (!session) return <Auth />;
  
  return (
    <JobProvider>
      {role === 'admin' ? (
        <AdminDashboard />
      ) : (
        // Always render InternDashboard. 
        // It will detect that 'profile' is null and show the form automatically.
        <InternDashboard talentId={session.user.id} />
      )}
    </JobProvider>
  );
}

export default App;