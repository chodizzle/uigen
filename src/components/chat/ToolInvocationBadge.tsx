import { Loader2 } from "lucide-react";

interface ToolInvocation {
  toolName: string;
  state: string;
  args?: Record<string, unknown>;
  result?: unknown;
  toolCallId: string;
}

interface ToolInvocationBadgeProps {
  toolInvocation: ToolInvocation;
}

function getBasename(path: string): string {
  const parts = path.replace(/\\/g, "/").split("/");
  return parts[parts.length - 1] || path;
}

function getLabel(tool: ToolInvocation): string {
  const isComplete = tool.state === "result";
  const command = tool.args?.command as string | undefined;
  const path = tool.args?.path as string | undefined;
  const filename = path ? getBasename(path) : undefined;

  if (tool.toolName === "str_replace_editor") {
    switch (command) {
      case "create":
        return isComplete ? `Created ${filename}` : `Creating ${filename}`;
      case "str_replace":
      case "insert":
        return isComplete ? `Edited ${filename}` : `Editing ${filename}`;
      case "view":
        return isComplete ? `Viewed ${filename}` : `Viewing ${filename}`;
    }
  }

  if (tool.toolName === "file_manager") {
    switch (command) {
      case "rename":
        return isComplete ? `Renamed ${filename}` : `Renaming ${filename}`;
      case "delete":
        return isComplete ? `Deleted ${filename}` : `Deleting ${filename}`;
    }
  }

  return isComplete ? `Ran ${tool.toolName}` : `Running ${tool.toolName}`;
}

export function ToolInvocationBadge({ toolInvocation }: ToolInvocationBadgeProps) {
  const label = getLabel(toolInvocation);
  const isComplete = toolInvocation.state === "result";

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isComplete ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
