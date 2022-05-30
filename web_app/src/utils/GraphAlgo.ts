import { TvShow } from "../types/TvShow";

/* Not optimal, doing N times the amount of work needed, but while N is small, this is fine.
   If this becomes slow, checkout https://stackoverflow.com/questions/546655/finding-all-cycles-in-a-directed-graph
 */
export function GetCycles(tvShows: Map<string, TvShow>) {
  const cycles: string[][] = [];
  const dedupCycles: string[] = [];

  function dfsForCycles(title: string, visited: string[]) {
    const referencesTo = Array.from(tvShows.get(title)!.referencesTo.keys());
    if (referencesTo.length === 0) {
      return;
    }

    referencesTo.forEach(referenceTitle => {
      const index = visited.findIndex(t => t === referenceTitle);
      if (index !== -1 && index !== 0) {
        return;
      }
      if (index === -1) {
        visited.push(referenceTitle);
        dfsForCycles(referenceTitle, visited);
      } else if (index === 0) {
        const path = visited.reduce((prev, curr) => prev + curr, "");
        const isDupe = dedupCycles.find(c => c.includes(path));
        if (isDupe) {
          return;
        }
        visited.push(referenceTitle);
        cycles.push([...visited]);

        // Concat the path twice to see if cycles are the same.
        // ie. 'BCAB' is in the same 'ABCA', so add 'ABCABC' to dedup cycles, 'BCA' will be a substring
        dedupCycles.push(path + path);
      }
      visited.pop();
    });
  }
  Array.from(tvShows.keys()).forEach(title => {
    dfsForCycles(title, [title]);
  });

  return cycles;
}
