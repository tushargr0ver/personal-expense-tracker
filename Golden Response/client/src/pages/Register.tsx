import { useState, type FormEvent, useMemo } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Mail, Lock, User, Sparkles, Check, X } from 'lucide-react';
import axios from 'axios';

function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: 'Weak', color: '#ef4444' };
  if (score <= 2) return { score, label: 'Fair', color: '#f59e0b' };
  if (score <= 3) return { score, label: 'Good', color: '#eab308' };
  if (score <= 4) return { score, label: 'Strong', color: '#10b981' };
  return { score, label: 'Very Strong', color: '#10b981' };
}

const PASSWORD_REQUIREMENTS = [
  { test: (p: string) => p.length >= 8, label: 'At least 8 characters' },
  { test: (p: string) => /[A-Z]/.test(p), label: 'One uppercase letter' },
  { test: (p: string) => /[a-z]/.test(p), label: 'One lowercase letter' },
  { test: (p: string) => /[0-9]/.test(p), label: 'One number' },
];

export default function Register() {
  const { register, isAuthenticated, isLoading: authLoading } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  if (authLoading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    else if (name.trim().length < 2)
      newErrors.name = 'Name must be at least 2 characters';

    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email))
      newErrors.email = 'Enter a valid email address';

    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 8)
      newErrors.password = 'Password must be at least 8 characters';
    else if (!/[a-z]/.test(password))
      newErrors.password = 'Password must contain at least one lowercase letter';
    else if (!/[A-Z]/.test(password))
      newErrors.password = 'Password must contain at least one uppercase letter';
    else if (!/[0-9]/.test(password))
      newErrors.password = 'Password must contain at least one number';

    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;

    setIsLoading(true);
    try {
      await register(name.trim(), email, password);
      addToast('success', 'Account created successfully! Welcome to SpendWise.');
      navigate('/dashboard');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data;
        let msg = data?.message || 'Registration failed. Please try again.';
        if (data?.errors && data.errors.length > 0) {
          msg = data.errors.join(', ');
        }
        setApiError(msg);
      } else {
        setApiError('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen auth-bg flex items-center justify-center p-4">
      {/* Decorative elements */}
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-accent-mid/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-accent-start/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md animate-scale-in">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-start to-accent-end shadow-xl shadow-accent-mid/25 mb-4">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">SpendWise</h1>
          <p className="text-dark-400 text-sm mt-2">
            Start tracking your expenses today
          </p>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          <h2 className="text-xl font-semibold text-dark-100 mb-1">
            Create your account
          </h2>
          <p className="text-sm text-dark-400 mb-6">
            Join thousands managing their finances smarter
          </p>

          {apiError && (
            <div className="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400 animate-slide-down">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              id="register-name"
              label="Full Name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              icon={<User className="h-4 w-4" />}
              autoComplete="name"
            />

            <Input
              id="register-email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              icon={<Mail className="h-4 w-4" />}
              autoComplete="email"
            />

            <div>
              <Input
                id="register-password"
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                icon={<Lock className="h-4 w-4" />}
                autoComplete="new-password"
              />

              {/* Password strength */}
              {password && (
                <div className="mt-3 space-y-2 animate-slide-down">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${(strength.score / 5) * 100}%`,
                          backgroundColor: strength.color,
                        }}
                      />
                    </div>
                    <span
                      className="text-xs font-medium"
                      style={{ color: strength.color }}
                    >
                      {strength.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {PASSWORD_REQUIREMENTS.map((req) => {
                      const met = req.test(password);
                      return (
                        <div
                          key={req.label}
                          className="flex items-center gap-1.5"
                        >
                          {met ? (
                            <Check className="h-3 w-3 text-success flex-shrink-0" />
                          ) : (
                            <X className="h-3 w-3 text-dark-500 flex-shrink-0" />
                          )}
                          <span
                            className={`text-[11px] ${
                              met ? 'text-dark-300' : 'text-dark-500'
                            }`}
                          >
                            {req.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <Input
              id="register-confirm-password"
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              icon={<Lock className="h-4 w-4" />}
              autoComplete="new-password"
            />

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={isLoading}
              id="register-submit-btn"
            >
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-dark-400 mt-6">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-accent-mid hover:text-accent-start transition-colors font-medium"
              id="register-login-link"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
