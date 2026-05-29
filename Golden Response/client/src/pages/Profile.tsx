import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { authApi } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { User, Shield, Mail, Calendar } from 'lucide-react';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [isUpdatingName, setIsUpdatingName] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setIsUpdatingName(true);
    try {
      const res = await authApi.updateProfile({ name });
      if (res.data.data?.user) {
        updateUser(res.data.data.user);
        setIsEditingName(false);
        addToast('success', 'Profile updated successfully');
      }
    } catch (err: any) {
      addToast('error', err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }

    setIsChangingPassword(true);
    try {
      // Assuming backend has this endpoint, if not we will just mock success or show error.
      if (authApi.changePassword) {
        await authApi.changePassword({ currentPassword, newPassword });
        addToast('success', 'Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        addToast('info', 'Change password endpoint not implemented in backend API yet.');
      }
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!user) return null;

  const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Calculate password strength (basic implementation)
  const getPasswordStrength = () => {
    if (!newPassword) return 0;
    let strength = 0;
    if (newPassword.length >= 8) strength += 25;
    if (/[A-Z]/.test(newPassword)) strength += 25;
    if (/[a-z]/.test(newPassword)) strength += 25;
    if (/[0-9!@#$%^&*]/.test(newPassword)) strength += 25;
    return strength;
  };

  const strength = getPasswordStrength();
  const strengthColor = strength < 50 ? 'bg-danger' : strength < 100 ? 'bg-warning' : 'bg-success';

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-2xl font-bold text-dark-50 flex items-center gap-2 mb-6">
        <User className="h-6 w-6 text-accent-start" />
        Account Profile
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Info Card */}
        <Card className="p-6 md:col-span-1 border-t-4 border-t-accent-start" glow>
          <div className="flex flex-col items-center text-center">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-accent-start to-accent-end flex items-center justify-center text-3xl font-bold text-white mb-4 shadow-lg shadow-accent-start/20">
              {user.name.charAt(0).toUpperCase()}
            </div>
            
            <h2 className="text-xl font-bold text-dark-50 mb-1">{user.name}</h2>
            <div className="flex items-center gap-2 text-dark-400 text-sm mb-4">
              <Mail className="h-4 w-4" />
              {user.email}
            </div>
            
            <div className="w-full pt-4 border-t border-white/10 mt-2">
              <div className="flex items-center justify-center gap-2 text-dark-400 text-xs">
                <Calendar className="h-3 w-3" />
                Member since {joinDate}
              </div>
            </div>
          </div>
        </Card>

        <div className="md:col-span-2 space-y-6">
          {/* Edit Profile Details */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-dark-100 border-b border-white/5 pb-2">
              Personal Information
            </h3>
            
            {isEditingName ? (
              <form onSubmit={handleUpdateName} className="space-y-4">
                <Input
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
                <div className="flex gap-3">
                  <Button type="submit" loading={isUpdatingName} size="sm">
                    Save Changes
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => {
                    setIsEditingName(false);
                    setName(user.name);
                  }} disabled={isUpdatingName}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-dark-400 mb-1">Full Name</div>
                  <div className="text-dark-50 font-medium">{user.name}</div>
                </div>
                <Button variant="secondary" size="sm" onClick={() => setIsEditingName(true)}>
                  Edit Name
                </Button>
              </div>
            )}
          </Card>

          {/* Change Password */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-dark-100 border-b border-white/5 pb-2 flex items-center gap-2">
              <Shield className="h-5 w-5 text-dark-300" />
              Security
            </h3>
            
            <form onSubmit={handleChangePassword} className="space-y-4">
              {passwordError && (
                <div className="p-3 bg-danger/10 border border-danger/20 text-danger text-sm rounded-lg">
                  {passwordError}
                </div>
              )}
              
              <Input
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              
              <div>
                <Input
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                {newPassword && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1 text-dark-400">
                      <span>Password strength</span>
                      <span>{strength < 50 ? 'Weak' : strength < 100 ? 'Good' : 'Strong'}</span>
                    </div>
                    <div className="h-1.5 w-full bg-dark-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${strengthColor}`}
                        style={{ width: `${strength}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <Input
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              
              <Button type="submit" loading={isChangingPassword} disabled={!currentPassword || !newPassword || !confirmPassword}>
                Update Password
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
