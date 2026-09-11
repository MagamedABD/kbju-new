import { useState } from 'react';
import { signIn, signUp, signInWithGoogle } from '../../shared/lib/use-auth';
import { trackEvent } from '../../shared/lib/analytics';
import { toUserMessage } from '../../shared/api/api-error';
import { isSupabaseConfigured } from '../../shared/api/supabase';
import { cn } from '../../shared/lib/cn';

type Mode = 'signin' | 'signup';

export function AuthForm() {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordValid = password.length >= 6;
  const canSubmit = emailValid && passwordValid && !busy;

  const handleSubmit = async (): Promise<void> => {
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === 'signup') {
        await signUp(email, password);
        trackEvent('sign_up');
        setNotice('Аккаунт создан. Если включено подтверждение email — проверьте почту.');
      } else {
        await signIn(email, password);
        trackEvent('sign_in');
      }
    } catch (e) {
      setError(toUserMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-5">
      <div className="mb-8 text-center">
        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">КБЖУ</div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">
          {mode === 'signin' ? 'Вход в аккаунт' : 'Регистрация'}
        </h1>
        <p className="mt-1 text-sm text-muted">Норма и дневник сохранятся в вашем аккаунте.</p>
      </div>

      {!isSupabaseConfigured && (
        <div className="mb-4 rounded-2xl border border-warn/30 bg-warn/5 p-4 text-sm text-warn" role="note">
          Backend не настроен: задайте VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY в переменных окружения.
        </div>
      )}

      <label className="text-sm font-semibold" htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mb-3 mt-1 w-full rounded-2xl border border-line bg-card px-4 py-3 text-base outline-none focus:border-brand"
        placeholder="you@example.com"
      />

      <label className="text-sm font-semibold" htmlFor="password">Пароль</label>
      <input
        id="password"
        type="password"
        autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={cn(
          'mt-1 w-full rounded-2xl border bg-card px-4 py-3 text-base outline-none focus:border-brand',
          password.length > 0 && !passwordValid ? 'border-warn' : 'border-line',
        )}
        placeholder="минимум 6 символов"
      />
      {password.length > 0 && !passwordValid && (
        <p role="alert" className="mt-1.5 text-[13px] font-medium text-warn">
          Пароль должен быть не короче 6 символов
        </p>
      )}

      {error && (
        <p role="alert" className="mt-3 rounded-2xl bg-warn/5 px-4 py-3 text-sm font-medium text-warn">
          {error}
        </p>
      )}
      {notice && (
        <p className="mt-3 rounded-2xl bg-brand-soft px-4 py-3 text-sm font-medium text-brand">{notice}</p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="mt-5 w-full rounded-2xl bg-brand py-3.5 text-sm font-semibold text-white disabled:opacity-40"
      >
        {busy ? 'Секунду…' : mode === 'signin' ? 'Войти' : 'Зарегистрироваться'}
      </button>

      <div className="my-4 flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-line" />или<span className="h-px flex-1 bg-line" />
      </div>

      <button
        type="button"
        onClick={async () => {
          setError(null);
          try {
            trackEvent('sign_in_google');
            await signInWithGoogle();
          } catch (e) {
            setError(toUserMessage(e));
          }
        }}
        className="w-full rounded-2xl border border-line bg-card py-3 text-sm font-semibold text-default"
      >
        Войти через Google
      </button>

      <button
        type="button"
        onClick={() => {
          setMode((m) => (m === 'signin' ? 'signup' : 'signin'));
          setError(null);
          setNotice(null);
        }}
        className="mt-4 text-center text-sm text-muted"
      >
        {mode === 'signin' ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
      </button>
    </div>
  );
}
