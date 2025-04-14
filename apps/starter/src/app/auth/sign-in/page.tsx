import { authViewPaths } from "@daveyplate/better-auth-ui/server"
import { AuthView } from "./view"

export function generateStaticParams() {
  return Object.values(authViewPaths).map((pathname) => ({ pathname }))
}

export default async function AuthPage() {

  return <AuthView />
}
