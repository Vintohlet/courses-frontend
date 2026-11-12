import { createI18n, useI18n } from 'vue-i18n'
import { messages } from './messages'
export type AppLocale = 'ru' | 'en'
function initialLocale(): AppLocale {
  try {
    const saved = localStorage.getItem('coursework.locale')
    if (saved === 'ru' || saved === 'en') return saved
  } catch {
    /* Use the default when storage is unavailable. */
  }
  return 'ru'
}
export const i18n = createI18n({
  legacy: false,
  locale: initialLocale(),
  fallbackLocale: 'en',
  flatJson: true,
  messages: structuredClone(messages),
})
export function syncLocale(value: string) {
  if (value !== 'ru' && value !== 'en') return
  document.documentElement.lang = value
  document.title =
    value === 'ru' ? 'Coursework — Учебная платформа' : 'Coursework — Learning platform'
  try {
    localStorage.setItem('coursework.locale', value)
  } catch {
    /* Keep selection in memory. */
  }
}
const apiErrors: Record<string, [string, string]> = {
  'One or more interests are unknown or inactive': [
    'Choose interests from the available topics.',
    'Выберите интересы из доступного списка тем.',
  ],
  'Invalid credentials': ['Invalid email or password.', 'Неверная почта или пароль.'],
  'Invalid email or password': ['Invalid email or password.', 'Неверная почта или пароль.'],
  'Email is already registered': [
    'This email is already registered.',
    'Эта почта уже зарегистрирована.',
  ],
  Unauthorized: ['Please sign in to continue.', 'Войдите, чтобы продолжить.'],
  'Course not found': ['Course not found.', 'Курс не найден.'],
  'User not found': ['User not found.', 'Пользователь не найден.'],
  'Enroll in the course to access its content': [
    'Enroll in this course to access its lessons.',
    'Запишитесь на курс, чтобы открыть уроки.',
  ],
  'Enroll in the course first': ['Enroll in this course first.', 'Сначала запишитесь на курс.'],
  'Course already completed': [
    'You have already completed this course.',
    'Вы уже завершили этот курс.',
  ],
  'Course already in progress': [
    'You are already enrolled in this course.',
    'Вы уже записаны на этот курс.',
  ],
  'Course already in progress or completed': [
    'You are already enrolled in this course.',
    'Вы уже записаны на этот курс.',
  ],
  'Cannot enroll in a course without lessons': [
    'This course has no lessons yet.',
    'В этом курсе пока нет уроков.',
  ],
  'Complete the course before reviewing it': [
    'Complete this course before leaving a review.',
    'Завершите курс, чтобы оставить отзыв.',
  ],
  'Lesson not found in this course': [
    'Lesson not found in this course.',
    'Урок не найден в этом курсе.',
  ],
  'email must be an email': [
    'Enter a valid email address.',
    'Введите корректную электронную почту.',
  ],
  'name must be longer than or equal to 2 characters': [
    'Name must contain at least 2 characters.',
    'Имя должно содержать не менее 2 символов.',
  ],
  'name must be shorter than or equal to 80 characters': [
    'Name must contain at most 80 characters.',
    'Имя должно содержать не более 80 символов.',
  ],
  'password must be longer than or equal to 8 and shorter than or equal to 72 bytes': [
    'Password must contain 8–72 bytes.',
    'Пароль должен содержать от 8 до 72 байт.',
  ],
  'text must be shorter than or equal to 2000 characters': [
    'Review must contain at most 2000 characters.',
    'Отзыв должен содержать не более 2000 символов.',
  ],
}
export function useLocale() {
  const { t, locale, te } = useI18n({ useScope: 'global' })
  const intlLocale = () => (locale.value === 'ru' ? 'ru-RU' : 'en-US')
  function topicLabel(slug: string, fallback?: string) {
    const key = 'topic.' + slug
    return te(key) ? t(key) : fallback || slug
  }
  function levelLabel(level: string) {
    const key = 'level.' + level
    return te(key) ? t(key) : level
  }
  function translateError(message: string): string {
    const key = Object.keys(messages.en).find(
      (key) =>
        messages.en[key as keyof typeof messages.en] === message ||
        messages.ru[key as keyof typeof messages.ru] === message,
    )
    if (key) return t(key)
    const known = apiErrors[message]
    if (known) return known[locale.value === 'ru' ? 1 : 0]
    if (/Unknown interest|Unknown or inactive interest/i.test(message))
      return locale.value === 'ru'
        ? 'Выберите интересы из доступного списка тем.'
        : 'Choose interests from the available topics.'
    if (message.includes('. '))
      return message
        .split('. ')
        .map((part) => translateError(part))
        .join('. ')
    return message
  }
  return {
    t,
    locale,
    topicLabel,
    levelLabel,
    translateError,
    formatNumber: (value: number) => new Intl.NumberFormat(intlLocale()).format(value),
    formatDate: (value: string) => new Intl.DateTimeFormat(intlLocale()).format(new Date(value)),
  }
}
