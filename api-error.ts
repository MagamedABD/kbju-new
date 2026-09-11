/**
 * Приводит ошибку Supabase/сети к понятному пользователю сообщению на русском.
 * Логику держим отдельной чистой функцией — её удобно тестировать без сети.
 */

export interface ApiErrorLike {
  message?: string;
  status?: number;
  code?: string;
}

const BY_STATUS: Record<number, string> = {
  400: 'Некорректный запрос. Проверьте введённые данные.',
  401: 'Сессия не подтверждена. Войдите в аккаунт заново.',
  403: 'Недостаточно прав для этого действия.',
  404: 'Данные не найдены.',
  409: 'Конфликт данных. Обновите страницу и попробуйте снова.',
  429: 'Слишком много запросов. Немного подождите.',
  500: 'Ошибка на сервере. Повторите попытку позже.',
  503: 'Сервис временно недоступен. Повторите попытку позже.',
};

/** Перевод известных кодов аутентификации Supabase. */
const BY_MESSAGE: Array<[RegExp, string]> = [
  [/invalid login credentials/i, 'Неверный email или пароль.'],
  [/user already registered/i, 'Этот email уже зарегистрирован.'],
  [/email not confirmed/i, 'Email не подтверждён. Проверьте почту.'],
  [/password should be at least/i, 'Пароль слишком короткий (минимум 6 символов).'],
  [/failed to fetch|network/i, 'Нет соединения с сервером. Проверьте интернет.'],
];

export function toUserMessage(error: unknown): string {
  if (!error) return 'Неизвестная ошибка.';

  const e = error as ApiErrorLike;

  if (typeof e.message === 'string') {
    for (const [pattern, text] of BY_MESSAGE) {
      if (pattern.test(e.message)) return text;
    }
  }

  if (typeof e.status === 'number' && BY_STATUS[e.status]) {
    return BY_STATUS[e.status];
  }

  return e.message ?? 'Что-то пошло не так. Повторите попытку.';
}

/** Единая точка логирования ошибок (в self-hosted заменяется на отправку в лог-сервис). */
export function logError(scope: string, error: unknown): void {
  // eslint-disable-next-line no-console
  console.error(`[kbju:${scope}]`, error);
}
