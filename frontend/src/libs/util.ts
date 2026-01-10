import { addToast } from '@heroui/react'
import { notFound } from '@tanstack/react-router'
import {
  differenceInCalendarDays,
  differenceInCalendarMonths,
  differenceInCalendarWeeks,
  formatDistanceToNow,
  isToday,
  isYesterday,
} from 'date-fns'
import type { ServerError } from '@/libs/types/Response.ts'

export function errorToast(error: { message: string; status?: number }) {
  return addToast({
    color: 'danger',
    title: error.status || error.message,
    description: error.message || 'Something went wrong',
  })
}

export function successToast(message: string, title?: string) {
  return addToast({
    color: 'success',
    title: title || 'Success!',
    description: message,
  })
}

export function handlerError(error: ServerError) {
  if (error.status === 404) {
    throw notFound()
  }
  if (error.status == 500) {
    throw error
  }
  return errorToast(error)
}

export function fuzzyTimeAgo(date: string | Date) {
  const now = new Date()
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'

  const days = differenceInCalendarDays(now, date)
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`

  const weeks = differenceInCalendarWeeks(now, date)
  if (weeks < 4) return `${weeks} week${weeks > 1 ? 's' : ''} ago`

  const months = differenceInCalendarMonths(now, date)
  return `${months} month${days > 1 ? 's' : ''} ago`
}

export function timeAgo(date: string | Date) {
  return formatDistanceToNow(date, { addSuffix: true })
}

export function stripHtmlTags(html: string) {
  return html.replace(/<[^>]*>/g, '').trim()
}

export const extractPublicIdsFromHtml = (html: string) => {
  const matches = [...html.matchAll(/<img[^>]*src="([^"]+)"[^>]*>/g)]

  return matches.map((match) => {
    const url = match[1]
    const parts = url.split('/')
    const fileWithExt = parts.pop()!
    const [publicId] = fileWithExt.split('.')

    const uploadIndex = parts.indexOf('upload')
    let pathParts = parts.slice(uploadIndex + 1)

    if (pathParts[0]?.startsWith('v') && /^\d+$/.test(pathParts[0].slice(1))) {
      pathParts = pathParts.slice(1)
    }

    return [...pathParts, publicId].join('/')
  })
}
