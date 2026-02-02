'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Sidebar } from '@/components/sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { KanbanBoard } from '@/components/kanban-board'
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
import { ArrowLeft, Plus, MoreHorizontal, Calendar, Loader2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/contexts/AuthContext'
import { projectsApi, tasksApi } from '@/lib/api'

interface Task {
  _id: string
  title: string
  description?: string
  status: string
  priority: string
  dueDate?: string
  assignees?: Array<{ user: { _id: string; name: string } }>
  createdAt: string
}

interface Project {
  _id: string
  name: string
  description?: string
  status: string
  members: Array<{ user: { _id: string; name: string; email: string }; role: string }>
  createdAt: string
}

const statusColors: Record<string, string> = {
  todo: 'bg-gray-100 text-gray-900',
  'in-progress': 'bg-blue-100 text-blue-900',
  done: 'bg-green-100 text-green-900',
  completed: 'bg-green-100 text-green-900',
}

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-900',
  medium: 'bg-orange-100 text-orange-900',
  high: 'bg-red-100 text-red-900',
  urgent: 'bg-red-200 text-red-950',
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  const { isLoading: authLoading, isAuthenticated } = useAuth()

  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('tasks')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')

  // New task form
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDescription, setNewTaskDescription] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState('medium')
  const [isCreating, setIsCreating] = useState(false)

  const fetchProjectData = async () => {
    try {
      const [projectData, tasksData] = await Promise.all([
        projectsApi.get(projectId),
        tasksApi.list(projectId),
      ])
      setProject(projectData)
      setTasks(tasksData || [])
    } catch (err: any) {
      console.error('Failed to fetch project:', err)
      setError(err.message || 'Failed to load project')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && isAuthenticated && projectId) {
      fetchProjectData()
    }
  }, [authLoading, isAuthenticated, projectId])

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return

    setIsCreating(true)
    try {
      const newTask = await tasksApi.create(projectId, {
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim() || undefined,
        priority: newTaskPriority,
        status: 'todo',
      })
      setTasks([newTask, ...tasks])
      setNewTaskTitle('')
      setNewTaskDescription('')
      setNewTaskPriority('medium')
      setIsTaskDialogOpen(false)
    } catch (err: any) {
      setError(err.message || 'Failed to create task')
    } finally {
      setIsCreating(false)
    }
  }

  const handleTaskStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await tasksApi.update(projectId, taskId, { status: newStatus })
      setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t))
    } catch (err: any) {
      console.error('Failed to update task:', err)
    }
  }

  // Filter tasks
  const filteredTasks = statusFilter === 'all'
    ? tasks
    : tasks.filter((t) => t.status === statusFilter)

  // Calculate progress
  const completedTasks = tasks.filter(t => t.status === 'done' || t.status === 'completed').length
  const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0

  const tabs = ['tasks', 'board', 'calendar', 'settings'] as const

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
            {/* Back Button */}
            <Link href="/projects" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
              <ArrowLeft className="w-4 h-4" />
              Back to Projects
            </Link>

            {error && (
              <div className="mb-6 p-4 text-red-600 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}

            {isLoading ? (
              // Loading skeleton
              <div className="space-y-8">
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-8 border border-border">
                  <Skeleton className="h-10 w-1/2 mb-4" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <div className="flex gap-4">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-2 w-48" />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="p-4 border border-border">
                      <Skeleton className="h-4 w-20 mb-2" />
                      <Skeleton className="h-6 w-16" />
                    </Card>
                  ))}
                </div>
              </div>
            ) : project ? (
              <>
                {/* Project Header */}
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-8 mb-8 border border-border">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-4xl font-bold text-foreground mb-2">{project.name}</h1>
                      <p className="text-muted-foreground mb-4">{project.description || 'No description'}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit Project</DropdownMenuItem>
                        <DropdownMenuItem>Share</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Archive</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Progress</p>
                        <p className="text-2xl font-bold text-foreground">{progress}%</p>
                      </div>
                      <Progress value={progress} className="w-48" />
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={`capitalize ${statusColors[project.status] || 'bg-blue-100 text-blue-900'}`}>
                        {project.status === 'in-progress' ? 'In Progress' : project.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Project Meta */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <Card className="p-4 border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Created</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm font-semibold text-foreground">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </Card>
                  <Card className="p-4 border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Team Members</p>
                    <p className="text-sm font-semibold text-foreground">{project.members?.length || 0} members</p>
                  </Card>
                  <Card className="p-4 border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Total Tasks</p>
                    <p className="text-sm font-semibold text-foreground">{tasks.length}</p>
                  </Card>
                  <Card className="p-4 border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Completed</p>
                    <p className="text-sm font-semibold text-foreground">{completedTasks}</p>
                  </Card>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-0 border-b border-border mb-6 overflow-x-auto">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-3 font-medium capitalize border-b-2 transition-colors ${
                        activeTab === tab
                          ? 'border-primary text-primary'
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'tasks' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-bold text-foreground">Tasks</h2>
                      </div>
                      <div className="flex items-center gap-4">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="w-40 bg-card border-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Tasks</SelectItem>
                            <SelectItem value="todo">To Do</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="done">Done</SelectItem>
                          </SelectContent>
                        </Select>
                        <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
                          <DialogTrigger asChild>
                            <Button className="gap-2 bg-primary text-primary-foreground">
                              <Plus className="w-4 h-4" />
                              Add Task
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Create New Task</DialogTitle>
                              <DialogDescription>
                                Add a new task to this project.
                              </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreateTask}>
                              <div className="space-y-4 py-4">
                                <div>
                                  <label htmlFor="taskTitle" className="block text-sm font-medium mb-2">
                                    Task Title
                                  </label>
                                  <Input
                                    id="taskTitle"
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    placeholder="Enter task title"
                                    required
                                  />
                                </div>
                                <div>
                                  <label htmlFor="taskDescription" className="block text-sm font-medium mb-2">
                                    Description (optional)
                                  </label>
                                  <Input
                                    id="taskDescription"
                                    value={newTaskDescription}
                                    onChange={(e) => setNewTaskDescription(e.target.value)}
                                    placeholder="Enter task description"
                                  />
                                </div>
                                <div>
                                  <label htmlFor="taskPriority" className="block text-sm font-medium mb-2">
                                    Priority
                                  </label>
                                  <Select value={newTaskPriority} onValueChange={setNewTaskPriority}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="low">Low</SelectItem>
                                      <SelectItem value="medium">Medium</SelectItem>
                                      <SelectItem value="high">High</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsTaskDialogOpen(false)}>
                                  Cancel
                                </Button>
                                <Button type="submit" disabled={isCreating}>
                                  {isCreating ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      Creating...
                                    </>
                                  ) : (
                                    'Create Task'
                                  )}
                                </Button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>

                    {/* Tasks Table */}
                    <Card className="border border-border overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="border-b border-border bg-muted">
                            <tr>
                              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Title</th>
                              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Priority</th>
                              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Assignee</th>
                              <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Created</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredTasks.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                  {statusFilter === 'all' ? 'No tasks yet. Create one to get started!' : `No ${statusFilter} tasks`}
                                </td>
                              </tr>
                            ) : (
                              filteredTasks.map((task) => (
                                <tr key={task._id} className="border-b border-border hover:bg-muted/50 transition-colors">
                                  <td className="px-6 py-4 text-sm font-medium text-foreground">{task.title}</td>
                                  <td className="px-6 py-4">
                                    <Select
                                      value={task.status}
                                      onValueChange={(value) => handleTaskStatusChange(task._id, value)}
                                    >
                                      <SelectTrigger className="w-32 h-8">
                                        <Badge className={`text-xs capitalize ${statusColors[task.status] || 'bg-gray-100'}`}>
                                          {task.status === 'in-progress' ? 'In Progress' : task.status}
                                        </Badge>
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="todo">To Do</SelectItem>
                                        <SelectItem value="in-progress">In Progress</SelectItem>
                                        <SelectItem value="done">Done</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </td>
                                  <td className="px-6 py-4">
                                    <Badge className={`text-xs capitalize ${priorityColors[task.priority] || 'bg-gray-100'}`}>
                                      {task.priority}
                                    </Badge>
                                  </td>
                                  <td className="px-6 py-4 text-sm text-muted-foreground">
                                    {task.assignees?.[0]?.user?.name || 'Unassigned'}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-muted-foreground">
                                    {new Date(task.createdAt).toLocaleDateString()}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  </div>
                )}

                {activeTab === 'board' && (
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-6">Board</h2>
                    <KanbanBoard
                      columns={[
                        {
                          id: 'todo',
                          title: 'To Do',
                          tasks: tasks.filter(t => t.status === 'todo').map(t => ({
                            id: parseInt(t._id.slice(-6), 16),
                            title: t.title,
                            status: t.status,
                            priority: t.priority,
                            assignee: t.assignees?.[0]?.user?.name || 'Unassigned',
                            dueDate: t.dueDate || '',
                          })),
                        },
                        {
                          id: 'in-progress',
                          title: 'In Progress',
                          tasks: tasks.filter(t => t.status === 'in-progress').map(t => ({
                            id: parseInt(t._id.slice(-6), 16),
                            title: t.title,
                            status: t.status,
                            priority: t.priority,
                            assignee: t.assignees?.[0]?.user?.name || 'Unassigned',
                            dueDate: t.dueDate || '',
                          })),
                        },
                        {
                          id: 'done',
                          title: 'Done',
                          tasks: tasks.filter(t => t.status === 'done' || t.status === 'completed').map(t => ({
                            id: parseInt(t._id.slice(-6), 16),
                            title: t.title,
                            status: t.status,
                            priority: t.priority,
                            assignee: t.assignees?.[0]?.user?.name || 'Unassigned',
                            dueDate: t.dueDate || '',
                          })),
                        },
                      ]}
                      onTaskClick={(task) => {
                        console.log('Task clicked:', task)
                      }}
                    />
                  </div>
                )}

                {activeTab === 'calendar' && (
                  <Card className="p-12 text-center border border-border">
                    <p className="text-muted-foreground mb-4">Calendar view coming soon</p>
                  </Card>
                )}

                {activeTab === 'settings' && (
                  <Card className="p-12 text-center border border-border">
                    <p className="text-muted-foreground mb-4">Project settings coming soon</p>
                  </Card>
                )}
              </>
            ) : (
              <Card className="p-12 text-center border border-border">
                <p className="text-muted-foreground mb-4">Project not found</p>
                <Link href="/projects">
                  <Button>Back to Projects</Button>
                </Link>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
