'use client';

import { useState, ReactNode } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface FormField {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  icon?: ReactNode;
  required?: boolean;
}

interface AuthFormProps {
  title: string;
  subtitle?: string;
  fields: FormField[];
  onSubmit: (data: Record<string, string>) => Promise<void>;
  submitButtonText: string;
  footerText: string;
  footerLinkText: string;
  footerLinkHref: string;
  isLoading?: boolean;
}

export function AuthForm({
  title,
  subtitle,
  fields,
  onSubmit,
  submitButtonText,
  footerText,
  footerLinkText,
  footerLinkHref,
  isLoading = false,
}: Readonly<AuthFormProps>) {
  const [formData, setFormData] = useState<Record<string, string>>(
    fields.reduce((acc, field) => ({ ...acc, [field.id]: '' }), {})
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    fields.forEach(field => {
      if (field.required && !formData[field.id].trim()) {
        newErrors[field.id] = `${field.label} is required`;
      }
      if (field.type === 'email' && formData[field.id]) {
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
        if (!emailRegex.test(formData[field.id])) {
          newErrors[field.id] = 'Please enter a valid email';
        }
      }
      if (field.type === 'password' && formData[field.id]) {
        if (formData[field.id].length < 8) {
          newErrors[field.id] = 'Password must be at least 8 characters';
        }
      }
    });

    // Check if passwords match for sign up
    if (formData.confirmPassword && formData.password) {
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setErrors(prev => ({ ...prev, submit: errorMessage }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = (fieldId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [fieldId]: !prev[fieldId],
    }));
  };

  const getFieldIcon = (field: FormField) => {
    if (field.icon) return field.icon;
    if (field.type === 'email') return <Mail className='w-4 h-4' />;
    if (field.type === 'password') return <Lock className='w-4 h-4' />;
    if (field.id === 'fullName') return <User className='w-4 h-4' />;
    return null;
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-linear-to-br from-slate-950 via-purple-900/20 to-slate-950 px-4 py-12'>
      <Card className='w-full max-w-md bg-black/40 backdrop-blur-md border border-white/10'>
        <div className='px-6 py-8'>
          {/* Header */}
          <div className='mb-8 text-center'>
            <h1 className='text-3xl font-bold text-white mb-2'>{title}</h1>
            {subtitle && <p className='text-white/60 text-sm'>{subtitle}</p>}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className='space-y-4'>
            {errors.submit && (
              <div className='p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm'>
                {errors.submit}
              </div>
            )}

            {fields.map(field => (
              <div key={field.id} className='space-y-1.5'>
                <label
                  htmlFor={field.id}
                  className='block text-sm font-medium text-white/80'
                >
                  {field.label}
                  {field.required && <span className='text-amber-400'>*</span>}
                </label>

                <div className='relative'>
                  <div className='absolute left-3 top-1/2 -translate-y-1/2 text-white/40'>
                    {getFieldIcon(field)}
                  </div>

                  <input
                    id={field.id}
                    name={field.id}
                    type={
                      field.type === 'password' && showPasswords[field.id]
                        ? 'text'
                        : field.type
                    }
                    placeholder={field.placeholder}
                    value={formData[field.id]}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-10 py-2.5 rounded-lg bg-white/5 border transition-all outline-none text-white placeholder-white/40 focus:bg-white/10 focus:border-amber-400/50 ${
                      errors[field.id]
                        ? 'border-red-500/50 focus:border-red-500'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  />

                  {field.type === 'password' && (
                    <button
                      type='button'
                      onClick={() => togglePasswordVisibility(field.id)}
                      className='absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors'
                      aria-label={
                        showPasswords[field.id] ? 'Hide password' : 'Show password'
                      }
                    >
                      {showPasswords[field.id] ? (
                        <EyeOff className='w-4 h-4' />
                      ) : (
                        <Eye className='w-4 h-4' />
                      )}
                    </button>
                  )}
                </div>

                {errors[field.id] && (
                  <p className='text-xs text-red-400'>{errors[field.id]}</p>
                )}
              </div>
            ))}

            {/* Submit Button */}
            <Button
              type='submit'
              disabled={isSubmitting || isLoading}
              className='w-full mt-6 bg-amber-500 hover:bg-amber-600 text-black font-semibold h-10'
            >
              {isSubmitting || isLoading ? 'Loading...' : submitButtonText}
            </Button>
          </form>

          {/* Footer */}
          <div className='mt-6 text-center text-sm text-white/60'>
            {footerText}{' '}
            <Link
              href={footerLinkHref}
              className='text-amber-400 hover:text-amber-300 transition-colors font-medium'
            >
              {footerLinkText}
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
