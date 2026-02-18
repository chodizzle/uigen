import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge } from "../ToolInvocationBadge";

afterEach(() => {
  cleanup();
});

test("shows 'Created filename' for str_replace_editor create when complete", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "1",
        toolName: "str_replace_editor",
        state: "result",
        args: { command: "create", path: "/src/App.tsx" },
        result: "Success",
      }}
    />
  );
  expect(screen.getByText("Created App.tsx")).toBeDefined();
});

test("shows 'Creating filename' for str_replace_editor create when in-progress", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "1",
        toolName: "str_replace_editor",
        state: "call",
        args: { command: "create", path: "/src/App.tsx" },
      }}
    />
  );
  expect(screen.getByText("Creating App.tsx")).toBeDefined();
});

test("shows 'Edited filename' for str_replace_editor str_replace when complete", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "1",
        toolName: "str_replace_editor",
        state: "result",
        args: { command: "str_replace", path: "/src/components/Button.tsx" },
        result: "Success",
      }}
    />
  );
  expect(screen.getByText("Edited Button.tsx")).toBeDefined();
});

test("shows 'Editing filename' for str_replace_editor insert when in-progress", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "1",
        toolName: "str_replace_editor",
        state: "partial-call",
        args: { command: "insert", path: "/src/utils.ts" },
      }}
    />
  );
  expect(screen.getByText("Editing utils.ts")).toBeDefined();
});

test("shows 'Deleted filename' for file_manager delete when complete", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "1",
        toolName: "file_manager",
        state: "result",
        args: { command: "delete", path: "/src/old.tsx" },
        result: "Deleted",
      }}
    />
  );
  expect(screen.getByText("Deleted old.tsx")).toBeDefined();
});

test("shows 'Deleting filename' for file_manager delete when in-progress", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "1",
        toolName: "file_manager",
        state: "call",
        args: { command: "delete", path: "/src/old.tsx" },
      }}
    />
  );
  expect(screen.getByText("Deleting old.tsx")).toBeDefined();
});

test("shows 'Ran toolName' for unknown tool when complete", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "1",
        toolName: "some_unknown_tool",
        state: "result",
        args: {},
        result: "done",
      }}
    />
  );
  expect(screen.getByText("Ran some_unknown_tool")).toBeDefined();
});

test("shows 'Running toolName' for unknown tool when in-progress", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "1",
        toolName: "some_unknown_tool",
        state: "call",
        args: {},
      }}
    />
  );
  expect(screen.getByText("Running some_unknown_tool")).toBeDefined();
});

test("extracts basename from full path", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        toolCallId: "1",
        toolName: "str_replace_editor",
        state: "result",
        args: { command: "create", path: "/deeply/nested/path/Component.tsx" },
        result: "Success",
      }}
    />
  );
  expect(screen.getByText("Created Component.tsx")).toBeDefined();
});
