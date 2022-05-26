import { useCallback, useEffect, useState } from "react";
import Papa from "papaparse";
import { Spinner } from "react-bootstrap";
import { Reference } from "./types/Reference";
import { GraphData, Link, Node } from "./types/GraphData";
import GraphVisual from "./components/GraphVisual";
import { Graph } from "./types/Graph";
import { TvShow } from "./types/TvShow";
import SidePanel from "./components/SidePanel";

const DEFAULT_NODE_SIZE = 1;
const BIG_NODE_SIZE = 10;

function App() {
  const [graph, setGraph] = useState<Graph | null>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [tvShowSelected, setTvShowSelected] = useState<TvShow | null>(null);

  useEffect(() => {
    function buildGraphFromReferences(references: Reference[]) {
      const tvShows = new Map<string, TvShow>();
      references.forEach(r => {
        // Cleanup some of the fields
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

      setGraph({ tvShows });
      setGraphData({ nodes, links });
    }

    const buildGraph = async () => {
      Papa.parse<Reference>("/references.csv", {
        download: true,
        header: true,
        complete: results => {
          buildGraphFromReferences(results.data);
        }
      });
    };
    buildGraph();
  }, []);

  const onNodeClick = useCallback(
    (title: string) => {
      setTvShowSelected(graph!.tvShows.get(title)!);
    },
    [tvShowSelected, graph]
  );

  const clearClick = useCallback(() => {
    setTvShowSelected(null);
  }, [tvShowSelected]);

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
            <SidePanel tvShow={tvShowSelected} />
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
            />
          </div>
        </>
      )}
    </div>
  );
}

export default App;
