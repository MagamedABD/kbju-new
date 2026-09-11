import { describe, expect, it } from 'vitest';
import { toUserMessage } from './api-error';

describe('toUserMessage', () => {
  it('переводит неверные учётные данные', () => {
    expect(toUserMessage({ message: 'Invalid login credentials' })).toBe(
      'Неверный email или пароль.',
    );
  });

  it('распознаёт уже зарегистрированный email', () => {
    expect(toUserMessage({ message: 'User already registered' })).toBe(
      'Этот email уже зарегистрирован.',
    );
  });

  it('маппит HTTP-статусы на сообщения', () => {
    expect(toUserMessage({ status: 401 })).toContain('Войдите');
    expect(toUserMessage({ status: 403 })).toContain('прав');
    expect(toUserMessage({ status: 500 })).toContain('сервере');
  });

  it('ловит сетевую ошибку', () => {
    expect(toUserMessage({ message: 'Failed to fetch' })).toContain('соединения');
  });

  it('отдаёт запасное сообщение для пустой ошибки', () => {
    expect(toUserMessage(null)).toBe('Неизвестная ошибка.');
  });
});
