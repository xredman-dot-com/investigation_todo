import { request } from "../core/request"
import type { CountdownItem } from "../types/api"

export function listCountdowns(): Promise<CountdownItem[]> {
  return request<CountdownItem[]>({ url: "/countdowns/" })
}

export function createCountdown(data: Record<string, any>): Promise<CountdownItem> {
  return request<CountdownItem>({ url: "/countdowns/", method: "POST", data })
}

export function updateCountdown(countdownId: string, data: Record<string, any>): Promise<CountdownItem> {
  return request<CountdownItem>({ url: `/countdowns/${countdownId}`, method: "PUT", data })
}

export function deleteCountdown(countdownId: string): Promise<void> {
  return request<void>({ url: `/countdowns/${countdownId}`, method: "DELETE" })
}
