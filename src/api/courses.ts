import { http } from './client'
import type { Course, Content, Page, Review, Enrollment } from './types'
export const coursesApi = {
  list: (query: URLSearchParams, signal?: AbortSignal) =>
    http<Page<Course>>('/courses?' + query, { auth: 'optional', signal }),
  recommendations: (limit: number, signal?: AbortSignal) =>
    http<Course[]>('/courses/recommendations?limit=' + limit, { auth: 'optional', signal }),
  get: (id: string, signal?: AbortSignal) =>
    http<Course>('/courses/' + id, { auth: 'optional', signal }),
  similar: (id: string, signal?: AbortSignal) =>
    http<Course[]>('/courses/' + id + '/similar', { signal }),
  content: (id: string, signal?: AbortSignal) =>
    http<Content>('/courses/' + id + '/content', { auth: 'required', signal }),
  enroll: (id: string) =>
    http<Enrollment>('/courses/' + id + '/enroll', { method: 'POST', auth: 'required' }),
  complete: (id: string, lesson: string) =>
    http<{ enrollment: Enrollment; progress: number; alreadyCompleted: boolean }>(
      '/courses/' + id + '/lessons/' + lesson + '/complete',
      { method: 'POST', auth: 'required' },
    ),
  reviews: (id: string, page: number, signal?: AbortSignal) =>
    http<Page<Review>>('/courses/' + id + '/reviews?page=' + page + '&limit=5', { signal }),
  rate: (id: string, rating: number, text: string) =>
    http<Review>('/courses/' + id + '/rating', {
      method: 'POST',
      body: { rating, text },
      auth: 'required',
    }),
}
