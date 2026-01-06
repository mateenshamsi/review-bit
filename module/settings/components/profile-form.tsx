"use client"
import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getUserProfile, updateUserProfile } from "../actions"
import { toast } from "sonner"
import { User, Mail, Loader2, AlertCircle, Check } from "lucide-react"

function ProfileForm() {
    const queryClient = useQueryClient()
    
    const { data: userProfile, isLoading, isError } = useQuery({ 
        queryKey: ['userProfile'],
        queryFn: async () => await getUserProfile(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
    })

    const [name, setName] = useState("")
    const [email, setEmail] = useState("")

    // Update form when userProfile loads
    useEffect(() => {
        if (userProfile) {
            setName(userProfile.name || "")
            setEmail(userProfile.email || "")
        }
    }, [userProfile])

    const updateMutation = useMutation({
        mutationFn: async (data: { name?: string; email?: string }) => {
            return await updateUserProfile(data)
        },
        onSuccess: (res) => {
            if (res.success) {
                queryClient.invalidateQueries({ queryKey: ['userProfile'] })
                toast.success("Profile updated successfully")
            } else {
                toast.error(res.message || "Failed to update profile")
            }
        }, 
        onError: (error: any) => {
            toast.error(error?.message || "Failed to update profile")
        }
    })

    const handleSubmit = (e: React.FormEvent) => { 
        e.preventDefault()
        
        // Validation
        if (!name.trim()) {
            toast.error("Name is required")
            return
        }
        
        if (!email.trim()) {
            toast.error("Email is required")
            return
        }
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            toast.error("Please enter a valid email address")
            return
        }

        updateMutation.mutate({ name, email })
    }

    const handleReset = () => {
        setName(userProfile?.name || "")
        setEmail(userProfile?.email || "")
    }

    // Check if form has changes
    const hasChanges = 
        name !== (userProfile?.name || "") || 
        email !== (userProfile?.email || "")

    // Loading State
    if (isLoading) {
        return (
            <Card className="max-w-2xl">
                <CardHeader>
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64 mt-2" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-10 w-32" />
                </CardFooter>
            </Card>
        )
    }

    // Error State
    if (isError) {
        return (
            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Profile Settings</CardTitle>
                    <CardDescription>Manage your account information</CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Failed to load profile data. Please try again later.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="max-w-2xl">
            <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                    Update your personal information and account details
                </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
                {/* Name Field */}
                <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Name
                    </Label>
                    <Input
                        id="name"
                        type="text"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={updateMutation.isPending}
                        className="transition-all"
                    />
                    <p className="text-xs text-muted-foreground">
                        This is the name that will be displayed on your profile
                    </p>
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={updateMutation.isPending}
                        className="transition-all"
                    />
                    <p className="text-xs text-muted-foreground">
                        We'll use this email for account notifications
                    </p>
                </div>

                {/* Success Message */}
                {updateMutation.isSuccess && !hasChanges && (
                    <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
                        <Check className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-700 dark:text-green-400">
                            Your profile has been updated successfully
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>

            <CardFooter className="flex justify-between items-center border-t pt-6">
                <div className="text-xs text-muted-foreground">
                    {hasChanges && (
                        <span className="text-amber-600 dark:text-amber-400">
                            You have unsaved changes
                        </span>
                    )}
                </div>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleReset}
                        disabled={!hasChanges || updateMutation.isPending}
                    >
                        Reset
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!hasChanges || updateMutation.isPending}
                    >
                        {updateMutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Check className="mr-2 h-4 w-4" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            </CardFooter>
        </Card>
    )
}

export default ProfileForm