import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getFirstValidationError } from '@/utils/validation';
import AuthPageShell from './AuthPageShell';
import request from '@/utils/request';

const LoginForm = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    const result = z.object({
      email: z.string().trim().email(t('validation.email')),
      password: z.string().min(1, t('validation.required')),
    }).safeParse({ email, password });

    if (!result.success) {
      setError(getFirstValidationError(result.error, t('validation.required')));
      setIsLoading(false);
      return;
    }

    try {
      const response = await request.post('/api/auth/login', result.data);
      const data = response.data;

      login(data.token, data.user);
      navigate('/');
    } catch (err: any) {
      setError(getLoginErrorMessage(err.response?.data?.error, t) || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthPageShell
      title="Welcome Back"
      description="Sync your bookmarks and start your day."
      onSubmit={handleSubmit}
      footer={
        <>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
          <div className="text-sm text-center text-muted-foreground">
            Don&apos;t have an account? <Link to="/register" className="text-primary hover:underline">Register</Link>
          </div>
        </>
      }
    >
      {error && <div className="text-sm text-red-500 text-center">{error}</div>}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="m@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          className="bg-white/50 dark:bg-neutral-900/50"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          className="bg-white/50 dark:bg-neutral-900/50"
        />
      </div>
    </AuthPageShell>
  );
};

const getLoginErrorMessage = (serverMessage: string | undefined, t: TFunction) => {
  if (serverMessage === 'Account is disabled') {
    return t('auth.errors.accountDisabled');
  }

  if (serverMessage === 'Account has been deleted') {
    return t('auth.errors.accountDeleted');
  }

  return serverMessage || 'Login failed';
};

export default LoginForm;
