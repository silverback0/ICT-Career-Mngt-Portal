import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom'; // 1. Added navigation

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate(); // 2. Initialize navigate

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      // 3. Attempt Login
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        alert(error.message);
      } else if (data?.user) {
        // 4. Fetch the user's role from your 'profiles' table
        const { data: profile, error: roleError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (roleError) {
          console.error("Profile fetch error:", roleError);
          navigate('/dashboard'); // Fallback default
          return;
        }

        // 5. Route Based on Role
        if (profile.role === 'admin') {
          console.log("Welcome Admin!");
          navigate('/admin-pipeline'); // The Manager's Kanban page
        } else {
          console.log("Welcome Intern!");
          navigate('/dashboard'); // The Intern's personal page
        }
      }
    } else {
      // Sign Up Flow
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) alert(error.message);
      else alert('Check your email for confirmation!');
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <form onSubmit={handleAuth} className="p-8 bg-white rounded-xl shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-slate-800">
          {isLogin ? 'Login' : 'Sign Up'}
        </h2>
        <div className="space-y-4">
          <input 
            type="email" 
            placeholder="Email" 
            className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            onChange={(e) => setEmail(e.target.value)} 
            required
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            onChange={(e) => setPassword(e.target.value)} 
            required
          />
          <button 
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </div>
        <p 
          className="mt-6 text-sm text-center cursor-pointer text-teal-600 hover:underline font-medium" 
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
        </p>
      </form>
    </div>
  );
};

export default Auth;