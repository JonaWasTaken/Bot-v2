import { ownerOrAdmin, type RequestAuth } from "../request-auth.ts";
import { actionRequest, createRequest, type MissionControl } from "../missions/control.ts";
import { missionSummary } from "../missions/summary.ts";
import { PASS, type RouteHandler } from "./table.ts";

interface MissionRoutes {
  service: MissionControl;
  enabled(): boolean;
  live(auth: RequestAuth): boolean;
  hasProject(botId: string, projectId: string): boolean;
  hasBot(botId: string): boolean;
}

export function createMissionRoutes(deps: MissionRoutes): RouteHandler {
  return async ({ req, res, path, method, auth, json, readBody }) => {
    const match = /^\/api\/bots\/([\w-]+)\/missions(?:\/([a-f0-9-]{36})(?:\/(artifact|export|summary))?)?$/.exec(path);
    if (!match) return PASS;
    const allowed = () => deps.enabled() && ownerOrAdmin(auth) && deps.live(auth);
    if (!allowed()) return json(res, 403, { error: "Only the personal workspace owner can access missions." });
    const [, botId, id, file] = match;
    if (!deps.hasBot(botId!)) return json(res, 404, { error: "Bot not found." });
    const stillAllowed = () => allowed() && deps.hasBot(botId!);
    try {
      if (method === "GET") {
        if (!id) return json(res, 200, { missions: deps.service.list(botId!) });
        if (!file) return json(res, 200, deps.service.get(botId!, id));
        const text = file === "summary" ? missionSummary(deps.service.get(botId!, id)) : await deps.service.artifact(botId!, id);
        if (!stillAllowed()) return json(res, 403, { error: "Access to this mission ended." });
        if (file === "artifact") return json(res, 200, { text });
        res.writeHead(200, { "content-type": "text/markdown; charset=utf-8", "content-disposition": file === "summary" ? 'attachment; filename="mission.md"' : 'attachment; filename="report.md"',
          "cache-control": "no-store", "x-content-type-options": "nosniff" });
        res.end(text);
        return;
      }
      if (method !== "POST" || file) return json(res, 405, { error: "Unsupported mission action." });
      const input = await readBody(req, 8192);
      if (!stillAllowed()) return json(res, 403, { error: "Access to this mission ended." });
      if (id) {
        const parsed = actionRequest.safeParse(input);
        if (!parsed.success) return json(res, 400, { error: "Invalid mission action." });
        return json(res, 200, deps.service.command(botId!, id, parsed.data));
      }
      const parsed = createRequest.safeParse(input);
      if (!parsed.success) return json(res, 400, { error: "Invalid mission objective, shortlist or limits." });
      if (parsed.data.projectId && !deps.hasProject(botId!, parsed.data.projectId)) return json(res, 404, { error: "Project not found." });
      return json(res, 201, deps.service.create(botId!, parsed.data));
    } catch (cause) {
      const status = (cause as { status?: number })?.status;
      if (status && [400, 403, 404, 409, 413].includes(status)) return json(res, status, { error: cause instanceof Error ? cause.message : "Mission request refused." });
      return json(res, 503, { error: "The mission record or artifact is unavailable. Refresh and try again." });
    }
  };
}
