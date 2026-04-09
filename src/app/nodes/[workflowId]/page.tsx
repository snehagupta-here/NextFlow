import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import WorkflowEditorPage from "@/components/workflow/WorkflowEditorPage";

export default async function WorkflowPage(
  props: PageProps<"/nodes/[workflowId]">
) {
  const { userId } = await auth();
  const params = await props.params;
  const searchParams = await props.searchParams;
  const requestedPath = `/nodes/${params.workflowId}${
    searchParams.new === "1" ? "?new=1" : ""
  }`;

  if (!userId) {
    redirect(`/sign-in?redirect_url=${encodeURIComponent(requestedPath)}`);
  }

  return (
    <WorkflowEditorPage
      requestedWorkflowId={params.workflowId}
      startBlank={searchParams.new === "1"}
    />
  );
}
