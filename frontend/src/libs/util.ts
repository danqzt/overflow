import { addToast } from '@heroui/react'
import { ServerError } from '@/libs/types/Response.ts'
import { notFound } from '@tanstack/react-router'
import {
  differenceInCalendarDays,
  differenceInCalendarMonths,
  differenceInCalendarWeeks,
  formatDistanceToNow,
  isToday,
  isYesterday,
} from 'date-fns'

export function errorToast(error: ServerError) {
  return addToast({color: 'danger',
       title: error.status || 'Error',
        description: error.message || 'Something went wrong'});
}
export function handlerError(error: ServerError){
  if(error.status === 404){
    throw notFound();
  }
  if(error.status == 500){
    throw error;
  }
  return errorToast(error);
}

export function fuzzyTimeAgo(date: string | Date){
  const now = new Date();
  if(isToday(date)) return 'Today';
  if(isYesterday(date)) return 'Yesterday';

  const days = differenceInCalendarDays(now, date);
  if(days < 7) return `${days} day${days>1 ?'s': ''} ago`;

  const weeks = differenceInCalendarWeeks(now, date);
  if(weeks < 4) return `${weeks} week${weeks>1 ?'s': ''} ago`;

  const months = differenceInCalendarMonths(now, date);
  return `${months} month${days>1 ?'s': ''} ago`;
}

export function timeAgo(date: string | Date) {
  return formatDistanceToNow(date, {addSuffix: true});
}