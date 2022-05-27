import { useCallback, useEffect, useState } from "react";
import Papa from "papaparse";
import { Spinner } from "react-bootstrap";
import { Reference } from "./types/Reference";
import { GraphData, Link, Node } from "./types/GraphData";
import GraphVisual from "./components/GraphVisual";
import { Graph } from "./types/Graph";
import { TvShow } from "./types/TvShow";
import SidePanel from "./components/SidePanel";
import TvShowInspector from "./components/TvShowInspector";
import CycleFinder from "./components/CycleFinder";
import { NAVY } from "./utils/Colors";
import Help from "./components/Help";
import ReactGA from "react-ga";

ReactGA.initialize("UA-152743685-1");
ReactGA.pageview(window.location.pathname + window.location.search);

const DEFAULT_NODE_SIZE = 1;
const BIG_NODE_SIZE = 10;

function App() {
  const [graph, setGraph] = useState<Graph | null>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [tvShowSelected, setTvShowSelected] = useState<TvShow | null>(null);
  const [cycle, setCycle] = useState<string[] | null>(null);
  const [tab, setTab] = useState<string>(TvShowInspector.toString());

  useEffect(() => {
    function buildGraphFromReferences(references: Reference[]) {
      function cleanupReference(r: Reference) {
        const div = document.createElement("div");
        div.innerHTML = r.text;
        r.text = div.textContent || div.innerText || "";
        r.start_time = r.start_time
          ?.split(",")[0]
          .split(":")
          .map(n =>
            parseInt(n).toLocaleString("en-US", {
              minimumIntegerDigits: 2
            })
          )
          .reduce((prev, curr) => prev + (prev != "" ? ":" : "") + curr, "");
      }

      // Not optimal, doing N times the amount of work needed, but while N is small, this is fine.
      // If this becomes slow, checkout https://stackoverflow.com/questions/546655/finding-all-cycles-in-a-directed-graph
      function getCycles(tvShows: Map<string, TvShow>) {
        const cycles: string[][] = [];
        const dedupCycles: string[] = [];

        function dfsForCycles(title: string, visited: string[]) {
          const referencesTo = Array.from(
            tvShows.get(title)!.referencesTo.keys()
          );
          if (referencesTo.length == 0) {
            return;
          }

          referencesTo.forEach(referenceTitle => {
            const index = visited.findIndex(t => t === referenceTitle);
            if (index != -1 && index != 0) {
              return;
            }
            if (index == -1) {
              visited.push(referenceTitle);
              dfsForCycles(referenceTitle, visited);
            } else if (index == 0) {
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

      const tvShows = new Map<string, TvShow>();
      references.forEach(r => {
        cleanupReference(r);

        const shows: TvShow[] = [r.title, r.reference_title].map(title => {
          if (tvShows.has(title)) {
            return tvShows.get(title)!;
          } else {
            const tvShow: TvShow = tvShows.get(title) ?? {
              title,
              referencesTo: new Map(),
              referencedBy: new Map(),
              node: {
                id: title
              }
            };
            tvShows.set(title, tvShow);
            return tvShow;
          }
        });

        const refereeTvShow = shows[0];
        const referenceTvShow = shows[1];

        if (!refereeTvShow.referencesTo.has(r.reference_title)) {
          refereeTvShow.referencesTo.set(r.reference_title, []);
        }
        refereeTvShow.referencesTo.get(r.reference_title)!.push(r);

        if (!referenceTvShow.referencedBy.has(r.title)) {
          referenceTvShow.referencedBy.set(r.title, []);
        }
        referenceTvShow.referencedBy.get(r.title)!.push(r);
      });

      const nodes: Node[] = Array.from(tvShows.values()).map(
        tvShow => tvShow.node
      );

      const links: Link[] = [];
      Array.from(tvShows.values()).forEach(tvShow => {
        Array.from(tvShow.referencesTo.keys()).forEach(
          (referenceTvShowTitle: string) => {
            links.push({
              source: tvShow.title,
              target: referenceTvShowTitle
            });
          }
        );
      });

      const cycles = getCycles(tvShows);

      setGraph({ tvShows, cycles });
      setGraphData({ nodes, links });
    }

    const buildGraph = async () => {
      Papa.parse<Reference>("/references.csv", {
        download: true,
        header: true,
        complete: results => {
          // Drop empty line at end
          results.data.pop();

          buildGraphFromReferences(results.data);
        }
      });
    };
    buildGraph();
  }, []);

  const onNodeClick = useCallback(
    (title: string) => {
      if (tab === TvShowInspector.toString()) {
        setTvShowSelected(graph!.tvShows.get(title)!);
      }
    },
    [tvShowSelected, graph, tab]
  );

  const clearClick = useCallback(() => {
    setTvShowSelected(null);
  }, [tvShowSelected]);

  useEffect(() => {
    setTvShowSelected(null);
  }, [cycle, tab]);

  useEffect(() => {
    if (tab === TvShowInspector.toString()) {
      setCycle(null);
    } else if (tab === CycleFinder.toString()) {
      setTvShowSelected(null);
    }
  }, [tab]);

  return (
    <div className="h-100 d-flex align-items-center justify-content-center">
      {!graph || !graphData ? (
        <div className="text-center">
          <Spinner animation="border" />
          <p className="m-3">Loading references</p>
        </div>
      ) : (
        <>
          <div className="foreground">
            <SidePanel
              tvShow={tvShowSelected}
              cycle={cycle}
              setCycle={setCycle}
              graph={graph}
              setTab={setTab}
            />
          </div>
          <div className="background">
            <GraphVisual
              graphData={graphData}
              onNodeClick={onNodeClick}
              clearClick={clearClick}
              selectedNode={
                !tvShowSelected
                  ? null
                  : {
                      node: tvShowSelected.node.id,
                      ancestors: new Set(tvShowSelected.referencedBy.keys()),
                      descendants: new Set(tvShowSelected.referencesTo.keys())
                    }
              }
              selectedCycle={
                !cycle
                  ? null
                  : {
                      nodes: new Set(cycle),
                      links: new Map(
                        cycle.map((title, i) => {
                          const nextShow = cycle[(i + 1) % cycle.length];
                          return [
                            title + nextShow,
                            (graph.tvShows
                              .get(title)
                              ?.referencesTo.get(nextShow)?.length ?? 0) * 2
                          ];
                        })
                      )
                    }
              }
            />
          </div>
          <Help />
        </>
      )}
      <div id="madeBy" className="opacity-50">
        <div className="float-end px-2" style={{ backgroundColor: NAVY }}>
          <small className="text-light text-end">
            Made by{" "}
            <a id="link" target="_blank" href="https://jamiepinheiro.com">
              Jamie Pinheiro
            </a>
          </small>
        </div>
      </div>
    </div>
  );
}

export default App;
