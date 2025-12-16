import React from 'react'
import {
  Sidebar,
  SidebarInset,
  SidebarMenu,
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { Separator } from '@/components/ui/separator';
import AppSideBar from '@/components/app-sidebar';
import { requireAuth } from '@/module/auth/utils/auth-utils';

async function DashboardLayout({children}:{children:React.ReactNode}) {
  await requireAuth(); 
  return (
    <SidebarProvider>
      <AppSideBar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">Dashboard</h1>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default DashboardLayout