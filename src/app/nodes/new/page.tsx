import { auth } from "@clerk/nextjs/server";
import { randomUUID } from "crypto";
import { redirect } from "next/navigation";

export default async function NewWorkflowRedirectPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in?redirect_url=%2Fnodes%2Fnew");
  }

  redirect(`/nodes/${randomUUID()}?new=1`);
}
