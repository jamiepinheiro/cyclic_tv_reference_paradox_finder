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
import Help from "./components/Help";
import ReactGA from "react-ga";
import { GetCycles } from "./utils/GraphAlgo";
import { CleanupReference } from "./utils/References";
import MadeBy from "./components/MadeBy";
var mobile = require("is-mobile");

ReactGA.initialize("UA-152743685-1");
ReactGA.pageview(window.location.pathname + window.location.search);

function App() {
  const [graph, setGraph] = useState<Graph | null>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [tvShowSelected, setTvShowSelected] = useState<TvShow | null>(null);
  const [cycle, setCycle] = useState<string[] | null>(null);
  const [tab, setTab] = useState<string>(TvShowInspector.toString());

  useEffect(() => {
    function buildGraphFromReferences(references: Reference[]) {
      const tvShows = new Map<string, TvShow>();
      references.forEach(r => {
        CleanupReference(r);

        const shows: TvShow[] = [r.title, r.reference_title].map(title => {
          if (tvShows.has(title)) {
            return tvShows.get(title)!;
          } else {
            const tvShow: TvShow = tvShows.get(title) ?? {
              title,
              referencesTo: new Map(),
              referencedBy: new Map()
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

      const nodes: Node[] = Array.from(tvShows.values()).map(tvShow => {
        return { id: tvShow.title };
      });

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

      const cycles = GetCycles(tvShows);

      setGraph({ tvShows, cycles });
      setGraphData({ nodes, links });
    }

    const buildGraph = async () => {
      Papa.parse<Reference>(process.env.PUBLIC_URL + "/references.csv", {
        download: true,
        header: true,
        complete: references => {
          // Drop empty line at end
          references.data.pop();

          buildGraphFromReferences(references.data);
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
    [graph, tab]
  );

  const clearClick = () => {
    setTvShowSelected(null);
  };

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

  if (mobile()) {
    return (
      <div className="h-100 d-flex align-items-center justify-content-center">
        <p className="m-3 px-3">
          Unfortunately this site's content does not fit well on a mobile
          device, please view on a larger screen.
        </p>
      </div>
    );

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
                      node: tvShowSelected.title,
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
      <MadeBy />
    </div>
  );
}

export default App;
