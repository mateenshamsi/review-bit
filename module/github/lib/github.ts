'use server'
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import {Octokit} from "octokit";
import { string } from "zod";

export const getGitHubToken = async (reqHeaders:Headers) => {
  const session = await auth.api.getSession({
    headers: reqHeaders,
  });

  if (!session?.user?.id) {
    return null;
  }

  const account = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      providerId: "github",
    },
    select: {
      accessToken: true,
    },
  });

  console.log("🔍 GitHub account row:", account);

  return account?.accessToken ?? null;
};



type ContributionCalendar = {
  totalContributions: number;
  weeks: {
    contributionDays: {
      date: string;
      contributionCount: number;
      color: string;
    }[];
  }[];
};

type GithubContributionResponse = {
  user: {
    contributionsCollection: {
      contributionCalendar: ContributionCalendar;
    };
  };
};

export const getGithubContribution = async (
  token: string,
  username: string
): Promise<ContributionCalendar> => {
  console.log("🟡 Fetching GitHub contributions", { username });

  if (!token) {
    throw new Error("GitHub token missing");
  }

  if (!username) {
    throw new Error("GitHub username missing");
  }

  const octokit = new Octokit({ auth: token });

  const query = `
    query ($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                color
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await octokit.graphql<GithubContributionResponse>(
      query,
      { username }
    );

    console.log("🟢 Contributions fetched");

    return response.user.contributionsCollection.contributionCalendar;
  } catch (error) {
    console.error("💥 GitHub contribution fetch failed:", error);
    throw error;
  }
};

export const getGithubRepos = async(page:number=1,perPage:number=10)=>{
  const reqHeaders = await headers()
  const token = await getGitHubToken(reqHeaders) 
  const octokit = new Octokit({ auth: token })
  const data = await octokit.rest.repos.listForAuthenticatedUser({
    sort:"updated",
    direction:"desc",
    visibility:"public",
    per_page:perPage,
    page:page
  })
  return data 
}

export const deleteWebhook = async (repo:string,owner:string)=>{
  const token = await getGitHubToken(await headers())
  const octokit = new Octokit({ auth: token })
  const webhookUrl = process.env.NEXT_PUBLIC_APP_BASE_URL + '/api/webhooks/github'
  try {
    const { data: hooks } = await octokit.rest.repos.listWebhooks({
      owner,
      repo,
    });

    const hookToDelete = hooks.find((hook) => hook.config.url === webhookUrl);
    if (hookToDelete) {
      await octokit.rest.repos.deleteWebhook({
        owner,
        repo,
        hook_id: hookToDelete.id,
      });
      console.log(` Deleted webhook for ${owner}/${repo}`);
    } else {
      console.log(` No matching webhook found for ${owner}/${repo}`);
    }
  } catch (error) {
    console.error(` Failed to delete webhook for ${owner}/${repo}:`, error)
    };
}

export async function getConnectedRepos(){
  try{
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return [];
    }
    const repos = await prisma.repository.findMany({
      where:{
        userId:session.user.id
      },
      select:{ 
        id:true, 
        name:true, 
      },
      orderBy:{
        createdAt:"desc"
      }
    })
    return repos
  }
  catch(error){
    console.error(" Failed to get connected repos:", error)
  }
}

export async function disconnectRepo(repoId:string){
  try{
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if(!session?.user?.id){
      throw new Error("User not authenticated")
    }
    const repo = await prisma.repository.findUnique({
      where:{
        id:repoId,
        userId:session.user.id
      }
    })
    if(!repo) 
    {
      throw new Error("Repository not found or not authorized") 
    }
    await deleteWebhook(repo.name, repo.owner)
    const result = await prisma.repository.delete({
      where:{
        id:repoId,
        userId:session.user.id
      }
    })
    revalidatePath('/dashboard/settings','page') 
    revalidatePath('/dashboard/repository','page')
    return { success:true, message:"Repository disconnected successfully"}
  } 
  catch(error){
    console.error(" Failed to disconnect repo:",error)
    return { success:false, message:"Repository failed to disconnect successfully"}
    
  }
}

export async function disconnectAllRepos(){
  try{
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if(!session?.user?.id){
      throw new Error("User not authenticated")
    }
    const repos = await prisma.repository.findMany({
      where:{
        userId:session.user.id
      }
    })
    await Promise.all(repos.map(async(repo)=>{
      await deleteWebhook(repo.name, repo.owner)
    }))
    const result = await prisma.repository.deleteMany({
      where:{
        userId:session.user.id  
      }
    })
    revalidatePath('/dashboard/settings')
    revalidatePath('/dashboard/repository')
    return { success:true, message:"All repositories disconnected successfully"}
  } 
  catch(error){
    console.error(" Failed to disconnect all repos:",error)
    return { success:false, message:"Failed to disconnect all repositories successfully"}
  } 
}
