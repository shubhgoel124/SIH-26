"use client"

import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Bell,
  Briefcase,
  Calendar,
  CheckCheck,
  CheckCircle,
  FileText,
  Gift,
  Loader2,
  MessageSquare,
  UserCheck,
  XCircle
} from "lucide-react"

type NotificationType = 
  | "interview_scheduled" 
  | "internship_offer" 
  | "new_opportunity" 
  | "new_application"
  | "new_approval"
  | "approval_rejected"
  | "approval_accepted"

interface Notification {
  id: string
  title: string
  message: string
  type: NotificationType
  isRead: boolean
  redirectUrl: string | null
  createdAt: string
}

const notificationIcons: Record<NotificationType, typeof Bell> = {
  interview_scheduled: Calendar,
  internship_offer: Gift,
  new_opportunity: Briefcase,
  new_application: MessageSquare,
  new_approval: UserCheck,
  approval_rejected: XCircle,
  approval_accepted: CheckCircle,
}

const notificationColors: Record<NotificationType, string> = {
  interview_scheduled: "bg-purple-50 text-purple-600",
  internship_offer: "bg-emerald-50 text-emerald-600",
  new_opportunity: "bg-sky-50 text-sky-600",
  new_application: "bg-amber-50 text-amber-600",
  new_approval: "bg-orange-50 text-orange-600",
  approval_rejected: "bg-red-50 text-red-600",
  approval_accepted: "bg-green-50 text-green-600",
}

export function Notifications() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [markingRead, setMarkingRead] = useState(false)

  const unreadCount = notifications.filter(n => !n.isRead).length

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await axios.get("/api/notification", { withCredentials: true })
      if (res.data?.notifications) {
        // Sort by createdAt descending (newest first)
        const sorted = res.data.notifications.sort(
          (a: Notification, b: Notification) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        setNotifications(sorted)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  const markAsRead = async (ids: string[]) => {
    if (ids.length === 0) return
    
    setMarkingRead(true)
    try {
      await axios.patch("/api/notification/read", { notificationIds: ids })
      setNotifications(prev => 
        prev.map(n => ids.includes(n.id) ? { ...n, isRead: true } : n)
      )
    } catch (error) {
      console.error("Error marking notifications as read:", error)
    } finally {
      setMarkingRead(false)
    }
  }

  const markAllAsRead = () => {
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id)
    markAsRead(unreadIds)
  }

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.isRead) {
      markAsRead([notification.id])
    }
    // Navigate if there's a redirect URL
    if (notification.redirectUrl) {
      router.push(notification.redirectUrl)
    }
    setOpen(false)
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative rounded-full border border-slate-200 hover:bg-slate-100"
        >
          <Bell className="h-4 w-4 text-slate-600" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
              <Badge 
                className="relative flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-sky-500 to-blue-600 p-0 text-[10px] font-bold text-white border-2 border-white"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        align="end" 
        className="w-80 max-h-[70vh] overflow-hidden rounded-2xl border-slate-200 shadow-xl p-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-50 to-sky-50 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-slate-600" />
            <span className="font-semibold text-slate-900">Notifications</span>
            {unreadCount > 0 && (
              <Badge className="bg-sky-100 text-sky-700 text-xs px-2">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-sky-600 hover:text-sky-700 hover:bg-sky-50 h-7 px-2"
              onClick={(e) => {
                e.preventDefault()
                markAllAsRead()
              }}
              disabled={markingRead}
            >
              {markingRead ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <>
                  <CheckCheck className="h-3 w-3 mr-1" />
                  Mark all read
                </>
              )}
            </Button>
          )}
        </div>

        {/* Notification List */}
        <div className="max-h-[50vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-sky-600" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-500">
              <Bell className="h-10 w-10 text-slate-300 mb-2" />
              <p className="text-sm font-medium">No notifications yet</p>
              <p className="text-xs text-slate-400">We&apos;ll notify you when something happens</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.slice(0, 10).map((notification) => {
                const Icon = notificationIcons[notification.type] || Bell
                const colorClass = notificationColors[notification.type] || "bg-slate-50 text-slate-600"
                
                return (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-slate-50 ${
                      !notification.isRead ? "bg-sky-50/50" : ""
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className={`rounded-full p-2 mt-0.5 flex-shrink-0 ${colorClass}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm leading-tight ${!notification.isRead ? "font-semibold text-slate-900" : "text-slate-700"}`}>
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <span className="flex-shrink-0 h-2 w-2 rounded-full bg-sky-500 mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 10 && (
          <div className="px-4 py-2 text-center border-t border-slate-100">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-sky-600 hover:text-sky-700"
              onClick={() => {
                setOpen(false)
              }}
            >
              View all notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
