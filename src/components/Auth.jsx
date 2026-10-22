import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

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
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!isLogin && password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);

    if (isLogin) {
      // LOGIN FLOW
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        setErrorMsg(error.message);
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
        setErrorMsg(error.message);
      } else {
        setSuccessMsg('Registration successful. Check your email, or log in below.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 px-4 py-8">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
        
        <div className="space-y-2 mb-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isLogin ? 'Welcome back' : 'Sign up as a candidate'}
          </h1>
          <p className="text-sm text-slate-500">
            {isLogin ? 'Enter your credentials to access your portal' : 'Get started with TalentDeploy'}
          </p>
        </div>

        {errorMsg && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-3 mb-4">
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          
          {/* Sign Up Only Fields */}
          {!isLogin && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Full Name
                </label>
                <input 
                  type="text" 
                  placeholder="e.g., Chris Mwangi" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)} 
                  required={!isLogin}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                    Phone Number
                  </label>
                  <input 
                    type="tel" 
                    placeholder="+2547..." 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)} 
                    required={!isLogin}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                    National ID
                  </label>
                  <input 
                    type="text" 
                    placeholder="ID Number" 
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)} 
                    required={!isLogin}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Level of Education
                </label>
                <select
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  required={!isLogin}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                >
                  <option value="" disabled>Select your education status</option>
                  <option value="Undergraduate">Undergraduate</option>
                  <option value="Graduate">Graduate</option>
                  <option value="Diploma">Diploma</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Field of Study
                </label>
                <input 
                  type="text" 
                  placeholder="e.g., Computer Science" 
                  value={fieldOfStudy}
                  onChange={(e) => setFieldOfStudy(e.target.value)} 
                  required={!isLogin}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                />
              </div>
            </>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Email Address
            </label>
            <input 
              type="email" 
              placeholder="name@company.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
            />
          </div>

          {/* Password Field */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Password
              </label>
              {isLogin && (
                <a href="#" className="text-xs text-amber-700 hover:underline">Forgot password?</a>
              )}
            </div>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
            />
          </div>

          {/* Confirm Password */}
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Confirm Password
              </label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required={!isLogin}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
              />
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold rounded-lg py-3 transition-colors mt-2 disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setConfirmPassword('');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className="text-amber-700 font-semibold hover:underline focus:outline-none"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </p>

      </div>
    </div>
  );
};

export default Auth;