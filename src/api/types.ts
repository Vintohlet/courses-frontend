export interface Topic {
  _id: string
  slug: string
  name: string
}
export type Strategy = 'collaborative' | 'content_based' | 'popular' | 'popular_fallback'
export interface Course {
  _id: string
  title: string
  shortDescription: string
  category: string
  tags: string[]
  level: string
  ratingAvg: number
  ratingCount: number
  enrollCount: number
  isEnrolled?: boolean
  progress?: number
  recommendation?: {
    strategy: Strategy
    score: number
    reason: string
    basedOnCourse?: { id: string; title: string | null }
  }
}
export interface Page<T> {
  items: T[]
  pagination: { page: number; limit: number; total: number; pages: number }
}
export interface Lesson {
  _id: string
  title: string
  description: string
  order: number
}
export interface Enrollment {
  status: 'active' | 'completed'
  completedLessons: string[]
}
export interface Content {
  fullDescription: string
  lessons: Lesson[]
  enrollment: Enrollment
  progress: number
}
export interface User {
  id?: string
  _id?: string
  name: string
  email: string
  interests: string[]
  isAdmin: boolean
  courses?: {
    course:
      | (Pick<Course, '_id' | 'title' | 'category' | 'ratingAvg' | 'ratingCount'> & {
          lessons: Lesson[]
        })
      | null
    status: 'active' | 'completed'
    progress: number
    enrolledAt: string
    completedAt?: string
  }[]
}
export interface AuthResponse {
  user: User
  accessToken: string
}
export interface Review {
  _id: string
  rating: number
  text?: string
  userId: { _id?: string; name: string }
  createdAt: string
}
