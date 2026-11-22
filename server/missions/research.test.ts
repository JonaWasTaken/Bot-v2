import { expect, it, vi } from "vitest";
import { comparisonReport, readPackage, registrySource, verifyReport } from "./research.ts";
import type { PackageObservation } from "../../shared/mission.ts";

const signal = new AbortController().signal;
const url = registrySource("x", "1.0.0");
function reader(extra: object = {}, source = url) {
  return vi.fn(async () => ({ ok: true as const, headers: {}, url: new URL(source), body: Buffer.from(JSON.stringify({
    name: "x", version: "1.0.0", license: "MIT", dist: { unpackedSize: 17 }, ...extra })) }));
}
it("pins host, version, identity, size, redirect policy and TS evidence before trusting registry metadata", async () => {
  const fetch = reader({ dependencies: { a: "1" }, optionalDependencies: { a: "1", b: "2" }, exports: { ".": { types: "./index.d.ts" } } });
  const facts = await readPackage("x", "1.0.0", signal, fetch);
  expect(fetch).toHaveBeenCalledWith(url, expect.objectContaining({ maxRedirects: 0, signal, maxBytes: 256 * 1024 }));
  expect(facts).toMatchObject({ types: true, dependencies: 2, bytes: 17 });
  for (const data of [{ name: "y" }, { version: "2.0.0" }, { version: "1.0.0\n[click](https://evil.test)" }])
    await expect(readPackage("x", "1.0.0", signal, reader(data))).rejects.toThrow();
  await expect(readPackage("x", "1.0.0", signal, reader({}, "https://example.org/"))).rejects.toThrow();
  const unopened = reader();
  await expect(readPackage("../x", "latest", signal, unopened)).rejects.toThrow();
  expect(unopened).not.toHaveBeenCalled();
});
it("keeps ties, excludes unknown licenses, distinguishes missing sizes and refuses guessed or altered reports", () => {
  const fact = (name: string): PackageObservation => ({ name, source: registrySource(name, "1.0.0"), version: "1.0.0",
    readAt: 1234567, types: true, bytes: 100, license: "MIT", dependencies: 0 });
  const facts = [fact("a"), fact("b"), { ...fact("c"), bytes: null, license: "Unknown" }];
  const plan = { packages: ["a", "b", "c"], metric: "size" as const };
  const report = comparisonReport(plan, facts);
  expect(report).toContain("**a** and **b** tie");
  expect(report).toContain("Unknown");
  expect(() => comparisonReport(plan, facts.slice(1))).toThrow();
  expect(() => comparisonReport(plan, facts.map(f => ({ ...f, types: false })))).toThrow();
  expect(() => verifyReport(Buffer.from(report.replace(facts[1]!.source, "elsewhere")), report, facts)).toThrow();
  expect(() => verifyReport(Buffer.from("all passed"), "all passed", facts)).toThrow();
});
