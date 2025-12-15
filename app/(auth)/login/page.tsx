
import LoginUI from '@/module/auth/components/login-ui'
import { requireUnAuth } from '@/module/auth/utils/auth-utils';
import React from 'react'

async function page() {
    await requireUnAuth();
    return (
    <div><LoginUI/></div>
  )
}

export default page