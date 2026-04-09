import { auth } from "@clerk/nextjs/server";
import { randomUUID } from "crypto";
import { redirect } from "next/navigation";

export default async function NewWorkflowRedirectPage(
  props: PageProps<"/nodes/new">
) {
  const { userId } = await auth();
  const searchParams = await props.searchParams;
  const templateId =
    typeof searchParams.template === "string" ? searchParams.template : undefined;
  const redirectUrl = templateId
    ? `/nodes/new?template=${encodeURIComponent(templateId)}`
    : "/nodes/new";

  if (!userId) {
    redirect(`/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`);
  }

  const nextUrl = new URLSearchParams({ new: "1" });

  if (templateId) {
    nextUrl.set("template", templateId);
  }

  redirect(`/nodes/${randomUUID()}?${nextUrl.toString()}`);
}
