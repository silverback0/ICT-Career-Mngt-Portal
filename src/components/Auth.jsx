import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // All required candidate registration fields
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [education, setEducation] = useState('');
  const [fieldOfStudy, setFieldOfStudy] = useState('');

  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    
    if (!isLogin && password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setLoading(true);

    if (isLogin) {
      // LOGIN FLOW
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        alert(error.message);
      } else if (data?.user) {
        const { data: profile, error: roleError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (roleError) {
          console.error("Profile fetch error:", roleError);
          navigate('/dashboard'); 
          setLoading(false);
          return;
        }

        if (profile.role === 'admin') {
          navigate('/admin-pipeline'); 
        } else {
          navigate('/dashboard'); 
        }
      }
    } else {
      // SIGN UP FLOW: Now packing all 5 structural metadata elements
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone_number: phoneNumber,
            national_id: nationalId,
            education: education,
            field_of_study: fieldOfStudy,
            role: 'intern'
          }
        }
      });

      if (error) {
        alert(error.message);
      } else {
        alert('Registration successful! Check your email or try logging in.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 px-4 py-8">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
        
        <div className="space-y-2 mb-6">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {isLogin ? 'Welcome back' : 'Sign up as a Candidate'}
          </h1>
          <p className="text-sm text-slate-400">
            {isLogin ? 'Enter your credentials to access your portal' : 'Get started with the ICT career management portal'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          
          {/* Sign Up Only Fields */}
          {!isLogin && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <input 
                  type="text" 
                  placeholder="e.g., Chris Mwangi" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)} 
                  required={!isLogin}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Phone Number
                  </label>
                  <input 
                    type="tel" 
                    placeholder="+2547..." 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)} 
                    required={!isLogin}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    National ID
                  </label>
                  <input 
                    type="text" 
                    placeholder="ID Number" 
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)} 
                    required={!isLogin}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Level of Education
                </label>
                <select
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  required={!isLogin}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                >
                  <option value="" disabled>Select your education status</option>
                  <option value="Undergraduate">Undergraduate</option>
                  <option value="Graduate">Graduate</option>
                  <option value="Diploma">Diploma</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Field of Study
                </label>
                <input 
                  type="text" 
                  placeholder="e.g., Computer Science" 
                  value={fieldOfStudy}
                  onChange={(e) => setFieldOfStudy(e.target.value)} 
                  required={!isLogin}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                />
              </div>
            </>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input 
              type="email" 
              placeholder="name@company.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
            />
          </div>

          {/* Password Field */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Password
              </label>
              {isLogin && (
                <a href="#" className="text-xs text-teal-400 hover:underline">Forgot password?</a>
              )}
            </div>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
            />
          </div>

          {/* Confirm Password */}
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Confirm Password
              </label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required={!isLogin}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
              />
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-500 text-white font-medium rounded-xl py-3 transition-colors shadow-lg shadow-teal-900/20 mt-2 disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setConfirmPassword('');
            }}
            className="text-teal-400 font-medium hover:underline focus:outline-none"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </p>

      </div>
    </div>
  );
};

export default Auth;