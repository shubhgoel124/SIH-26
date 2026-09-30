import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { AlertCircle, Calendar, CheckCircle, Clock, XCircle } from "lucide-react"
import React from "react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isStringArray(value: any): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}

// export const getStatusIcon = (status: string) => {
//     switch (status) {
//       case "pending":
//         return (<Clock className="h-4 w-4" />)
//       case "approved":
//         return (<CheckCircle className="h-4 w-4" />)
//       case "rejected":
//         return (<XCircle className="h-4 w-4" />)
//       case "interview":
//         return (<Calendar className="h-4 w-4" />)
//       case "selected":
//         return (<CheckCircle className="h-4 w-4" />)
//       default:
//         return (<AlertCircle className="h-4 w-4" />)
//     }
// }

export const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary"
      case "approved":
        return "default"
      case "rejected":
        return "destructive"
      case "interview":
        return "default"
      case "selected":
        return "default"
      default:
        return "secondary"
    }
  }
