// @vitest-environment happy-dom
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { expect, it, vi } from "vitest";
import { publishLiveFrame, publishMissedFrames } from "@/lib/live-events";
import type { Bot } from "@/state/store";
import { MissionControl } from "./MissionControl";

const data = vi.hoisted(() => ({ name: "Reviewed comparison", state: "planning", calls: 0 }));
vi.mock("@/state/store-select", () => ({ useStoreSelector: () => [{ id: "lead", name: "Research" }] }));
vi.mock("@/state/api", () => ({ api: async (path: string) => {
  data.calls++;
  const m = { id: "study", name: data.name, state: data.state, botId: "lead", objective: "Compare packages", version: 1,
    actions: data.state === "review" ? ["start"] : [], steps: [], usage: { modelCalls: 1, toolCalls: 0 }, history: [],
    activity: [], limits: { toolCalls: 8 }, plan: { packages: ["zod"], metric: "dependencies" } };
  return path.endsWith("/missions") ? { missions: [m] } : m;
} }));

it("renders live mission events and refreshes a missed cursor through the shared event transport", async () => {
  const host = document.body.appendChild(document.createElement("div")), root = createRoot(host);
  try {
    flushSync(() => root.render(createElement(MissionControl, { bot: { id: "lead", name: "Research" } as Bot, onClose: () => {} })));
    const start = () => [...host.querySelectorAll("button")].find(b => b.textContent === "Approve and start");
    await vi.waitFor(() => expect(start()?.disabled).toBe(true));
    data.state = "review"; publishLiveFrame({ kind: "mission.changed", botId: "lead" });
    await vi.waitFor(() => expect(start()?.disabled).toBe(false));
    const before = data.calls;
    publishLiveFrame({ kind: "mission.changed", botId: "another" });
    await new Promise(r => setTimeout(r, 105));
    expect(data.calls).toBe(before);
    data.state = "completed"; publishLiveFrame({ kind: "mission.changed", botId: "lead" });
    await vi.waitFor(() => expect(host.textContent).toContain("Completed"));
    expect(host.textContent).not.toContain("Approve and start");
    data.name = "Recovered after reconnect"; publishMissedFrames();
    await vi.waitFor(() => expect(host.textContent).toContain(data.name));
  } finally { flushSync(() => root.unmount()); host.remove(); }
});
