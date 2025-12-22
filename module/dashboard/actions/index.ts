"use server"
import { getGitHubToken, getGithubContribution } from "@/module/github/lib/github"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { Octokit } from "octokit"

export const getContributionStats = async()=>{
    try{
        const session = await auth.api.getSession({
            headers:await headers() 
        })
        if(!session) return {status:"Unauthorized"} 
        const token  = await getGitHubToken(await headers()) 
        if(!token) return {status:"GITHUB_NOT_CONNECTED"} 
        const ocktokit = new Octokit({auth:token}) 
        const {data:user} = await ocktokit.rest.users.getAuthenticated()
        if(!user) {
            return {status:"User not found"}
        } 
        const calendar = await getGithubContribution(token,user.login) 
        if(!calendar) return null ; 
         

    }
    catch(err){

    }
}
export const getDashboardStats = async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })
    if (!session) return { status: "UNAUTHENTICATED" }

    const token = await getGitHubToken(await headers())
    if (!token) return { status: "GITHUB_NOT_CONNECTED" }

    const octokit = new Octokit({ auth: token })
    const { data: user } = await octokit.rest.users.getAuthenticated()
    if (!user?.login) return { status: "GITHUB_USER_INVALID" }

    const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
      per_page: 1,
      sort: "updated",
    })

    const calendar = await getGithubContribution(token, user.login)
    const totalCommits = calendar?.totalContributions ?? 0

    const { data: prs } = await octokit.rest.search.issuesAndPullRequests({
      q: `is:pr author:${user.login}`,
      per_page: 1,
    })

    return {
      status: "SUCCESS",
      totalRepos: repos.length,
      totalCommits,
      totalPRs: prs.total_count,
      totalReviews: 44,
    }
  } catch {
    return {
      status: "ERROR",
      message: "Dashboard stats failed",
    }
  }
}

export async function getMonthlyActivity() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) throw new Error("No active session found")

    const token = await getGitHubToken(await headers())
    if (!token) return { status: "GITHUB_NOT_CONNECTED" }

    const octokit = new Octokit({ auth: token })
    const { data: user } = await octokit.rest.users.getAuthenticated()
    if (!user?.login) throw new Error("GitHub user not found")

    const calendar = await getGithubContribution(token, user.login)
    if (!calendar || !calendar.weeks) return []

    const monthlyData: { [key: string]: [number, number, number] } = {}
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ]
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      monthlyData[monthKey] = [0, 0, 0]
    }

    calendar.weeks.forEach((week: any) => {
      week.contributionDays.forEach((day: any) => {
        const date = new Date(day.date)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
        if (monthlyData[monthKey]) monthlyData[monthKey][0] += day.contributionCount
      })
    })

    const generateSampleReviews = () => {
      const sampleReviews = []
      for (let i = 0; i < 45; i++) {
        const reviewDate = new Date()
        reviewDate.setDate(reviewDate.getDate() - Math.floor(Math.random() * 180))
        sampleReviews.push({ createdAt: reviewDate })
      }
      return sampleReviews
    }

    const reviews = generateSampleReviews()
    reviews.forEach((review: any) => {
      const d = review.createdAt
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      if (monthlyData[monthKey]) monthlyData[monthKey][1] += 1
    })

    const { data: prs } = await octokit.rest.search.issuesAndPullRequests({
      q: `is:pr author:${user.login}`,
      per_page: 100,
    })
    prs.items.forEach((pr: any) => {
      const d = new Date(pr.created_at)
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      if (monthlyData[monthKey]) monthlyData[monthKey][2] += 1
    })

    return Object.keys(monthlyData).map((key) => {
      const [contributions, reviews, prs] = monthlyData[key]
      const [year, month] = key.split("-")
      const monthName = monthNames[parseInt(month) - 1]
      return { month: `${monthName} ${year}`, contributions, reviews, prs }
    })
  } catch {
    throw new Error("Failed to load monthly activity")
  }
}
