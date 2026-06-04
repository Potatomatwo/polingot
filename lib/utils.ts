// lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function absoluteUrl(path: string) {
  // Get base URL with fallback
  let baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  
  // If no base URL, use default
  if (!baseUrl) {
    console.warn("NEXT_PUBLIC_BASE_URL is not set, using default");
    baseUrl = "http://localhost:3000";
  }
  
  // Remove trailing slash from base URL
  baseUrl = baseUrl.replace(/\/$/, "");
  
  // Ensure path starts with a slash
  const formattedPath = path.startsWith("/") ? path : `/${path}`;
  
  // Combine
  const fullUrl = `${baseUrl}${formattedPath}`;
  
  // Validate
  try {
    new URL(fullUrl);
    return fullUrl;
  } catch (error) {
    console.error("Invalid URL generated:", fullUrl);
    // Return a fallback URL
    return `http://localhost:3000${formattedPath}`;
  }
}
