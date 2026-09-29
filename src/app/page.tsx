import { redirect } from "next/navigation";

export default function Home() {
  // Root page always redirects to dashboard;
  // AuthGuard on dashboard will redirect to login if unauthenticated
  redirect("/dashboard");
}
