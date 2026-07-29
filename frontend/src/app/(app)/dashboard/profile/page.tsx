'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import API from '@/services/api';
import { User, Key, Check } from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function EditProfile() {
  const { user, updateUser } = useAuth();
  
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const { register: registerProfile, handleSubmit: handleProfileSubmit, setValue, formState: { errors: profileErrors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  });

  const { register: registerPassword, handleSubmit: handlePasswordSubmit, reset: resetPassword, formState: { errors: passwordErrors } } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    if (user) {
      setValue('name', user.name);
      setValue('email', user.email);
    }
  }, [user, setValue]);

  const onProfileSubmit = async (data: ProfileForm) => {
    setProfileSuccess(false);
    setProfileError(null);
    try {
      await updateUser(data.name, data.email);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      setProfileError(err.message || 'Profile update failed.');
    }
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    setPasswordSuccess(false);
    setPasswordError(null);
    try {
      const res = await API.put('/auth/change-password', data);
      if (res.data?.success) {
        setPasswordSuccess(true);
        resetPassword();
        setTimeout(() => setPasswordSuccess(false), 3000);
      }
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Password update failed.');
    }
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-black text-ink tracking-tight">Account Settings</h1>
        <p className="text-ink-soft mt-1">Manage your public credentials and security passwords.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Profile Card */}
        <div className="bg-surface p-8 rounded-3xl border border-border shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-ink flex items-center gap-2 border-b border-border pb-4">
            <User className="h-5 w-5 text-rose-600" /> General Credentials
          </h2>

          {profileSuccess && (
            <div className="p-4 bg-green-50 border border-green-200 text-green-700 text-sm font-medium rounded-2xl flex items-center gap-2">
              <Check className="h-4 w-4" /> Credentials updated successfully!
            </div>
          )}

          {profileError && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium rounded-2xl">
              {profileError}
            </div>
          )}

          <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
            <div>
              <label className="block text-stone-750 text-sm font-semibold mb-2">Full Name</label>
              <input
                type="text"
                {...registerProfile('name')}
                className={`w-full px-4 py-3 rounded-xl border ${profileErrors.name ? 'border-rose-500' : 'border-border-strong'} outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-ink text-sm`}
              />
              {profileErrors.name && <p className="text-rose-600 text-xs mt-1.5">{profileErrors.name.message}</p>}
            </div>

            <div>
              <label className="block text-stone-755 text-sm font-semibold mb-2">Email Address</label>
              <input
                type="email"
                {...registerProfile('email')}
                className={`w-full px-4 py-3 rounded-xl border ${profileErrors.email ? 'border-rose-500' : 'border-border-strong'} outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-ink text-sm`}
              />
              {profileErrors.email && <p className="text-rose-600 text-xs mt-1.5">{profileErrors.email.message}</p>}
            </div>

            <button type="submit" className="px-6 py-3 bg-night-elevated hover:bg-rose-600 text-white font-bold rounded-full text-xs shadow-md transition-colors">
              Save Profile Settings
            </button>
          </form>
        </div>

        {/* Password Card */}
        <div className="bg-surface p-8 rounded-3xl border border-border shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-ink flex items-center gap-2 border-b border-border pb-4">
            <Key className="h-5 w-5 text-rose-600" /> Password Security
          </h2>

          {passwordSuccess && (
            <div className="p-4 bg-green-50 border border-green-200 text-green-700 text-sm font-medium rounded-2xl flex items-center gap-2">
              <Check className="h-4 w-4" /> Password changed successfully!
            </div>
          )}

          {passwordError && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium rounded-2xl">
              {passwordError}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
            <div>
              <label className="block text-stone-755 text-sm font-semibold mb-2">Current Password</label>
              <input
                type="password"
                {...registerPassword('currentPassword')}
                className={`w-full px-4 py-3 rounded-xl border ${passwordErrors.currentPassword ? 'border-rose-500' : 'border-border-strong'} outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-ink text-sm`}
                placeholder="••••••••"
              />
              {passwordErrors.currentPassword && <p className="text-rose-600 text-xs mt-1.5">{passwordErrors.currentPassword.message}</p>}
            </div>

            <div>
              <label className="block text-stone-755 text-sm font-semibold mb-2">New Password</label>
              <input
                type="password"
                {...registerPassword('newPassword')}
                className={`w-full px-4 py-3 rounded-xl border ${passwordErrors.newPassword ? 'border-rose-500' : 'border-border-strong'} outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-ink text-sm`}
                placeholder="••••••••"
              />
              {passwordErrors.newPassword && <p className="text-rose-600 text-xs mt-1.5">{passwordErrors.newPassword.message}</p>}
            </div>

            <button type="submit" className="px-6 py-3 bg-night-elevated hover:bg-rose-600 text-white font-bold rounded-full text-xs shadow-md transition-colors">
              Update Password
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
