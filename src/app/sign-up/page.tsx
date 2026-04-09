import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AuthModalPage from "@/components/auth/AuthModalPage";

export default async function SignUpPage(props: PageProps<"/sign-up">) {
  const { userId } = await auth();
  const searchParams = await props.searchParams;
  const redirectParam = searchParams.redirect_url;
  const redirectUrl =
    typeof redirectParam === "string"
      ? redirectParam
      : Array.isArray(redirectParam)
        ? redirectParam[0] || "/nodes/new"
        : "/nodes/new";

  if (userId) {
    redirect(redirectUrl);
  }

  return <AuthModalPage mode="signUp" redirectUrl={redirectUrl} />;
}
