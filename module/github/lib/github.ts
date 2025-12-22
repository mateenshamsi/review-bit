import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
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
