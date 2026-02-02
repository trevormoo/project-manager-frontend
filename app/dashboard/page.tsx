'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/navbar'
import { Sidebar } from '@/components/sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Activity, ArrowUpRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { projectsApi, activityApi } from '@/lib/api'

interface Project {
  _id: string
  name: string
  description?: string
  status: string
  members: Array<{ user: { _id: string; name: string; email: string }; role: string }>
  createdAt: string
  tasks?: Array<{ status: string }>
}

interface ActivityItem {
  _id: string
  action: string
  user: { _id: string; name: string }
  entityType: string
  entityName: string
  createdAt: string
}

export default function DashboardPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) return

      try {
        const [projectsData, activityData] = await Promise.all([
          projectsApi.list(),
          activityApi.getRecent().catch(() => [])
        ])
        setProjects(projectsData || [])
        setActivities(activityData || [])
      } catch (err: any) {
        console.error('Failed to fetch dashboard data:', err)
        setError(err.message || 'Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }

    if (!authLoading && isAuthenticated) {
      fetchData()
    }
  }, [authLoading, isAuthenticated])

  // Calculate stats
  const totalProjects = projects.length
  const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'in-progress').length
  const completedProjects = projects.filter(p => p.status === 'completed').length

  // Get recent projects (up to 3)
  const recentProjects = projects.slice(0, 3)

  // Calculate project progress (based on task completion if available)
  const getProjectProgress = (project: Project) => {
    if (!project.tasks || project.tasks.length === 0) {
      if (project.status === 'completed') return 100
      if (project.status === 'active' || project.status === 'in-progress') return 50
      return 0
    }
    const completed = project.tasks.filter(t => t.status === 'completed' || t.status === 'done').length
    return Math.round((completed / project.tasks.length) * 100)
  }

  // Format date
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
    return date.toLocaleDateString()
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const statsCards = [
    { label: 'Total Projects', value: totalProjects.toString(), color: 'bg-blue-100 text-blue-900' },
    { label: 'Active Projects', value: activeProjects.toString(), color: 'bg-purple-100 text-purple-900' },
    { label: 'Completed', value: completedProjects.toString(), color: 'bg-green-100 text-green-900' },
    { label: 'Team Members', value: projects.reduce((acc, p) => acc + (p.members?.length || 0), 0).toString(), color: 'bg-orange-100 text-orange-900' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar onMobileMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />

      <div className="flex">
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-8">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome back, {user?.name?.split(' ')[0] || 'User'}!
              </h1>
              <p className="text-muted-foreground">Here&apos;s what&apos;s happening with your projects today.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 text-red-600 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {statsCards.map((stat, index) => (
                <Card key={index} className="p-6 border border-border">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">{stat.label}</p>
                      {isLoading ? (
                        <Skeleton className="h-9 w-16" />
                      ) : (
                        <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                      )}
                    </div>
                    <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                      <ArrowUpRight className="w-6 h-6" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Projects */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-foreground">Recent Projects</h2>
                  <Link href="/projects">
                    <Button variant="ghost" className="text-primary">
                      View all
                    </Button>
                  </Link>
                </div>

                <div className="space-y-4">
                  {isLoading ? (
                    // Loading skeleton
                    Array.from({ length: 3 }).map((_, i) => (
                      <Card key={i} className="p-6 border border-border">
                        <div className="space-y-4">
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-2 w-full" />
                          <div className="flex justify-between">
                            <Skeleton className="h-8 w-24" />
                            <Skeleton className="h-4 w-20" />
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : recentProjects.length === 0 ? (
                    <Card className="p-8 text-center border border-border">
                      <p className="text-muted-foreground mb-4">No projects yet</p>
                      <Link href="/projects">
                        <Button className="bg-primary text-primary-foreground">
                          Create your first project
                        </Button>
                      </Link>
                    </Card>
                  ) : (
                    recentProjects.map((project) => {
                      const progress = getProjectProgress(project)
                      return (
                        <Link key={project._id} href={`/projects/${project._id}`}>
                          <Card className="p-6 border border-border hover:border-primary transition-colors cursor-pointer">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="font-semibold text-foreground text-lg">{project.name}</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {project.description || 'No description'}
                                </p>
                              </div>
                              <span className="text-sm font-medium text-muted-foreground">{progress}%</span>
                            </div>

                            <Progress value={progress} className="mb-4" />

                            <div className="flex items-center justify-between">
                              <div className="flex -space-x-2">
                                {project.members?.slice(0, 3).map((member, idx) => (
                                  <div
                                    key={idx}
                                    className="w-8 h-8 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center border-2 border-card"
                                    title={member.user?.name || 'Unknown'}
                                  >
                                    {(member.user?.name || 'U').substring(0, 2).toUpperCase()}
                                  </div>
                                ))}
                                {(project.members?.length || 0) > 3 && (
                                  <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground text-xs font-semibold flex items-center justify-center border-2 border-card">
                                    +{project.members.length - 3}
                                  </div>
                                )}
                              </div>
                              <span className="text-sm text-muted-foreground capitalize">{project.status}</span>
                            </div>
                          </Card>
                        </Link>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Activity className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold text-foreground">Recent Activity</h2>
                </div>

                <Card className="border border-border p-6">
                  <div className="space-y-4">
                    {isLoading ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="pb-4 border-b border-border last:border-b-0">
                          <div className="flex gap-3">
                            <Skeleton className="w-5 h-5 rounded-full" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-3 w-1/2" />
                            </div>
                          </div>
                        </div>
                      ))
                    ) : activities.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No recent activity
                      </p>
                    ) : (
                      activities.slice(0, 5).map((activity) => (
                        <div key={activity._id} className="pb-4 border-b border-border last:border-b-0">
                          <div className="flex gap-3">
                            <div className="flex-shrink-0">
                              {activity.action.includes('completed') || activity.action.includes('done') ? (
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                              ) : (
                                <AlertCircle className="w-5 h-5 text-blue-600" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-foreground">
                                <span className="font-semibold">{activity.user?.name || 'Someone'}</span>{' '}
                                <span className="text-muted-foreground">{activity.action}</span>
                              </p>
                              <p className="text-sm text-muted-foreground truncate">{activity.entityName}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatTimeAgo(activity.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
