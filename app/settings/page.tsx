'use client'

import { useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Sidebar } from '@/components/sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Bell, Lock, User, Eye } from 'lucide-react'

export default function SettingsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [formData, setFormData] = useState({
    fullName: 'John Doe',
    email: 'john@example.com',
    title: 'Product Manager',
    timezone: 'EST',
    notifications: {
      emailNotifications: true,
      taskReminders: true,
      projectUpdates: true,
    },
  })

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleNotificationChange = (key: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }))
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
  ] as const

  return (
    <div className="min-h-screen bg-background">
      <Navbar onMobileMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
      
      <div className="flex">
        <Sidebar />
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Settings</h1>
              <p className="text-muted-foreground mt-2">Manage your account and preferences</p>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-0 border-b border-border mb-8 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* Tab Content */}
            <div className="max-w-2xl">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <Card className="p-6 border border-border">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Personal Information</h2>
                    
                    <div className="space-y-4">
                      {/* Full Name */}
                      <div>
                        <label className="text-sm font-medium text-foreground block mb-2">
                          Full Name
                        </label>
                        <Input
                          type="text"
                          value={formData.fullName}
                          onChange={(e) => handleChange('fullName', e.target.value)}
                          className="bg-card border-border"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="text-sm font-medium text-foreground block mb-2">
                          Email Address
                        </label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          className="bg-card border-border"
                        />
                      </div>

                      {/* Job Title */}
                      <div>
                        <label className="text-sm font-medium text-foreground block mb-2">
                          Job Title
                        </label>
                        <Input
                          type="text"
                          value={formData.title}
                          onChange={(e) => handleChange('title', e.target.value)}
                          className="bg-card border-border"
                        />
                      </div>

                      {/* Timezone */}
                      <div>
                        <label className="text-sm font-medium text-foreground block mb-2">
                          Timezone
                        </label>
                        <Select value={formData.timezone} onValueChange={(value) => handleChange('timezone', value)}>
                          <SelectTrigger className="bg-card border-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PST">PST</SelectItem>
                            <SelectItem value="MST">MST</SelectItem>
                            <SelectItem value="CST">CST</SelectItem>
                            <SelectItem value="EST">EST</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button className="bg-primary text-primary-foreground w-full">
                        Save Changes
                      </Button>
                    </div>
                  </Card>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <Card className="p-6 border border-border">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Notification Preferences</h2>
                    
                    <div className="space-y-4">
                      {/* Email Notifications */}
                      <div className="flex items-center justify-between p-4 bg-muted rounded border border-border">
                        <div>
                          <p className="font-medium text-foreground">Email Notifications</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Receive email updates about your projects
                          </p>
                        </div>
                        <Checkbox
                          checked={formData.notifications.emailNotifications}
                          onCheckedChange={(checked) =>
                            handleNotificationChange('emailNotifications', checked as boolean)
                          }
                        />
                      </div>

                      {/* Task Reminders */}
                      <div className="flex items-center justify-between p-4 bg-muted rounded border border-border">
                        <div>
                          <p className="font-medium text-foreground">Task Reminders</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Get reminders for upcoming task deadlines
                          </p>
                        </div>
                        <Checkbox
                          checked={formData.notifications.taskReminders}
                          onCheckedChange={(checked) =>
                            handleNotificationChange('taskReminders', checked as boolean)
                          }
                        />
                      </div>

                      {/* Project Updates */}
                      <div className="flex items-center justify-between p-4 bg-muted rounded border border-border">
                        <div>
                          <p className="font-medium text-foreground">Project Updates</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Get notified about project changes and updates
                          </p>
                        </div>
                        <Checkbox
                          checked={formData.notifications.projectUpdates}
                          onCheckedChange={(checked) =>
                            handleNotificationChange('projectUpdates', checked as boolean)
                          }
                        />
                      </div>

                      <Button className="bg-primary text-primary-foreground w-full">
                        Save Preferences
                      </Button>
                    </div>
                  </Card>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <Card className="p-6 border border-border">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Security Settings</h2>
                    
                    <div className="space-y-4">
                      {/* Change Password */}
                      <div>
                        <h3 className="font-medium text-foreground mb-3">Change Password</h3>
                        <div className="space-y-3">
                          <Input
                            type="password"
                            placeholder="Current Password"
                            className="bg-card border-border"
                          />
                          <Input
                            type="password"
                            placeholder="New Password"
                            className="bg-card border-border"
                          />
                          <Input
                            type="password"
                            placeholder="Confirm New Password"
                            className="bg-card border-border"
                          />
                          <Button className="bg-primary text-primary-foreground w-full">
                            Update Password
                          </Button>
                        </div>
                      </div>

                      <hr className="my-6 border-border" />

                      {/* Two-Factor Authentication */}
                      <div>
                        <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                          Two-Factor Authentication
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Add an extra layer of security to your account
                        </p>
                        <Button variant="outline" className="border-border bg-transparent">
                          Enable 2FA
                        </Button>
                      </div>

                      <hr className="my-6 border-border" />

                      {/* Active Sessions */}
                      <div>
                        <h3 className="font-medium text-foreground mb-3">Active Sessions</h3>
                        <div className="space-y-3">
                          <div className="p-3 bg-muted rounded border border-border">
                            <p className="text-sm font-medium text-foreground">Current Session</p>
                            <p className="text-xs text-muted-foreground mt-1">Chrome on macOS</p>
                            <p className="text-xs text-muted-foreground">Last active: Just now</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
