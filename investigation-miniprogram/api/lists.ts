import { request } from "../utils/request"
import type { ListItem } from "./types"

export function listLists(): Promise<ListItem[]> {
  return request<ListItem[]>({ url: "/lists/" })
}

export function createList(data: {
  name: string
  icon?: string
  color?: string
  sort_order?: number
}): Promise<ListItem> {
  return request<ListItem>({ url: "/lists/", method: "POST", data })
}

export function updateList(
  listId: string,
  data: { name?: string; icon?: string; color?: string; sort_order?: number }
): Promise<ListItem> {
  return request<ListItem>({ url: `/lists/${listId}`, method: "PUT", data })
}

export function deleteList(listId: string): Promise<void> {
  return request<void>({ url: `/lists/${listId}`, method: "DELETE" })
}
