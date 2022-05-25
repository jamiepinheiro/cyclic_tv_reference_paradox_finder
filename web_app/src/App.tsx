import { useEffect, useState } from "react";
import Papa from "papaparse";
import { Spinner } from "react-bootstrap";
import { Reference } from "./types/Reference";
import { GraphData, Link, Node } from "./types/GraphData";
import Background from "./components/Background";
import { Graph } from "./types/Graph";
import { TvShow } from "./types/TvShow";

function App() {
  const [graph, setGraph] = useState<Graph | null>(null);

  useEffect(() => {
    function buildGraphFromReferences(references: Reference[]) {
      const graph = { tvShows: new Map() };
      references.forEach(r => {
        const tvShows: TvShow[] = [r.title, r.reference_title].map(title => {
          if (graph.tvShows.has(title)) {
            return graph.tvShows.get(title);
          } else {
            const tvShow = graph.tvShows.get(title) ?? {
              title,
              referencesTo: new Map(),
              referencedBy: new Map()
            };
            graph.tvShows.set(title, tvShow);
            return tvShow;
          }
        });

        const refereeTvShow = tvShows[0];
        const referenceTvShow = tvShows[1];
        console.log(refereeTvShow);

        if (!refereeTvShow.referencesTo.has(r.reference_title)) {
          refereeTvShow.referencesTo.set(r.reference_title, []);
        }
        refereeTvShow.referencesTo.get(r.reference_title)!.push(r);

        if (!referenceTvShow.referencedBy.has(r.title)) {
          referenceTvShow.referencedBy.set(r.title, []);
        }
        referenceTvShow.referencedBy.get(r.title)!.push(r);
      });
      return graph;
    }

    const buildGraph = async () => {
      Papa.parse<Reference>("/references.csv", {
        download: true,
        header: true,
        complete: results => {
          const graph = buildGraphFromReferences(results.data);
          setGraph(graph);
        }
      });
    };
    buildGraph();
  }, []);

  function getGraphData(graph: Graph) {
    const nodes: Node[] = Array.from(graph.tvShows.keys()).map(title => {
      return { id: title, name: title };
    });

    const links: Link[] = [];

    Array.from(graph.tvShows.values()).forEach(tvShow => {
      Array.from(tvShow.referencesTo.keys()).forEach(referenceTvShowTitle => {
        links.push({
          source: tvShow.title,
          target: referenceTvShowTitle
        });
      });
    });

    return { nodes, links };
  }

  return (
    <div className="h-100 d-flex align-items-center justify-content-center">
      {!graph ? (
        <div className="text-center">
          <Spinner animation="border" />
          <p className="m-3">Loading references</p>
        </div>
      ) : (
        <Background graphData={getGraphData(graph)} />
      )}
    </div>
  );
}

export default App;
