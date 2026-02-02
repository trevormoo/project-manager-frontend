'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Sidebar } from '@/components/sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { projectsApi } from '@/lib/api'

interface Project {
  _id: string
  name: string
  description?: string
  status: string
  members: Array<{ user: { _id: string; name: string; email: string }; role: string }>
  createdAt: string
  tasks?: Array<{ status: string }>
}

const statusColors: Record<string, string> = {
  planning: 'bg-yellow-100 text-yellow-900',
  active: 'bg-blue-100 text-blue-900',
  'in-progress': 'bg-blue-100 text-blue-900',
  completed: 'bg-green-100 text-green-900',
  archived: 'bg-gray-100 text-gray-900',
}

export default function ProjectsPage() {
  const { isLoading: authLoading, isAuthenticated } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // New project form
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const fetchProjects = async () => {
    try {
      const data = await projectsApi.list()
      setProjects(data || [])
    } catch (err: any) {
      console.error('Failed to fetch projects:', err)
      setError(err.message || 'Failed to load projects')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchProjects()
    }
  }, [authLoading, isAuthenticated])

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProjectName.trim()) return

    setIsCreating(true)
    try {
      const newProject = await projectsApi.create({
        name: newProjectName.trim(),
        description: newProjectDescription.trim() || undefined,
      })
      setProjects([newProject, ...projects])
      setNewProjectName('')
      setNewProjectDescription('')
      setIsDialogOpen(false)
    } catch (err: any) {
      setError(err.message || 'Failed to create project')
    } finally {
      setIsCreating(false)
    }
  }

  // Filter and sort projects
  const filteredProjects = filterStatus === 'all'
    ? projects
    : projects.filter((p) => p.status === filterStatus)

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    } else if (sortBy === 'name') {
      return a.name.localeCompare(b.name)
    }
    return 0
  })

  // Calculate project progress
  const getProjectProgress = (project: Project) => {
    if (!project.tasks || project.tasks.length === 0) {
      if (project.status === 'completed') return 100
      if (project.status === 'active' || project.status === 'in-progress') return 50
      return 0
    }
    const completed = project.tasks.filter(t => t.status === 'completed' || t.status === 'done').length
    return Math.round((completed / project.tasks.length) * 100)
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar onMobileMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />

      <div className="flex">
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Projects</h1>
                <p className="text-muted-foreground mt-2">Manage and track all your projects</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-primary text-primary-foreground">
                    <Plus className="w-4 h-4" />
                    New Project
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogDescription>
                      Add a new project to start organizing your tasks.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateProject}>
                    <div className="space-y-4 py-4">
                      <div>
                        <label htmlFor="projectName" className="block text-sm font-medium mb-2">
                          Project Name
                        </label>
                        <Input
                          id="projectName"
                          value={newProjectName}
                          onChange={(e) => setNewProjectName(e.target.value)}
                          placeholder="Enter project name"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="projectDescription" className="block text-sm font-medium mb-2">
                          Description (optional)
                        </label>
                        <Input
                          id="projectDescription"
                          value={newProjectDescription}
                          onChange={(e) => setNewProjectDescription(e.target.value)}
                          placeholder="Enter project description"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isCreating}>
                        {isCreating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          'Create Project'
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {error && (
              <div className="mb-6 p-4 text-red-600 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex-1">
                <label className="text-sm font-medium text-foreground block mb-2">Status</label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="bg-card border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <label className="text-sm font-medium text-foreground block mb-2">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-card border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date Created</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="p-6 border border-border">
                    <div className="space-y-4">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                      <Skeleton className="h-2 w-full" />
                      <div className="flex justify-between">
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>
                  </Card>
                ))
              ) : sortedProjects.length === 0 ? (
                <div className="col-span-full">
                  <Card className="p-12 text-center border border-border">
                    <p className="text-muted-foreground mb-4">
                      {filterStatus === 'all' ? 'No projects found' : `No ${filterStatus} projects`}
                    </p>
                    <Button
                      onClick={() => setIsDialogOpen(true)}
                      className="gap-2 bg-primary text-primary-foreground"
                    >
                      <Plus className="w-4 h-4" />
                      Create your first project
                    </Button>
                  </Card>
                </div>
              ) : (
                sortedProjects.map((project) => {
                  const progress = getProjectProgress(project)
                  return (
                    <Link key={project._id} href={`/projects/${project._id}`}>
                      <Card className="p-6 border border-border hover:border-primary hover:shadow-lg transition-all cursor-pointer h-full flex flex-col">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-bold text-foreground text-lg leading-tight">
                              {project.name}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {project.description || 'No description'}
                            </p>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex gap-2 mb-4">
                          <Badge
                            className={`text-xs capitalize ${statusColors[project.status] || 'bg-gray-100 text-gray-900'}`}
                          >
                            {project.status === 'in-progress' ? 'In Progress' : project.status}
                          </Badge>
                        </div>

                        {/* Progress */}
                        <div className="mb-4 flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-muted-foreground">Progress</span>
                            <span className="text-xs font-semibold text-foreground">{progress}%</span>
                          </div>
                          <Progress value={progress} />
                        </div>

                        {/* Members and Date */}
                        <div className="flex items-center justify-between pt-4 border-t border-border">
                          <div className="flex -space-x-2">
                            {project.members?.slice(0, 3).map((member, idx) => (
                              <div
                                key={idx}
                                className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center border-2 border-card"
                                title={member.user?.name || 'Unknown'}
                              >
                                {(member.user?.name || 'U').substring(0, 2).toUpperCase()}
                              </div>
                            ))}
                            {(project.members?.length || 0) > 3 && (
                              <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-semibold flex items-center justify-center border-2 border-card">
                                +{project.members.length - 3}
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(project.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </Card>
                    </Link>
                  )
                })
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
