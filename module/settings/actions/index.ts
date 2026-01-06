"use server" 
import {auth} from '@/lib/auth'
import {headers} from 'next/headers'
import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function getUserProfile(){ 
    try{ 
        const session = await auth.api.getSession({
            headers: await headers(),
        });
        if(!session?.user?.id){
         throw new Error("User not authenticated");
        }
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                createdAt: true,
            },
        });
        return user;
    }
    catch(error){
        console.log("Error fetching user profile:", error);
        return null;
    }
}

export async function updateUserProfile(data: { name?: string; email?: string  }) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });
        if (!session?.user?.id) {
            throw new Error("User not authenticated");
        }
        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                name: data.name,
                email: data.email,
            },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                createdAt: true,
            },

        });
        revalidatePath('/dashboard/settings','page');
        return {
            success: true,
            user: updatedUser,

        }
    } catch (error) {
        console.log("Error updating user profile:", error);
        return {
            success: false,
            error: (error as Error).message,
        };
    }
}
