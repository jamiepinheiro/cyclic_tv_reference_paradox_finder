import "./css/app.css";
import { useEffect, useRef, useState } from "react";
import Papa from "papaparse";
import { Spinner } from "react-bootstrap";
import { ForceGraph3D } from "react-force-graph";
import { Reference } from "./types/Reference";
import { GraphData, Link, Node } from "./types/GraphData";

function App() {
  const [graphData, setGraphData] = useState<GraphData | null>(null);

  useEffect(() => {
    const getReferences = async () => {
      Papa.parse<Reference>("/references.csv", {
        download: true,
        header: true,
        complete: results => {
          const references = new Map<[string, string], Reference[]>();
          const tv_shows = new Set<string>();
          results.data.forEach(r => {
            tv_shows.add(r.title);
            tv_shows.add(r.reference_title);
            const key: [string, string] = [r.title, r.reference_title];
            references.set(key, [...(references.get(key) ?? []), ...[r]]);
          });

          const nodes: Node[] = Array.from(tv_shows).map(name => {
            return { id: name, name };
          });

          const links: Link[] = Array.from(references).map(
            ([nodes, references]) => {
              return {
                source: nodes[0],
                target: nodes[1],
                references
              };
            }
          );
          setGraphData({ nodes, links });
        }
      });
    };
    getReferences();
  }, []);

  return (
    <div className="h-100 d-flex align-items-center justify-content-center">
      {!graphData ? (
        <div className="text-center">
          <Spinner animation="border" />
          <p className="m-3">Loading references</p>
        </div>
      ) : (
        <div className="background">
          <ForceGraph3D
            graphData={graphData}
            linkDirectionalArrowLength={3.5}
            linkDirectionalArrowRelPos={1}
          ></ForceGraph3D>
        </div>
      )}
    </div>
  );
}

export default App;
