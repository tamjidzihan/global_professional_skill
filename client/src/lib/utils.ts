/* eslint-disable @typescript-eslint/no-explicit-any */
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines and merges class names efficiently.
 * Uses clsx for conditional class names and tailwind-merge for Tailwind class conflicts.
 * 
 * @example
 * cn("px-2", "px-4") // returns "px-4" (tailwind-merge resolves conflict)
 * cn("text-red-500", isActive && "bg-blue-500") // conditional classes
 * 
 * @param inputs - Array of class values (strings, objects, arrays, or falsy values)
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * Formats a date to a readable string
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions) {
    return new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        ...options,
    }).format(new Date(date))
}

/**
 * Truncates text to a specified length
 */
export function truncateText(text: string, maxLength: number = 50) {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + "..."
}

/**
 * Capitalizes the first letter of a string
 */
export function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Generates a random ID (useful for mock data or temporary keys)
 */
export function generateId(length: number = 8) {
    return Math.random().toString(36).substring(2, 2 + length)
}



/**
 * Format currency
 */
export function formatCurrency(amount: number, currency: string = "USD") {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
    }).format(amount)
}

/**
 * Get initials from a name
 */
export function getInitials(name: string): string {
    return name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
}

/**
 * Get random color from a predefined list (for avatars, tags, etc.)
 */
export function getRandomColor() {
    const colors = [
        "bg-red-100 text-red-800",
        "bg-blue-100 text-blue-800",
        "bg-green-100 text-green-800",
        "bg-yellow-100 text-yellow-800",
        "bg-purple-100 text-purple-800",
        "bg-pink-100 text-pink-800",
        "bg-indigo-100 text-indigo-800",
        "bg-gray-100 text-gray-800",
    ]
    return colors[Math.floor(Math.random() * colors.length)]
}

/**
 * Get gradient class based on role (for your sidebar avatar)
 */
export function getAvatarGradient(role?: string, firstName?: string) {
    const roleGradients: Record<string, string> = {
        ADMIN: "from-purple-500 to-pink-500",
        INSTRUCTOR: "from-blue-500 to-cyan-400",
        STUDENT: "from-green-500 to-emerald-400",
    }

    // If we have a first name, generate consistent color based on first letter
    if (firstName) {
        const firstLetter = firstName.charAt(0).toUpperCase()
        const letterCode = firstLetter.charCodeAt(0)
        const gradients = [
            "from-rose-500 to-pink-500",
            "from-orange-500 to-amber-500",
            "from-yellow-500 to-lime-500",
            "from-emerald-500 to-teal-500",
            "from-cyan-500 to-blue-500",
            "from-indigo-500 to-violet-500",
            "from-purple-500 to-fuchsia-500",
        ]
        return gradients[letterCode % gradients.length]
    }

    return roleGradients[role || ""] || "from-indigo-500 to-purple-500"
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T>(str: string, fallback: T): T {
    try {
        return JSON.parse(str)
    } catch {
        return fallback
    }
}

/**
 * Creates a delay promise (useful for testing loading states)
 */
export function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Scroll to top of page smoothly
 */
export function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" })
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string) {
    try {
        await navigator.clipboard.writeText(text)
        return true
    } catch {
        // Fallback for older browsers
        const textArea = document.createElement("textarea")
        textArea.value = text
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand("copy")
        document.body.removeChild(textArea)
        return true
    }
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string) {
    return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2)
}

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 */
export function isEmpty(value: any): boolean {
    if (value === null || value === undefined) return true
    if (typeof value === "string") return value.trim().length === 0
    if (Array.isArray(value)) return value.length === 0
    if (typeof value === "object") return Object.keys(value).length === 0
    return false
}

/**
 * Create a query string from an object
 */
export function toQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            searchParams.append(key, String(value))
        }
    })
    return searchParams.toString()
}

/**
 * Parse query string to object
 */
export function fromQueryString(query: string): Record<string, string> {
    const params = new URLSearchParams(query)
    const result: Record<string, string> = {}
    params.forEach((value, key) => {
        result[key] = value
    })
    return result
}



/**
 * Toggle item in array
 */
export function toggleArrayItem<T>(array: T[], item: T): T[] {
    return array.includes(item)
        ? array.filter((i) => i !== item)
        : [...array, item]
}