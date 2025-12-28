"use client"
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useRepository } from '@/module/repository/hooks/use-repository'
import { ExternalLink, Search, Star, GitFork, AlertCircle, Github, Loader2 } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

interface Repository { 
    id: number
    name: string
    full_name: string
    description: string 
    html_url: string 
    stargazers_count: number 
    language: string | null
    topics: string[]
    isConnected?: boolean
    forks_count?: number
}

function Repository() {
    const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useRepository()
    const [localConnectingId, setLocalConnectingId] = useState<number | null>(null) 
    const [searchQuery, setSearchQuery] = useState("")
    const observerTarget = useRef<HTMLDivElement>(null)
    
    const allRepositories = data?.pages.flatMap(page => page) || []
    const filteredRepos = allRepositories.filter((repo: Repository) => 
        repo.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        repo.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )

  
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage()
                }
            },
            { threshold: 0.1 }
        )

        const currentTarget = observerTarget.current
        if (currentTarget) {
            observer.observe(currentTarget)
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget)
            }
        }
    }, [fetchNextPage, hasNextPage, isFetchingNextPage])

    const handleConnect = async (repo: Repository) => {
        setLocalConnectingId(repo.id)
        setTimeout(() => setLocalConnectingId(null), 2000)
    }
    const getLanguageColor = (language: string | null) => {
        const colors: Record<string, string> = {
            JavaScript: 'bg-yellow-400',
            TypeScript: 'bg-blue-500',
            Python: 'bg-green-600',
            Java: 'bg-red-600',
            Go: 'bg-cyan-500',
            Rust: 'bg-orange-600',
            Ruby: 'bg-red-500',
            PHP: 'bg-purple-500',
            'C++': 'bg-pink-600',
            C: 'bg-gray-600',
        }
        return colors[language || ''] || 'bg-gray-500'
    }

    return (    
        <div className='space-y-6 p-6'>
            <div>
                <h1 className='text-3xl font-bold tracking-tight'>Repositories</h1>
                <p className='text-muted-foreground mt-1'>Manage And View Your Repositories</p> 
            </div>
            <div className='relative'>
                <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground'/>
                <Input 
                    className='pl-8'
                    placeholder='Find a Repository...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            {isError && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Failed to load repositories. Please try again later.
                    </AlertDescription>
                </Alert>
            )}
            {isLoading && (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-full mt-2" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-20 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
            {!isLoading && !isError && filteredRepos.length === 0 && (
                <Card className='p-12'>
                    <div className='text-center space-y-3'>
                        <Github className='h-12 w-12 mx-auto text-muted-foreground' />
                        <h3 className='text-lg font-semibold'>No repositories found</h3>
                        <p className='text-sm text-muted-foreground'>
                            {searchQuery 
                                ? 'Try adjusting your search query'
                                : 'Connect your GitHub account to see your repositories'
                            }
                        </p>
                    </div>
                </Card>
            )}
            {!isLoading && !isError && filteredRepos.length > 0 && (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'> 
                    {filteredRepos.map((repo: Repository) => (
                        <Card key={repo.id} className='hover:shadow-lg transition-shadow flex flex-col'>
                            <CardHeader>
                                <div className='flex items-start justify-between gap-2'>
                                    <div className='flex-1 min-w-0'>
                                        <CardTitle className='text-lg truncate flex items-center gap-2'>
                                            <Github className='h-5 w-5 shrink-0' />
                                            {repo.name}
                                        </CardTitle>
                                        <CardDescription className='text-xs mt-1 truncate'>
                                            {repo.full_name}
                                        </CardDescription>
                                    </div>
                                    {repo.isConnected && (
                                        <Badge variant="secondary" className='shrink-0 text-xs'>
                                            Connected
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            
                            <CardContent className='flex-1 flex flex-col space-y-4'>
                                 <p className='text-sm text-muted-foreground line-clamp-2 flex-grow'>
                                    {repo.description || 'No description available'}
                                </p>
                                {repo.topics && repo.topics.length > 0 && (
                                    <div className='flex flex-wrap gap-1'>
                                        {repo.topics.slice(0, 3).map(topic => (
                                            <Badge key={topic} variant="outline" className='text-xs'>
                                                {topic}
                                            </Badge>
                                        ))}
                                        {repo.topics.length > 3 && (
                                            <Badge variant="outline" className='text-xs'>
                                                +{repo.topics.length - 3}
                                            </Badge>
                                        )}
                                    </div>
                                )}
                               <div className='flex items-center gap-4 text-xs text-muted-foreground'>
                                    {repo.language && (
                                        <div className='flex items-center gap-1.5'>
                                            <div className={`w-3 h-3 rounded-full ${getLanguageColor(repo.language)}`} />
                                            <span>{repo.language}</span>
                                        </div>
                                    )}
                                    <div className='flex items-center gap-1'>
                                        <Star className='h-3.5 w-3.5 fill-current' />
                                        <span>{repo.stargazers_count.toLocaleString()}</span>
                                    </div>
                                    {repo.forks_count !== undefined && (
                                        <div className='flex items-center gap-1'>
                                            <GitFork className='h-3.5 w-3.5' />
                                            <span>{repo.forks_count.toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                                <div className='flex gap-2 pt-2'>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className='flex-1'
                                        asChild
                                    >
                                        <a 
                                            href={repo.html_url} 
                                            target='_blank' 
                                            rel='noopener noreferrer'
                                        >
                                            <ExternalLink className='h-4 w-4 mr-2' />
                                            View
                                        </a>
                                    </Button>
                                    
                                    {!repo.isConnected && (
                                        <Button 
                                            size="sm" 
                                            className='flex-1'
                                            onClick={() => handleConnect(repo)}
                                            disabled={localConnectingId === repo.id}
                                        >
                                            {localConnectingId === repo.id ? (
                                                <>
                                                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                                                    Connecting...
                                                </>
                                            ) : (
                                                'Connect'
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
            <div ref={observerTarget} className='h-10 flex items-center justify-center'>
                {isFetchingNextPage && (
                    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                        <Loader2 className='h-4 w-4 animate-spin' />
                        <span>Loading more repositories...</span>
                    </div>
                )}
                {
                    !hasNextPage && !isFetchingNextPage && allRepositories.length > 0 && (
                    <p className='text-center text-muted-foreground'>All repositories loaded</p>
                    )
                }
            </div>
            {!isLoading && !isError && filteredRepos.length > 0 && (
                <div className='text-center text-sm text-muted-foreground pb-4'>
                    Showing {filteredRepos.length} of {allRepositories.length} repositories
                    {!hasNextPage && allRepositories.length > 0 && (
                        <span className='ml-1'>• All loaded</span>
                    )}
                </div>
            )}
        </div>
    )
}

export default Repository