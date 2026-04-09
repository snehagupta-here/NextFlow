import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AuthModalPage from "@/components/auth/AuthModalPage";

export default async function SignInPage(props: PageProps<"/sign-in">) {
  const { userId } = await auth();
  const searchParams = await props.searchParams;
  const redirectParam = searchParams.redirect_url;
  const redirectUrl =
    typeof redirectParam === "string"
      ? redirectParam
      : Array.isArray(redirectParam)
        ? redirectParam[0] || "/nodes"
        : "/nodes";

  if (userId) {
    redirect(redirectUrl);
  }

  return <AuthModalPage mode="signIn" redirectUrl={redirectUrl} />;
}
