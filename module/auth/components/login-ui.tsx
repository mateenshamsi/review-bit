'use client';
import React, { useState } from 'react';
import { Mail, Lock, Github, Loader2, Eye, EyeOff } from 'lucide-react';
import { set } from 'zod';
import { signIn } from '@/lib/auth-client';
import { Provider } from '@radix-ui/react-tooltip';

function LoginUI() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate API call
    setTimeout(() => {
      if (email && password) {
        console.log('Sign in:', { email, password });
        // Handle success
      } else {
        setError('Please fill in all fields');
      }
      setLoading(false);
    }, 1000);
  };

  const handleGithubSignIn = async  () => {
   setLoading(true);
   try{ 
    await signIn.social({provider:'github'});
   }
   catch(err){ 
    console.error(err);
    setError('GitHub sign-in failed');
    setLoading(false);
   }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-card rounded-lg shadow-lg border border-border p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-xl mb-4">
              <Lock className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Welcome back</h1>
            <p className="text-muted-foreground">Sign in to your account to continue</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <div className="space-y-4">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition text-foreground placeholder:text-muted-foreground"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition text-foreground placeholder:text-muted-foreground"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-input accent-primary" />
                <span className="text-muted-foreground">Remember me</span>
              </label>
              <button type="button" className="text-primary hover:text-primary/80 font-medium transition">
                Forgot password?
              </button>
            </div>

            {/* Sign In Button */}
            <button
              type="button"
              onClick={handleEmailSignIn}
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-md font-medium hover:bg-primary/90 focus:ring-4 focus:ring-ring/20 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-card text-muted-foreground">Or continue with</span>
            </div>
          </div>

          {/* Social Sign In */}
          <button
            type="button"
            onClick={handleGithubSignIn}
            disabled={loading}
            className="w-full border border-input cursor-pointer  text-foreground py-3 rounded-md font-medium hover:bg-accent hover:text-accent-foreground focus:ring-4 focus:ring-ring/20 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            <Github className="w-5 h-5" />
            Sign in with GitHub
          </button>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <button type="button" className="text-primary hover:text-primary/80 font-medium transition">
              Sign up
            </button>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          By signing in, you agree to our{' '}
          <button type="button" className="text-foreground hover:underline">Terms</button>
          {' '}and{' '}
          <button type="button" className="text-foreground hover:underline">Privacy Policy</button>
        </p>
      </div>
    </div>
  );
}

export default LoginUI;