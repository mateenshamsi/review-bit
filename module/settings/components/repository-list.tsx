'use client'
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogAction } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { getConnectedRepos, disconnectAllRepos, disconnectRepo } from '@/module/github/lib/github'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, ExternalLink, Trash2 } from 'lucide-react'
import React, { useState } from 'react'
import { toast } from 'sonner'

function RepositoryList() {
  const queryClient = useQueryClient()
  
  const { data: repos, isLoading } = useQuery({
    queryKey: ['connected-repos'],
    queryFn: async () => await getConnectedRepos(),
    staleTime: 5 * 60 * 1000,
  })

  const disconnectRepoMutation = useMutation({
    mutationFn: async (repoId: string) => await disconnectRepo(repoId),
    onSuccess: async (data, variables) => {
      if (data.success) {
        toast.success(data.message)
        queryClient.invalidateQueries({ queryKey: ['connected-repos'] })
      } else {
        toast.error(data.message)
      }
    },
    onError: (error) => {
      toast.error("Failed to disconnect repository")
    }
  })

  const disconnectAllMutation = useMutation({
    mutationFn: async () => await disconnectAllRepos(),
    onSuccess: async (data) => {
      if (data.success) {
        toast.success(data.message)
        queryClient.invalidateQueries({ queryKey: ['connected-repos'] })
        setDisconnectAllOpen(false)
      } else {
        toast.error(data.message)
      }
    },
    onError: (error) => {
      toast.error("Failed to disconnect all repositories")
    }
  })

  const [disconnectAllOpen, setDisconnectAllOpen] = useState(false)
  const [disconnectSingleOpen, setDisconnectSingleOpen] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading repositories...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Connected Repositories</h2>
          <p className="text-sm text-muted-foreground">
            {repos?.length || 0} {repos?.length === 1 ? 'repository' : 'repositories'} connected
          </p>
        </div>
        {repos && repos.length > 0 && (
          <Button
            variant="destructive"
            onClick={() => setDisconnectAllOpen(true)}
            disabled={disconnectAllMutation.isPending}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Disconnect All
          </Button>
        )}
      </div>

      {!repos || repos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No repositories connected</p>
            <p className="text-sm text-muted-foreground mt-1">
              Connect a repository to get started
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {repos.map((repo) => (
            <Card key={repo.id} className="relative">
              <CardHeader>
                <CardTitle className="flex items-start justify-between">
                  <span className="truncate pr-2">{repo.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => setDisconnectSingleOpen(repo.id)}
                    disabled={disconnectRepoMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardTitle>
                {repo.description && (
                  <CardDescription className="line-clamp-2">
                    {repo.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {repo.owner && (
                    <div className="flex items-center text-muted-foreground">
                      <span className="font-medium mr-2">Owner:</span>
                      <span>{repo.owner}</span>
                    </div>
                  )}
                  {repo.url && (
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-primary hover:underline"
                    >
                      View on GitHub
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  )}
                </div>
              </CardContent>

              <AlertDialog
                open={disconnectSingleOpen === repo.id}
                onOpenChange={(open) => !open && setDisconnectSingleOpen(null)}
              >
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Disconnect Repository?</AlertDialogTitle>
                  </AlertDialogHeader>
                  <div className="py-4">
                    <p className="text-sm text-muted-foreground">
                      Are you sure you want to disconnect <strong>{repo.name}</strong>? 
                      This action cannot be undone.
                    </p>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        disconnectRepoMutation.mutate(repo.id)
                        setDisconnectSingleOpen(null)
                      }}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Disconnect
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={disconnectAllOpen} onOpenChange={setDisconnectAllOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect All Repositories?</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to disconnect all {repos?.length} repositories? 
              This action cannot be undone.
            </p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => disconnectAllMutation.mutate()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={disconnectAllMutation.isPending}
            >
              {disconnectAllMutation.isPending ? 'Disconnecting...' : 'Disconnect All'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default RepositoryList