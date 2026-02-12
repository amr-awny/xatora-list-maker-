export interface TeamMember {
  id: string
  name: string
}

export interface Team {
  id: string
  name: string
  logoUrl: string | null
  members: TeamMember[]
}

export interface ScrimList {
  id: string
  name: string
  date: string
  organizerName: string
  scrimTime: string
  teams: Team[]
  createdAt: string
}
