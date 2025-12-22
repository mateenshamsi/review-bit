"use client"
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useQuery } from '@tanstack/react-query'
import { getDashboardStats, getMonthlyActivity } from '@/module/dashboard/actions'
import { GitBranch, GitCommit, GitPullRequest, BookOpen, TrendingUp, Calendar, AlertCircle, Github } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import Link from 'next/link'

function Page() {
  const {
    data: stats,
    isLoading,
    isError,
    error
  } = useQuery(
    {
      queryKey: ['dashboardStats'],
      queryFn: async () => await getDashboardStats(),
      refetchOnWindowFocus: false,
      retry: false
    }
  )
  console.log("Dashboard Stats:", stats, error)
  const { data: monthlyActivity, isLoading: isMonthlyActivityLoading, isError: isMonthlyError } = useQuery({
    queryKey: ['monthlyActivity'],
    queryFn: async () => await getMonthlyActivity(),
    refetchOnWindowFocus: false,
    retry: false
  })

  const StatCard = ({ title, value, icon: Icon, description, color = "primary" }: any) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {isLoading ? <Skeleton className="h-8 w-20" /> : value}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  )

  // Check if error is about missing GitHub token
  const isMissingToken = error?.message?.includes('GitHub access token not found') || 
                         error?.message?.includes('No active session')

  // Show GitHub connection prompt if token is missing
  if (isMissingToken) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's an overview of your activity.
          </p>
        </div>

        <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
          <Github className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800 dark:text-yellow-400">GitHub Account Not Connected</AlertTitle>
          <AlertDescription className="text-yellow-700 dark:text-yellow-500">
            Connect your GitHub account to view your dashboard statistics and activity.
          </AlertDescription>
        </Alert>

        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Github className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Connect GitHub Account</CardTitle>
            <CardDescription>
              To access your dashboard, you need to connect your GitHub account.
              This allows us to fetch your repositories, commits, and activity data.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-4 rounded-lg bg-muted">
                <GitBranch className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="font-medium">Repository Stats</p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <GitCommit className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="font-medium">Commit History</p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <GitPullRequest className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="font-medium">Pull Requests</p>
              </div>
            </div>
            <Button asChild size="lg" className="w-full md:w-auto">
              <Link href="/dashboard/settings">
                <Github className="mr-2 h-4 w-4" />
                Connect GitHub Account
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's an overview of your activity.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Generic Error Alert */}
      {isError && !isMissingToken && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load dashboard data. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <StatCard
          title="Total Repositories"
          value={stats?.totalRepos || 0}
          icon={GitBranch}
          description="Active repositories"
          color="blue-500"
        />
        <StatCard
          title="Total Commits"
          value={stats?.totalCommits || 0}
          icon={GitCommit}
          description="All time commits"
          color="green-500"
        />
        <StatCard
          title="Pull Requests"
          value={stats?.totalPRs || 0}
          icon={GitPullRequest}
          description="Total PRs created"
          color="purple-500"
        />
        <StatCard
          title="Code Reviews"
          value={stats?.totalReviews || 0}
          icon={BookOpen}
          description="Reviews completed"
          color="orange-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6">
        {/* Monthly Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Activity</CardTitle>
            <CardDescription>Your contributions, reviews, and PRs over the past 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            {isMonthlyActivityLoading ? (
              <Skeleton className="h-[400px] w-full" />
            ) : isMonthlyError ? (
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                <p>Unable to load activity data</p>
              </div>
            ) : monthlyActivity && monthlyActivity.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={monthlyActivity}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="month" 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="contributions" 
                    fill="#4caF50"
                    radius={[8, 8, 0, 0]}
                    name="Contributions"
                  />
                  <Bar 
                    dataKey="reviews" 
                    fill="#ff9800"
                    radius={[8, 8, 0, 0]}
                    name="Reviews"
                  />
                  <Bar 
                    dataKey="prs" 
                    fill="#2196F3"
                    radius={[8, 8, 0, 0]}
                    name="Pull Requests"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                <p>No activity data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">This Month</CardTitle>
              <CardDescription>Current month activity</CardDescription>
            </CardHeader>
            <CardContent>
              {isMonthlyActivityLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : monthlyActivity && monthlyActivity.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Contributions</span>
                    <span className="font-semibold">{monthlyActivity[monthlyActivity.length - 1]?.contributions || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Reviews</span>
                    <span className="font-semibold">{monthlyActivity[monthlyActivity.length - 1]?.reviews || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">PRs</span>
                    <span className="font-semibold">{monthlyActivity[monthlyActivity.length - 1]?.prs || 0}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No data</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Average per Month</CardTitle>
              <CardDescription>Last 6 months average</CardDescription>
            </CardHeader>
            <CardContent>
              {isMonthlyActivityLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : monthlyActivity && monthlyActivity.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Contributions</span>
                    <span className="font-semibold">
                      {Math.round(monthlyActivity.reduce((sum, m) => sum + (m.contributions || 0), 0) / monthlyActivity.length)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Reviews</span>
                    <span className="font-semibold">
                      {Math.round(monthlyActivity.reduce((sum, m) => sum + (m.reviews || 0), 0) / monthlyActivity.length)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">PRs</span>
                    <span className="font-semibold">
                      {Math.round(monthlyActivity.reduce((sum, m) => sum + (m.prs || 0), 0) / monthlyActivity.length)}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No data</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Total (6 Months)</CardTitle>
              <CardDescription>Cumulative activity</CardDescription>
            </CardHeader>
            <CardContent>
              {isMonthlyActivityLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : monthlyActivity && monthlyActivity.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Contributions</span>
                    <span className="font-semibold">
                      {monthlyActivity.reduce((sum, m) => sum + (m.contributions || 0), 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Reviews</span>
                    <span className="font-semibold">
                      {monthlyActivity.reduce((sum, m) => sum + (m.reviews || 0), 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">PRs</span>
                    <span className="font-semibold">
                      {monthlyActivity.reduce((sum, m) => sum + (m.prs || 0), 0)}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No data</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Page