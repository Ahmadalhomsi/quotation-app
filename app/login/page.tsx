import { Suspense } from 'react'
import LoginPage from '@/components/loginPage'

export default function Login() {
    return (
        <Suspense>
            <LoginPage />
        </Suspense>
    )
}
