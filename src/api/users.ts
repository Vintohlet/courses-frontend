import { http } from './client'
import type { User, AuthResponse, Topic } from './types'
export type ProfileInput = { name: string; email: string; interests: string[] }
export const usersApi = {
  login: (email: string, password: string) =>
    http<AuthResponse>('/auth/login', { method: 'POST', body: { email, password }, auth: 'none' }),
  register: (body: ProfileInput & { password: string }) =>
    http<AuthResponse>('/auth/register', { method: 'POST', body, auth: 'none' }),
  me: () => http<User>('/users/me', { auth: 'required' }),
  update: (body: ProfileInput) =>
    http<User>('/users/me', { method: 'PATCH', body, auth: 'required' }),
  topics: () => http<Topic[]>('/topics', { auth: 'none' }),
}
