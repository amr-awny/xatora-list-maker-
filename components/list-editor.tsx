"use client"

import { ArrowLeft, Save, Eye, Calendar, User, Clock, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { TeamCard, AddTeamCard } from "@/components/team-card"
import type { ScrimList, Team } from "@/lib/types"

interface ListEditorProps {
  list: ScrimList
  onUpdateList: (updates: Partial<ScrimList>) => void
  onAddTeam: () => void
  onUpdateTeam: (teamId: string, updates: Partial<Team>) => void
  onRemoveTeam: (teamId: string) => void
  onMoveTeam: (fromIndex: number, toIndex: number) => void
  onAddMember: (teamId: string) => void
  onUpdateMember: (teamId: string, memberId: string, name: string) => void
  onRemoveMember: (teamId: string, memberId: string) => void
  onSave: () => void
  onPreview: () => void
  onBack: () => void
}

export function ListEditor({
  list,
  onUpdateList,
  onAddTeam,
  onUpdateTeam,
  onRemoveTeam,
  onMoveTeam,
  onAddMember,
  onUpdateMember,
  onRemoveMember,
  onSave,
  onPreview,
  onBack,
}: ListEditorProps) {
  return (
    <div className="flex flex-col gap-8 px-4 py-8 max-w-6xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground w-fit"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => {
              onSave()
            }}
            className="border-border text-foreground hover:bg-muted"
          >
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
          <Button
            onClick={() => {
              onSave()
              onPreview()
            }}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold"
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview & Generate
          </Button>
        </div>
      </div>

      {/* List Info */}
      <section className="card-gradient rounded-xl border border-border p-6 flex flex-col gap-5">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2 font-heading">
          <FileText className="h-5 w-5 text-primary" />
          List Details
        </h2>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="list-name" className="text-sm font-medium text-muted-foreground">
              List Name
            </Label>
            <Input
              id="list-name"
              placeholder="e.g., Weekly Scrim #12"
              value={list.name}
              onChange={(e) => onUpdateList({ name: e.target.value })}
              className="bg-muted border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="list-date" className="text-sm font-medium text-muted-foreground">
              <Calendar className="inline mr-1.5 h-3.5 w-3.5" />
              Date
            </Label>
            <Input
              id="list-date"
              type="date"
              value={list.date}
              onChange={(e) => onUpdateList({ date: e.target.value })}
              className="bg-muted border-border text-foreground [color-scheme:dark]"
            />
          </div>
        </div>
      </section>

      {/* Scrim Info */}
      <section className="card-gradient rounded-xl border border-border p-6 flex flex-col gap-5">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2 font-heading">
          <User className="h-5 w-5 text-secondary" />
          Scrim Info
        </h2>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="organizer" className="text-sm font-medium text-muted-foreground">
              <User className="inline mr-1.5 h-3.5 w-3.5" />
              Organizer Name
            </Label>
            <Input
              id="organizer"
              placeholder="e.g., John Doe"
              value={list.organizerName}
              onChange={(e) => onUpdateList({ organizerName: e.target.value })}
              className="bg-muted border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="scrim-time" className="text-sm font-medium text-muted-foreground">
              <Clock className="inline mr-1.5 h-3.5 w-3.5" />
              Scrim Time
            </Label>
            <Input
              id="scrim-time"
              type="time"
              value={list.scrimTime}
              onChange={(e) => onUpdateList({ scrimTime: e.target.value })}
              className="bg-muted border-border text-foreground [color-scheme:dark]"
            />
          </div>
        </div>
      </section>

      <Separator className="bg-border" />

      {/* Teams Grid */}
      <section className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground font-heading">
            Teams ({list.teams.length})
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.teams.map((team, index) => (
            <TeamCard
              key={team.id}
              team={team}
              index={index}
              totalTeams={list.teams.length}
              onUpdate={onUpdateTeam}
              onRemove={onRemoveTeam}
              onMove={onMoveTeam}
              onAddMember={onAddMember}
              onUpdateMember={onUpdateMember}
              onRemoveMember={onRemoveMember}
            />
          ))}
          <AddTeamCard onAdd={onAddTeam} />
        </div>
      </section>
    </div>
  )
}
