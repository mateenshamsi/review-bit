"use client"

import * as React from "react"
import { useEffect } from "react"
import { usePathname } from "next/navigation"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"
import {
    Home,
    LayoutDashboard,
    Settings,
    User,
    LogOut,
    Github,
    BookOpen,
    CreditCard
} from "lucide-react"
import Link from "next/link"
import { useSession } from "@/lib/auth-client"
import LogoutUi from "@/module/auth/components/logout"

const menuItems = [
    { title: "Home", url: "/dashboard", icon: Home },
    { title: "Dashboard", url: "/dashboard/overview", icon: LayoutDashboard },
    { title: "Profile", url: "/dashboard/profile", icon: User },
    { title: "Settings", url: "/dashboard/settings", icon: Settings },
    { title: "Repository", url: "/dashboard/repository", icon: Github },
    { title: "Reviews", url: "/dashboard/reviews", icon: BookOpen },
    { title: "Subscriptions", url: "/dashboard/subscriptions", icon: CreditCard }
]

export default function AppSidebar() {
    const [isMounted, setIsMounted] = React.useState(false);
    const { data, isPending } = useSession()
    const pathname = usePathname();
    
    // Fix: useEffect must be called BEFORE any conditional returns
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const isActive = (url: string) => {
        return pathname === url || pathname.startsWith(url + "/");
    }

    // Show loading state while mounting or loading session
    if (!isMounted || isPending) {
        return null;
    }

    const sessionInfo = data?.session
    const user = data?.user
    
    // If no session after loading, return null
    if (!sessionInfo) {
        return null;
    }

    const userName = user?.name || "User"
    const userEmail = user?.email || ""
    const userInitials = userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()

    return (
        <Sidebar>
            <SidebarHeader>
                <div className="flex items-center gap-3 px-4 py-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        {userInitials}
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-sm font-semibold">{userName}</h2>
                        <p className="text-xs text-muted-foreground">
                            {userEmail}
                        </p>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isActive(item.url)}
                                    >
                                        <Link href={item.url}>
                                            <item.icon className="h-4 w-4" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <LogoutUi>
                            <SidebarMenuButton className="w-full">
                                <LogOut className="h-4 w-4" />
                                <span>Logout</span>
                            </SidebarMenuButton>
                        </LogoutUi>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    )
}