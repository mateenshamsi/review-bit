import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";
import {Octokit} from "octokit";
import { string } from "zod";

export const getGitHubClient = async () => {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session) {
        throw new Error("No active session found");
    }
    const user = await prisma.account.findUnique({
        where: { id: session.user.id, providerId: "github" }
    });
    if (!user || !user?.accessToken) {
        throw new Error("GitHub access token not found for the user");
    }
    const octokit = new Octokit({
        auth: user.accessToken
    });
    return octokit;
};
export const getGithubContribution = async (
  octokit: Octokit,
  username: string
) => {
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
    const response = await octokit.graphql<{
      user: {
        contributionsCollection: {
          contributionCalendar: any;
        };
      };
    }>(query, { username });

    return response.user.contributionsCollection.contributionCalendar;
  } catch {
    throw new Error("Failed to fetch contributions from GitHub");
  }
};
