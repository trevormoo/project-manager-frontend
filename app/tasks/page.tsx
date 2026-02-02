'use client'

import { useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Sidebar } from '@/components/sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, CheckCircle2, Clock, AlertCircle } from 'lucide-react'

// Mock tasks data
const allTasks = [
  {
    id: 1,
    title: 'Design homepage mockup',
    project: 'Website Redesign',
    status: 'completed',
    priority: 'high',
    assignee: 'Alice Brown',
    dueDate: '2024-02-20',
  },
  {
    id: 2,
    title: 'Create database schema',
    project: 'Website Redesign',
    status: 'in-progress',
    priority: 'high',
    assignee: 'Charlie Davis',
    dueDate: '2024-03-01',
  },
  {
    id: 3,
    title: 'Implement authentication',
    project: 'Website Redesign',
    status: 'in-progress',
    priority: 'high',
    assignee: 'John Doe',
    dueDate: '2024-03-05',
  },
  {
    id: 4,
    title: 'Setup CI/CD pipeline',
    project: 'Mobile App Launch',
    status: 'todo',
    priority: 'medium',
    assignee: 'Unassigned',
    dueDate: '2024-03-10',
  },
  {
    id: 5,
    title: 'Performance optimization',
    project: 'API Integration',
    status: 'todo',
    priority: 'medium',
    assignee: 'Unassigned',
    dueDate: '2024-03-15',
  },
]

const statusColors = {
  todo: 'bg-gray-100 text-gray-900',
  'in-progress': 'bg-blue-100 text-blue-900',
  completed: 'bg-green-100 text-green-900',
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-900',
  medium: 'bg-orange-100 text-orange-900',
  high: 'bg-red-100 text-red-900',
}

export default function TasksPage() {
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterAssignee, setFilterAssignee] = useState('all')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const filteredTasks = allTasks.filter((task) => {
    const statusMatch = filterStatus === 'all' || task.status === filterStatus
    const assigneeMatch = filterAssignee === 'all' || task.assignee === filterAssignee
    return statusMatch && assigneeMatch
  })

  const getTaskIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case 'in-progress':
        return <Clock className="w-5 h-5 text-blue-600" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />
    }
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
                <h1 className="text-3xl font-bold text-foreground">Tasks</h1>
                <p className="text-muted-foreground mt-2">All your tasks in one place</p>
              </div>
              <Button className="gap-2 bg-primary text-primary-foreground">
                <Plus className="w-4 h-4" />
                New Task
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex-1">
                <label className="text-sm font-medium text-foreground block mb-2">Status</label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="bg-card border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tasks</SelectItem>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <label className="text-sm font-medium text-foreground block mb-2">Assignee</label>
                <Select value={filterAssignee} onValueChange={setFilterAssignee}>
                  <SelectTrigger className="bg-card border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Assignees</SelectItem>
                    <SelectItem value="John Doe">John Doe</SelectItem>
                    <SelectItem value="Alice Brown">Alice Brown</SelectItem>
                    <SelectItem value="Charlie Davis">Charlie Davis</SelectItem>
                    <SelectItem value="Unassigned">Unassigned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tasks List */}
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <Card key={task.id} className="p-4 border border-border hover:border-primary hover:shadow-md transition-all cursor-pointer">
                  <div className="flex items-start gap-4">
                    {/* Task Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getTaskIcon(task.status)}
                    </div>

                    {/* Task Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground mb-1">{task.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{task.project}</p>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${statusColors[task.status as keyof typeof statusColors]}`}>
                          {task.status === 'in-progress' ? 'In Progress' : task.status}
                        </Badge>
                        <Badge className={`text-xs ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
                          {task.priority}
                        </Badge>
                      </div>
                    </div>

                    {/* Task Meta */}
                    <div className="flex-shrink-0 text-right">
                      <p className="text-sm text-muted-foreground mb-1">{task.assignee}</p>
                      <p className="text-xs text-muted-foreground">{task.dueDate}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {filteredTasks.length === 0 && (
              <Card className="p-12 text-center border border-border">
                <p className="text-muted-foreground mb-4">No tasks found</p>
                <Button className="gap-2 bg-primary text-primary-foreground">
                  <Plus className="w-4 h-4" />
                  Create your first task
                </Button>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
