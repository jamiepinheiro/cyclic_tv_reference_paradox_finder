import { useCallback, useEffect, useRef } from "react";
import { ForceGraph2D } from "react-force-graph";
import { GraphData } from "../types/GraphData";
import { BLUE, GREEN, GREY, NAVY, ORANGE, RED, WHITE } from "../utils/Colors";

type SelectedNode = {
  node: string;
  ancestors: Set<string>;
  descendants: Set<string>;
};

type SelectedCycle = {
  nodes: Set<string>;
  links: Map<string, number>; // Source + Target => How many particles emitted
};

type Props = {
  graphData: GraphData;
  onNodeClick: (id: string) => void;
  clearClick: () => void;
  selectedNode: SelectedNode | null;
  selectedCycle: SelectedCycle | null;
};

function GraphVisual({
  graphData,
  onNodeClick,
  clearClick,
  selectedNode,
  selectedCycle
}: Props) {
  const paint = useCallback(
    (node: any, ctx: any) => {
      const isSelectedNode = node.id === selectedNode?.node;
      const fontSize = isSelectedNode ? 4 : 3;
      ctx.font = `${fontSize}px Sans-Serif`;
      const textWidth = ctx.measureText(node.id).idth;
      const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // some padding

      if (isSelectedNode) {
        ctx.fillStyle = "rgba(200, 200, 200, 0.8)";
        ctx.fillRect(
          node.x - bckgDimensions[0] / 2,
          node.y - bckgDimensions[1] / 2 - fontSize * 1.5,
          ...bckgDimensions
        );
      }
      ctx.fillStyle = isSelectedNode ? RED : NAVY;
      ctx.fillStyle = "rgba(0, 0, 0, 1)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(node.id, node.x, node.y - fontSize * 1.5);

      node.__bckgDimensions = bckgDimensions;
    },
    [selectedNode]
  );

  function linkInCycle(link: any) {
    const key = link?.source?.id + link?.target?.id;
    return selectedCycle?.links.get(key);
  }

  function linkColor(link: any) {
    if (link?.source?.id === selectedNode?.node) {
      return GREEN;
    } else if (link?.target?.id === selectedNode?.node) {
      return ORANGE;
    } else if (linkInCycle(link)) {
      return BLUE;
    }
    return GREY;
  }

  function nodeColor(node: any) {
    if (node.id === selectedNode?.node) {
      return RED;
    } else if (selectedNode?.descendants.has(node.id)) {
      return GREEN;
    } else if (selectedNode?.ancestors.has(node.id)) {
      return ORANGE;
    } else if (selectedCycle?.nodes.has(node.id)) {
      return BLUE;
    }
    return NAVY;
  }

  const graph = useRef<any>();
  useEffect(() => {
    if (graph.current) {
      graph.current.zoom(4);
    }
  }, [graph]);

  useEffect(() => {
    if (graph.current) {
      if (selectedNode || selectedCycle) {
        graph.current.zoomToFit(
          500,
          150,
          (n: any) =>
            selectedNode?.node === n.id ||
            selectedNode?.ancestors.has(n.id) ||
            selectedNode?.descendants.has(n.id) ||
            selectedCycle?.nodes.has(n.id)
        );
      } else {
        graph.current.zoomToFit(500, -300, (n: any) => n.x && n.y);
      }
    }
  }, [graph, selectedNode, selectedCycle]);

  return (
    <ForceGraph2D
      ref={graph}
      graphData={graphData}
      linkDirectionalArrowLength={4}
      linkDirectionalArrowRelPos={1}
      onNodeClick={(node, _) => {
        onNodeClick(node.id!.toString());
      }}
      onBackgroundClick={_ => clearClick()}
      linkColor={linkColor}
      linkWidth={link => (linkInCycle(link) ? 3 : 1)}
      linkDirectionalParticleWidth={link => (linkInCycle(link) ? 4 : 0)}
      linkDirectionalParticles={link => linkInCycle(link) ?? 0}
      nodeVal={node => (node.id === selectedNode?.node ? 0.6 : 0.3)}
      nodeColor={nodeColor}
      nodeCanvasObjectMode={_ => "after"}
      nodeCanvasObject={paint}
      backgroundColor={WHITE}
      minZoom={1}
      maxZoom={10}
    ></ForceGraph2D>
  );
}

export default GraphVisual;
