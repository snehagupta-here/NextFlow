import { redirect } from "next/navigation";

export default async function DashboardRedirectPage(props: PageProps<"/dashboard">) {
  const searchParams = await props.searchParams;
  const workflowId = searchParams.workflowId;
  const mode = searchParams.mode;

  if (typeof workflowId === "string" && workflowId.trim()) {
    redirect(`/nodes/${workflowId}`);
  }

  if (mode === "new") {
    redirect("/nodes/new");
  }

  redirect("/nodes");
}
