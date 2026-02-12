"use client"

import { Plus, Calendar, Eye, Pencil, Trash2, Swords } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ScrimList } from "@/lib/types"
import { useState } from "react"

interface HomeScreenProps {
  archive: ScrimList[]
  onCreateNew: () => void
  onLoad: (id: string) => void
  onDelete: (id: string) => void
}

export function HomeScreen({ archive, onCreateNew, onLoad, onDelete }: HomeScreenProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredArchive = archive.filter(
    (list) =>
      list.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      list.organizerName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex flex-col items-center gap-10 px-4 py-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex items-center gap-3">
          <Swords className="h-10 w-10 text-secondary" />
          <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl font-heading">
            Scrim List Generator
          </h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-md">
          Create professional team lists and generate animated announcements for your scrims.
        </p>
      </div>

      {/* Create Button */}
      <Button
        onClick={onCreateNew}
        size="lg"
        className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-7 text-lg font-semibold rounded-xl shadow-lg transition-all duration-200 hover:scale-105 purple-glow"
      >
        <Plus className="mr-2 h-6 w-6" />
        Create List
      </Button>

      {/* Archive Section */}
      {archive.length > 0 && (
        <div className="w-full flex flex-col gap-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-2xl font-semibold text-foreground font-heading">Archive</h2>
            <div className="w-full max-w-xs">
              <Label htmlFor="search" className="sr-only">
                Search lists
              </Label>
              <Input
                id="search"
                placeholder="Search lists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredArchive.map((list, index) => (
              <div
                key={list.id}
                className="card-gradient rounded-xl border border-border p-5 flex flex-col gap-3 transition-all duration-200 hover:border-primary/50 animate-slide-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-1">
                    <h3 className="font-semibold text-foreground text-lg truncate max-w-[180px]">
                      {list.name || "Untitled List"}
                    </h3>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{list.date || "No date"}</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-secondary bg-secondary/10 px-2 py-0.5 rounded-md">
                    {list.teams.length} teams
                  </span>
                </div>

                {list.organizerName && (
                  <p className="text-sm text-muted-foreground truncate">
                    Organized by: {list.organizerName}
                  </p>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onLoad(list.id)}
                    className="text-primary hover:text-primary-foreground hover:bg-primary/20 flex-1"
                  >
                    <Eye className="mr-1.5 h-4 w-4" />
                    View
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onLoad(list.id)}
                    className="text-secondary hover:text-secondary-foreground hover:bg-secondary/20 flex-1"
                  >
                    <Pencil className="mr-1.5 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(list.id)}
                    className="text-destructive hover:text-destructive-foreground hover:bg-destructive/20"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredArchive.length === 0 && searchTerm && (
            <p className="text-center text-muted-foreground py-8">
              No lists found matching your search.
            </p>
          )}
        </div>
      )}

      {archive.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">No lists created yet.</p>
          <p className="text-sm mt-1">Click the button above to get started.</p>
        </div>
      )}
    </div>
  )
}
