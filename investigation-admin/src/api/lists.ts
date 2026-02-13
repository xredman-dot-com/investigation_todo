import { apiRequest } from "./client"

export type ListItem = {
  id: string
  user_id: string
  name: string
  icon?: string | null
  color?: string | null
  sort_order?: number | null
  created_at: string
  updated_at: string
}

export function fetchLists(): Promise<ListItem[]> {
  return apiRequest<ListItem[]>("/lists/")
}

export function createList(data: Partial<ListItem>): Promise<ListItem> {
  return apiRequest<ListItem>("/lists/", {
    method: "POST",
    body: JSON.stringify(data)
  })
}

export function updateList(id: string, data: Partial<ListItem>): Promise<ListItem> {
  return apiRequest<ListItem>(`/lists/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  })
}

export function deleteList(id: string): Promise<void> {
  return apiRequest<void>(`/lists/${id}`, { method: "DELETE" })
}
