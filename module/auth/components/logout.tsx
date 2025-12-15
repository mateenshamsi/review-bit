'use client'
import Logout from '@/app/(auth)/logout/page';
import { signOut } from '@/lib/auth-client'
import { useRouter } from 'next/navigation';

import React from 'react'

function LogoutUi({children,className}:{children?:React.ReactNode,className?:string}) {
    const router = useRouter();
    return (
    <div className={className} onClick={()=>signOut({  fetchOptions: {
    onSuccess: () => {
      router.push("/login"); // redirect to login page
    },}})}>
        {children}
    </div>
  )
}

export default LogoutUi