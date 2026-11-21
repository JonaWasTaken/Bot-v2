import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";

export function localModelOptions(extra = {}) {
  const { values } = parseArgs({ options: {
    endpoint: { type: "string" },
    model: { type: "string" },
    repeats: { type: "string", default: "3" },
    ...extra,
  } });
  if (!values.endpoint || !values.model?.trim()) throw new Error("Supply --endpoint http://127.0.0.1:PORT/v1 and --model MODEL.");
  const endpoint = new URL(values.endpoint);
  if (endpoint.protocol !== "http:" || endpoint.hostname !== "127.0.0.1" || endpoint.username || endpoint.password ||
      endpoint.pathname !== "/v1" || endpoint.search || endpoint.hash) throw new Error("Use a local /v1 endpoint.");
  const repeats = Number(values.repeats);
  if (!Number.isInteger(repeats) || repeats < 1 || repeats > 10) throw new Error("--repeats must be between 1 and 10.");
  const revision = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  return { ...values, endpoint: endpoint.href, repeats, revision };
}

export async function launchLocalModelFixture({ endpoint, model }) {
  const { launchVerificationServer, runControlOmb } = await import(pathToFileURL(resolve("scripts/control-omb.ts")).href);
  const fixture = await launchVerificationServer();
  const { url, dataDir } = fixture.info;
  const api = async (method, path, body) => {
    const response = await fetch(url + path, {
      method, headers: { "content-type": "application/json", origin: url },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) throw new Error(`${method} ${path} returned ${response.status}`);
    return response.json();
  };
  try {
    await api("PATCH", "/api/config", { openaiCompat: { key: "local-fixture", url: endpoint, model } });
    await api("POST", "/api/instances/openaiCompat/refresh-models", {});
    return { dataDir, api, control: (...args) => runControlOmb([...args, "--url", url]), close: () => fixture.close() };
  } catch (error) {
    await fixture.close();
    throw error;
  }
}
