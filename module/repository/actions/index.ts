"use server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getGithubRepos } from "@/module/github/lib/github";



export async function fetchRepos(page: number = 1, perPage: number = 10) {
  const reqHeaders = await headers();

  const session = await auth.api.getSession({ headers: reqHeaders });
  if (!session) throw new Error("NO_SESSION");

  const githubRepos = await getGithubRepos(page, perPage);
  if (!githubRepos?.data) throw new Error("GITHUB_REPO_FETCH_FAILED");

  const dbRepos = await prisma.repository.findMany({
    where: { userId: session.user.id }
  });

  const connectedRepoId = new Set(dbRepos.map(r => Number(r.githubId)));

  return githubRepos.data.map((repo: any) => {
    const repoId = Number(repo.id);

    return {
      ...repo,
      id: repoId,                            // JSON safe
      isConnected: connectedRepoId.has(repoId)
    };
  });
}
