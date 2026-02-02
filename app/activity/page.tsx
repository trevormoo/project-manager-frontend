'use client'

import { useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Sidebar } from '@/components/sidebar'
import { Card } from '@/components/ui/card'
import { CheckCircle2, AlertCircle, Briefcase, Edit3, Trash2 } from 'lucide-react'

// Mock activity data
const activities = [
  {
    id: 1,
    type: 'task_completed',
    user: 'Alice Brown',
    action: 'completed task',
    target: 'Design homepage mockup',
    project: 'Website Redesign',
    timestamp: '2 hours ago',
    avatar: 'AB',
  },
  {
    id: 2,
    type: 'project_created',
    user: 'You',
    action: 'created project',
    target: 'Q2 Marketing Campaign',
    project: 'Q2 Marketing Campaign',
    timestamp: '1 day ago',
    avatar: 'JD',
  },
  {
    id: 3,
    type: 'task_assigned',
    user: 'Charlie Davis',
    action: 'assigned task',
    target: 'Review API documentation',
    project: 'API Integration',
    timestamp: '2 days ago',
    avatar: 'CD',
  },
  {
    id: 4,
    type: 'project_updated',
    user: 'You',
    action: 'updated project',
    target: 'Website Redesign',
    project: 'Website Redesign',
    timestamp: '3 days ago',
    avatar: 'JD',
  },
  {
    id: 5,
    type: 'task_completed',
    user: 'Bob Wilson',
    action: 'completed task',
    target: 'Setup database',
    project: 'Mobile App Launch',
    timestamp: '4 days ago',
    avatar: 'BW',
  },
  {
    id: 6,
    type: 'task_assigned',
    user: 'Alice Brown',
    action: 'assigned task',
    target: 'Write unit tests',
    project: 'Website Redesign',
    timestamp: '5 days ago',
    avatar: 'AB',
  },
]

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'task_completed':
      return <CheckCircle2 className="w-5 h-5 text-green-600" />
    case 'task_assigned':
      return <AlertCircle className="w-5 h-5 text-blue-600" />
    case 'project_created':
      return <Briefcase className="w-5 h-5 text-purple-600" />
    case 'project_updated':
      return <Edit3 className="w-5 h-5 text-orange-600" />
    default:
      return <AlertCircle className="w-5 h-5 text-gray-400" />
  }
}

const getActivityLabel = (type: string) => {
  switch (type) {
    case 'task_completed':
      return 'Task Completed'
    case 'task_assigned':
      return 'Task Assigned'
    case 'project_created':
      return 'Project Created'
    case 'project_updated':
      return 'Project Updated'
    default:
      return 'Activity'
  }
}

export default function ActivityPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Navbar onMobileMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
      
      <div className="flex">
        <Sidebar />
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-8 max-w-4xl">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Activity Feed</h1>
              <p className="text-muted-foreground mt-2">Track all activities across your projects</p>
            </div>

            {/* Timeline */}
            <div className="space-y-1">
              {activities.map((activity, index) => (
                <div key={activity.id} className="relative">
                  {/* Timeline Line */}
                  {index !== activities.length - 1 && (
                    <div className="absolute left-7 top-14 bottom-0 w-0.5 bg-border" />
                  )}

                  {/* Activity Item */}
                  <Card className="p-4 border border-border hover:border-primary transition-colors cursor-pointer relative z-10">
                    <div className="flex gap-4">
                      {/* Icon */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          {getActivityIcon(activity.type)}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-foreground">
                              {activity.user}{' '}
                              <span className="font-normal text-muted-foreground">
                                {activity.action}
                              </span>
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              <span className="font-medium text-foreground">{activity.target}</span> in{' '}
                              <span className="font-medium text-foreground">{activity.project}</span>
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {activity.timestamp}
                          </span>
                        </div>

                        {/* Activity Type Badge */}
                        <div className="mt-2">
                          <span className="inline-block px-2 py-1 text-xs font-medium bg-muted text-muted-foreground rounded">
                            {getActivityLabel(activity.type)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>

            {/* Load More */}
            <div className="mt-8 text-center">
              <button className="text-primary hover:underline font-medium">Load more activities</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
