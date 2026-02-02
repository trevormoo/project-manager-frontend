'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { X, Calendar, User, AlertCircle, MessageCircle, Paperclip } from 'lucide-react'

export interface TaskDetail {
  id: number
  title: string
  description: string
  status: 'todo' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  assignee: string
  dueDate: string
  subtasks: Array<{ id: number; title: string; completed: boolean }>
  comments: Array<{ id: number; author: string; text: string; timestamp: string }>
  attachments: Array<{ id: number; name: string; url: string }>
}

interface TaskDetailModalProps {
  task: TaskDetail | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

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

export function TaskDetailModal({ task, open, onOpenChange }: TaskDetailModalProps) {
  const [newComment, setNewComment] = useState('')
  const [editingTitle, setEditingTitle] = useState(false)
  const [editingDescription, setEditingDescription] = useState(false)

  if (!task) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {editingTitle ? (
                <Input
                  value={task.title}
                  className="text-lg font-bold mb-2"
                  autoFocus
                  onBlur={() => setEditingTitle(false)}
                />
              ) : (
                <h2
                  className="text-2xl font-bold text-foreground cursor-pointer hover:text-muted-foreground"
                  onClick={() => setEditingTitle(true)}
                >
                  {task.title}
                </h2>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Priority */}
          <div className="flex gap-3">
            <Badge className={`${statusColors[task.status]}`}>
              {task.status === 'in-progress' ? 'In Progress' : task.status}
            </Badge>
            <Badge className={`${priorityColors[task.priority]}`}>
              {task.priority}
            </Badge>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-semibold text-foreground block mb-2">
              Description
            </label>
            {editingDescription ? (
              <Input
                value={task.description}
                className="min-h-24"
                autoFocus
                onBlur={() => setEditingDescription(false)}
              />
            ) : (
              <p
                className="text-muted-foreground cursor-pointer hover:text-foreground p-3 bg-muted rounded border border-border"
                onClick={() => setEditingDescription(true)}
              >
                {task.description || 'Click to add description'}
              </p>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Due Date */}
            <div>
              <label className="text-sm font-semibold text-foreground block mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Due Date
              </label>
              <Select defaultValue={task.dueDate}>
                <SelectTrigger className="bg-card border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={task.dueDate}>{task.dueDate}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Assignee */}
            <div>
              <label className="text-sm font-semibold text-foreground block mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Assignee
              </label>
              <Select defaultValue={task.assignee}>
                <SelectTrigger className="bg-card border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={task.assignee}>{task.assignee}</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Subtasks */}
          <div>
            <label className="text-sm font-semibold text-foreground block mb-3">
              Subtasks ({task.subtasks.filter(s => s.completed).length}/{task.subtasks.length})
            </label>
            <div className="space-y-2">
              {task.subtasks.map((subtask) => (
                <div key={subtask.id} className="flex items-center gap-3 p-2 hover:bg-muted rounded transition-colors">
                  <Checkbox checked={subtask.completed} />
                  <span className={subtask.completed ? 'line-through text-muted-foreground' : 'text-foreground'}>
                    {subtask.title}
                  </span>
                </div>
              ))}
              <Button variant="ghost" className="w-full justify-start text-muted-foreground">
                + Add subtask
              </Button>
            </div>
          </div>

          {/* Attachments */}
          <div>
            <label className="text-sm font-semibold text-foreground block mb-3 flex items-center gap-2">
              <Paperclip className="w-4 h-4" />
              Attachments
            </label>
            <div className="space-y-2">
              {task.attachments.map((attachment) => (
                <div key={attachment.id} className="flex items-center gap-2 p-2 bg-muted rounded border border-border">
                  <Paperclip className="w-4 h-4 text-muted-foreground" />
                  <a href={attachment.url} className="text-sm text-primary hover:underline">
                    {attachment.name}
                  </a>
                </div>
              ))}
              <Button variant="outline" className="w-full gap-2 bg-transparent">
                <Paperclip className="w-4 h-4" />
                Add attachment
              </Button>
            </div>
          </div>

          {/* Comments Section */}
          <div>
            <label className="text-sm font-semibold text-foreground block mb-3 flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Comments ({task.comments.length})
            </label>
            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
              {task.comments.map((comment) => (
                <div key={comment.id} className="p-3 bg-muted rounded border border-border">
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-medium text-foreground text-sm">{comment.author}</p>
                    <p className="text-xs text-muted-foreground">{comment.timestamp}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{comment.text}</p>
                </div>
              ))}
            </div>

            {/* Add Comment */}
            <div className="flex gap-2">
              <Input
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="bg-card border-border"
              />
              <Button
                onClick={() => {
                  setNewComment('')
                }}
                className="bg-primary text-primary-foreground"
              >
                Comment
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
