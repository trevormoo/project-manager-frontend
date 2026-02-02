'use client'

import React from "react"

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export interface KanbanTask {
  id: number
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high'
  assignee?: string
  dueDate?: string
}

export interface KanbanColumn {
  id: string
  title: string
  tasks: KanbanTask[]
}

interface KanbanBoardProps {
  columns: KanbanColumn[]
  onTaskClick?: (task: KanbanTask) => void
  onAddTask?: (columnId: string) => void
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-900',
  medium: 'bg-orange-100 text-orange-900',
  high: 'bg-red-100 text-red-900',
}

export function KanbanBoard({ columns, onTaskClick, onAddTask }: KanbanBoardProps) {
  const [draggedTask, setDraggedTask] = useState<KanbanTask | null>(null)
  const [draggedFromColumn, setDraggedFromColumn] = useState<string | null>(null)

  const handleDragStart = (task: KanbanTask, columnId: string) => {
    setDraggedTask(task)
    setDraggedFromColumn(columnId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDropColumn = (columnId: string) => {
    if (draggedTask && draggedFromColumn && draggedFromColumn !== columnId) {
      // Handle drag and drop logic here
      setDraggedTask(null)
      setDraggedFromColumn(null)
    }
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-6 min-w-min">
        {columns.map((column) => (
          <div
            key={column.id}
            className="flex flex-col w-80 flex-shrink-0 max-h-[calc(100vh-200px)]"
            onDragOver={handleDragOver}
            onDrop={() => handleDropColumn(column.id)}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                {column.title}
                <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-1 rounded">
                  {column.tasks.length}
                </span>
              </h3>
            </div>

            {/* Tasks Container */}
            <div className="flex-1 space-y-3 overflow-y-auto">
              {column.tasks.map((task) => (
                <Card
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task, column.id)}
                  onClick={() => onTaskClick?.(task)}
                  className="p-4 border border-border hover:border-primary cursor-move transition-all hover:shadow-md"
                >
                  <h4 className="font-medium text-foreground text-sm mb-2">{task.title}</h4>
                  {task.description && (
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{task.description}</p>
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <Badge className={`text-xs ${priorityColors[task.priority]}`}>
                      {task.priority}
                    </Badge>
                    {task.assignee && (
                      <span className="text-xs text-muted-foreground">{task.assignee}</span>
                    )}
                  </div>
                  {task.dueDate && (
                    <p className="text-xs text-muted-foreground mt-2">{task.dueDate}</p>
                  )}
                </Card>
              ))}
            </div>

            {/* Add Task Button */}
            <Button
              variant="ghost"
              className="w-full mt-4 gap-2 text-muted-foreground hover:text-foreground"
              onClick={() => onAddTask?.(column.id)}
            >
              <Plus className="w-4 h-4" />
              Add task
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
