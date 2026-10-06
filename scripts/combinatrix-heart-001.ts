import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import {
  executeCombinatrix,
  type AddressableGapV01,
  type CandidatePolicyV01,
  type ProposalFragmentV01,
} from "../src/combinatrix.js";
import type { BraidV01 } from "../src/model.js";
import type { PresentRouteSelectionV01 } from "../src/spine-boundary.js";

interface Fixture {
  braid: BraidV01;
  gaps: AddressableGapV01[];
  fragments: ProposalFragmentV01[];
  policies: CandidatePolicyV01[];
  selection: PresentRouteSelectionV01;
  warrantRefs: string[];
  descendantId: string;
}

export function replayHeart001(input: Fixture) {
  return executeCombinatrix(input);
}

function runCli(): void {
  const fixture = JSON.parse(
    readFileSync(new URL("../fixtures/combinatrix-heart-001.json", import.meta.url), "utf8")
  ) as Fixture;
  const result = replayHeart001(fixture);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : undefined;
if (invokedPath && fileURLToPath(import.meta.url) === invokedPath) {
  runCli();
}
