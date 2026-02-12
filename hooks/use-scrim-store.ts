"use client"

import { useState, useCallback } from "react"
import type { ScrimList, Team, TeamMember } from "@/lib/types"

function generateId() {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36)
}

function loadArchive(): ScrimList[] {
  if (typeof window === "undefined") return []
  try {
    const data = localStorage.getItem("scrim-archive")
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveArchive(lists: ScrimList[]) {
  if (typeof window === "undefined") return
  localStorage.setItem("scrim-archive", JSON.stringify(lists))
}

export function useScrimStore() {
  const [archive, setArchive] = useState<ScrimList[]>(loadArchive)
  const [currentList, setCurrentList] = useState<ScrimList | null>(null)
  const [view, setView] = useState<"home" | "editor" | "preview">("home")

  const createNewList = useCallback(() => {
    const newList: ScrimList = {
      id: generateId(),
      name: "",
      date: new Date().toISOString().split("T")[0],
      organizerName: "",
      scrimTime: "",
      teams: [],
      createdAt: new Date().toISOString(),
    }
    setCurrentList(newList)
    setView("editor")
  }, [])

  const updateList = useCallback((updates: Partial<ScrimList>) => {
    setCurrentList((prev) => (prev ? { ...prev, ...updates } : null))
  }, [])

  const addTeam = useCallback(() => {
    setCurrentList((prev) => {
      if (!prev) return null
      const newTeam: Team = {
        id: generateId(),
        name: "",
        logoUrl: null,
        members: [{ id: generateId(), name: "" }],
      }
      return { ...prev, teams: [...prev.teams, newTeam] }
    })
  }, [])

  const updateTeam = useCallback((teamId: string, updates: Partial<Team>) => {
    setCurrentList((prev) => {
      if (!prev) return null
      return {
        ...prev,
        teams: prev.teams.map((t) => (t.id === teamId ? { ...t, ...updates } : t)),
      }
    })
  }, [])

  const removeTeam = useCallback((teamId: string) => {
    setCurrentList((prev) => {
      if (!prev) return null
      return { ...prev, teams: prev.teams.filter((t) => t.id !== teamId) }
    })
  }, [])

  const moveTeam = useCallback((fromIndex: number, toIndex: number) => {
    setCurrentList((prev) => {
      if (!prev) return null
      const teams = [...prev.teams]
      if (fromIndex < 0 || fromIndex >= teams.length) return prev
      const clampedTo = Math.max(0, Math.min(teams.length - 1, toIndex))
      const [moved] = teams.splice(fromIndex, 1)
      teams.splice(clampedTo, 0, moved)
      return { ...prev, teams }
    })
  }, [])

  const addMember = useCallback((teamId: string) => {
    setCurrentList((prev) => {
      if (!prev) return null
      return {
        ...prev,
        teams: prev.teams.map((t) =>
          t.id === teamId
            ? { ...t, members: [...t.members, { id: generateId(), name: "" }] }
            : t
        ),
      }
    })
  }, [])

  const updateMember = useCallback((teamId: string, memberId: string, name: string) => {
    setCurrentList((prev) => {
      if (!prev) return null
      return {
        ...prev,
        teams: prev.teams.map((t) =>
          t.id === teamId
            ? {
                ...t,
                members: t.members.map((m) => (m.id === memberId ? { ...m, name } : m)),
              }
            : t
        ),
      }
    })
  }, [])

  const removeMember = useCallback((teamId: string, memberId: string) => {
    setCurrentList((prev) => {
      if (!prev) return null
      return {
        ...prev,
        teams: prev.teams.map((t) =>
          t.id === teamId
            ? { ...t, members: t.members.filter((m) => m.id !== memberId) }
            : t
        ),
      }
    })
  }, [])

  const saveList = useCallback(() => {
    if (!currentList) return
    setArchive((prev) => {
      const exists = prev.find((l) => l.id === currentList.id)
      let updated: ScrimList[]
      if (exists) {
        updated = prev.map((l) => (l.id === currentList.id ? currentList : l))
      } else {
        updated = [currentList, ...prev]
      }
      saveArchive(updated)
      return updated
    })
  }, [currentList])

  const loadList = useCallback((id: string) => {
    const list = archive.find((l) => l.id === id)
    if (list) {
      setCurrentList(list)
      setView("editor")
    }
  }, [archive])

  const deleteList = useCallback((id: string) => {
    setArchive((prev) => {
      const updated = prev.filter((l) => l.id !== id)
      saveArchive(updated)
      return updated
    })
  }, [])

  const goHome = useCallback(() => {
    setCurrentList(null)
    setView("home")
  }, [])

  const goToPreview = useCallback(() => {
    setView("preview")
  }, [])

  const goToEditor = useCallback(() => {
    setView("editor")
  }, [])

  return {
    archive,
    currentList,
    view,
    createNewList,
    updateList,
    addTeam,
    updateTeam,
    removeTeam,
    moveTeam,
    addMember,
    updateMember,
    removeMember,
    saveList,
    loadList,
    deleteList,
    goHome,
    goToPreview,
    goToEditor,
  }
}
