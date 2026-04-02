-- Add user ownership to workflows
ALTER TABLE "workflows"
ADD COLUMN "userId" TEXT;

UPDATE "workflows"
SET "userId" = 'legacy-user'
WHERE "userId" IS NULL;

ALTER TABLE "workflows"
ALTER COLUMN "userId" SET NOT NULL;

CREATE INDEX "workflows_userId_updatedAt_idx"
ON "workflows"("userId", "updatedAt" DESC);

-- Add user ownership to workflow runs
ALTER TABLE "workflow_runs"
ADD COLUMN "userId" TEXT;

UPDATE "workflow_runs" wr
SET "userId" = w."userId"
FROM "workflows" w
WHERE wr."workflowId" = w."id"
  AND wr."userId" IS NULL;

UPDATE "workflow_runs"
SET "userId" = 'legacy-user'
WHERE "userId" IS NULL;

ALTER TABLE "workflow_runs"
ALTER COLUMN "userId" SET NOT NULL;

CREATE INDEX "workflow_runs_userId_startedAt_idx"
ON "workflow_runs"("userId", "startedAt" DESC);

-- Add user ownership to node runs
ALTER TABLE "node_runs"
ADD COLUMN "userId" TEXT;

UPDATE "node_runs" nr
SET "userId" = wr."userId"
FROM "workflow_runs" wr
WHERE nr."workflowRunId" = wr."id"
  AND nr."userId" IS NULL;

UPDATE "node_runs"
SET "userId" = 'legacy-user'
WHERE "userId" IS NULL;

ALTER TABLE "node_runs"
ALTER COLUMN "userId" SET NOT NULL;

CREATE INDEX "node_runs_userId_startedAt_idx"
ON "node_runs"("userId", "startedAt" DESC);
