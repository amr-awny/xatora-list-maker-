"use client"

import { useRef, useState } from "react"
import { Plus, X, UserPlus, ImageIcon, ChevronUp, ChevronDown, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Team } from "@/lib/types"

interface TeamCardProps {
  team: Team
  index: number
  totalTeams: number
  onUpdate: (teamId: string, updates: Partial<Team>) => void
  onRemove: (teamId: string) => void
  onMove: (fromIndex: number, toIndex: number) => void
  onAddMember: (teamId: string) => void
  onUpdateMember: (teamId: string, memberId: string, name: string) => void
  onRemoveMember: (teamId: string, memberId: string) => void
}

export function TeamCard({
  team,
  index,
  totalTeams,
  onUpdate,
  onRemove,
  onMove,
  onAddMember,
  onUpdateMember,
  onRemoveMember,
}: TeamCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [showMoveInput, setShowMoveInput] = useState(false)
  const [moveTarget, setMoveTarget] = useState("")

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      onUpdate(team.id, { logoUrl: ev.target?.result as string })
    }
    reader.readAsDataURL(file)
  }

  const handleMoveSubmit = () => {
    const target = parseInt(moveTarget, 10)
    if (!isNaN(target) && target >= 1 && target <= totalTeams) {
      onMove(index, target - 1)
      setShowMoveInput(false)
      setMoveTarget("")
    }
  }

  const isGif = team.logoUrl?.startsWith("data:image/gif") || team.logoUrl?.endsWith(".gif")

  return (
    <div
      className="relative card-gradient rounded-xl border border-border p-5 flex flex-col gap-4 transition-all duration-300 hover:border-primary/40 animate-scale-in"
      style={{ animationDelay: `${index * 80}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Remove Button */}
      <Button
        variant="ghost"
        size="sm"
        className={`absolute top-2 right-2 h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-opacity duration-200 ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => onRemove(team.id)}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Remove team</span>
      </Button>

      {/* Team Number Badge + Reorder Controls */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-mono font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded-md">
          #{index + 1}
        </span>

        {/* Move Up/Down Arrows */}
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30"
            onClick={() => onMove(index, index - 1)}
            disabled={index === 0}
          >
            <ChevronUp className="h-3.5 w-3.5" />
            <span className="sr-only">Move up</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30"
            onClick={() => onMove(index, index + 1)}
            disabled={index === totalTeams - 1}
          >
            <ChevronDown className="h-3.5 w-3.5" />
            <span className="sr-only">Move down</span>
          </Button>
        </div>

        {/* Jump to Position */}
        {showMoveInput ? (
          <div className="flex items-center gap-1 ml-auto">
            <Input
              type="number"
              min={1}
              max={totalTeams}
              value={moveTarget}
              onChange={(e) => setMoveTarget(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleMoveSubmit()
                if (e.key === "Escape") { setShowMoveInput(false); setMoveTarget("") }
              }}
              placeholder={`1-${totalTeams}`}
              className="h-6 w-16 text-xs bg-muted border-border text-foreground px-1.5"
              autoFocus
            />
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-1.5 text-xs text-primary hover:bg-primary/10"
              onClick={handleMoveSubmit}
            >
              Go
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              onClick={() => { setShowMoveInput(false); setMoveTarget("") }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className={`h-6 px-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted ml-auto transition-opacity duration-200 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => { setShowMoveInput(true); setMoveTarget(String(index + 1)) }}
          >
            <ArrowUpDown className="h-3 w-3 mr-1" />
            Move to
          </Button>
        )}
      </div>

      {/* Logo */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="relative h-20 w-20 rounded-xl bg-muted border-2 border-dashed border-border flex items-center justify-center overflow-hidden transition-all duration-200 hover:border-primary/60 hover:bg-muted/80 group"
          aria-label="Upload team logo (supports GIF)"
        >
          {team.logoUrl ? (
            <img
              src={team.logoUrl}
              alt={`${team.name || "Team"} logo`}
              className="h-full w-full object-cover rounded-xl"
            />
          ) : (
            <div className="flex flex-col items-center gap-1 text-muted-foreground group-hover:text-primary transition-colors">
              <ImageIcon className="h-6 w-6" />
              <span className="text-[10px] font-medium">Logo/GIF</span>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
            className="hidden"
            onChange={handleLogoUpload}
          />
        </button>
        {isGif && team.logoUrl && (
          <span className="absolute mt-[88px] text-[9px] font-mono font-bold text-secondary bg-secondary/15 px-1.5 py-0.5 rounded">
            GIF
          </span>
        )}
      </div>

      {/* Team Name */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`team-name-${team.id}`} className="text-xs font-medium text-muted-foreground">
          Team Name
        </Label>
        <Input
          id={`team-name-${team.id}`}
          placeholder="Enter team name"
          value={team.name}
          onChange={(e) => onUpdate(team.id, { name: e.target.value })}
          className="bg-muted border-border text-foreground placeholder:text-muted-foreground font-semibold"
        />
      </div>

      {/* Members */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-muted-foreground">Members</Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddMember(team.id)}
            className="h-6 text-xs text-primary hover:text-primary-foreground hover:bg-primary/20 px-2"
          >
            <UserPlus className="mr-1 h-3 w-3" />
            Add
          </Button>
        </div>

        <div className="flex flex-col gap-1.5">
          {team.members.map((member, mIndex) => (
            <div key={member.id} className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-muted-foreground w-4 text-center shrink-0">
                {mIndex + 1}
              </span>
              <Input
                placeholder={`Player ${mIndex + 1}`}
                value={member.name}
                onChange={(e) => onUpdateMember(team.id, member.id, e.target.value)}
                className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground text-sm h-8"
              />
              {team.members.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                  onClick={() => onRemoveMember(team.id, member.id)}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove member</span>
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

interface AddTeamCardProps {
  onAdd: () => void
}

export function AddTeamCard({ onAdd }: AddTeamCardProps) {
  return (
    <button
      type="button"
      onClick={onAdd}
      className="rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-3 min-h-[280px] transition-all duration-300 hover:border-primary/50 hover:bg-muted/30 group cursor-pointer"
      aria-label="Add a new team"
    >
      <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center transition-all duration-200 group-hover:bg-primary/20 group-hover:scale-110">
        <Plus className="h-7 w-7 text-primary transition-transform duration-200 group-hover:rotate-90" />
      </div>
      <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
        Add Team
      </span>
    </button>
  )
}
