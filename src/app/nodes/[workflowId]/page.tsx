import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import WorkflowEditorPage from "@/components/workflow/WorkflowEditorPage";

export default async function WorkflowPage(
  props: PageProps<"/nodes/[workflowId]">
) {
  const { userId } = await auth();
  const params = await props.params;
  const searchParams = await props.searchParams;
  const requestedSearchParams = new URLSearchParams();

  if (searchParams.new === "1") {
    requestedSearchParams.set("new", "1");
  }

  if (typeof searchParams.template === "string") {
    requestedSearchParams.set("template", searchParams.template);
  }

  const requestedPath = `/nodes/${params.workflowId}${
    requestedSearchParams.size > 0 ? `?${requestedSearchParams.toString()}` : ""
  }`;

  if (!userId) {
    redirect(`/sign-in?redirect_url=${encodeURIComponent(requestedPath)}`);
  }

  return (
    <WorkflowEditorPage
      requestedWorkflowId={params.workflowId}
      startBlank={searchParams.new === "1"}
      templateId={
        typeof searchParams.template === "string"
          ? searchParams.template
          : undefined
      }
    />
  );
}
