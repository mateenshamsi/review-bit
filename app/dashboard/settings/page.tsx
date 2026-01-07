import ProfileForm from '@/module/settings/components/profile-form'
import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Github, 
  Key,
  AlertCircle,
  Moon,
  Sun,
  Laptop,
  CheckCircle2
} from 'lucide-react'
import RepositoryList from '@/module/settings/components/repository-list'

function Settings() {
  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <ProfileForm />
      <RepositoryList />
    </div>
  )
}

export default Settings