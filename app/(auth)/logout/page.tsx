import { Button } from '@/components/ui/button'
import LogoutUi from '@/module/auth/components/logout'
import { requireAuth } from '@/module/auth/utils/auth-utils'
import React from 'react'

async function Logout() {
 await requireAuth();
 return (
<div className='flex flex-col items-center justify-center h-full'>
    <LogoutUi >
      <Button>Logout</Button>
    </LogoutUi>
    </div>
  )
}

export default Logout