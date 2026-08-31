import { useState } from 'react';
import { AuthForm } from './features/auth/AuthForm';
import { Onboarding } from './features/onboarding/Onboarding';
import { DiaryPage } from './pages/DiaryPage';
import { useAuth, signOut } from './shared/lib/use-auth';
import { useProfile } from './shared/lib/use-profile';
import { useDiary } from './shared/lib/use-diary';
import { toUserMessage } from './shared/api/api-error';
import type { UserParams } from './entities/nutrition/types';

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen items-center justify-center px-6 text-center text-muted">{children}</div>;
}

export function App() {
  const { session, loading: authLoading } = useAuth();
  const userId = session?.user.id;

  const { params, norm, loading: profileLoading, error: profileError, saveProfile } = useProfile(userId);
  const { entries, error: diaryError, addEntry, removeEntry } = useDiary(userId);

  const [editingGoal, setEditingGoal] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (authLoading) return <Centered>Загрузка…</Centered>;
  if (!session) return <AuthForm />;
  if (profileLoading) return <Centered>Загружаем профиль…</Centered>;
  if (profileError) return <Centered>{profileError}</Centered>;

  const handleOnboarding = async (next: UserParams): Promise<void> => {
    setSaveError(null);
    try {
      await saveProfile(next);
      setEditingGoal(false);
    } catch (e) {
      setSaveError(toUserMessage(e));
    }
  };

  if (!params || !norm || editingGoal) {
    return (
      <div>
        {saveError && (
          <p role="alert" className="mx-auto mt-4 max-w-md rounded-2xl bg-warn/5 px-4 py-3 text-center text-sm font-medium text-warn">
            {saveError}
          </p>
        )}
        <Onboarding onSubmit={handleOnboarding} />
      </div>
    );
  }

  return (
    <>
      {diaryError && (
        <p role="alert" className="mx-auto mt-4 max-w-md rounded-2xl bg-warn/5 px-4 py-3 text-center text-sm font-medium text-warn">
          {diaryError}
        </p>
      )}
      <DiaryPage
        norm={norm}
        entries={entries}
        onAddEntry={(e) => void addEntry(e)}
        onRemoveEntry={(id) => void removeEntry(id)}
        onEditGoal={() => setEditingGoal(true)}
        onSignOut={() => void signOut()}
      />
    </>
  );
}
