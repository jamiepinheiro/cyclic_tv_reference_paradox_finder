import { useCallback } from "react";
import { ForceGraph2D } from "react-force-graph";
import { GraphData } from "../types/GraphData";

type SelectedNode = {
  node: string;
  ancestors: Set<string>;
  descendants: Set<string>;
};

type SelectedCycle = {
  nodes: Set<string>;
  links: Set<string>; // Source + Target
};

type Props = {
  graphData: GraphData;
  onNodeClick: (id: string) => void;
  clearClick: () => void;
  selectedNode: SelectedNode | null;
  selectedCycle: SelectedCycle | null;
};

const NORMAL_LINK = "#CCCCCC";
const NORMAL_NODE = "225599";

const SELECTED_NODE = "RED";
const ANCESTORS = "BLUE";
const DESCENDANTS = "GREEN";

const CYCLE = "PURPLE";

function GraphVisual({
  graphData,
  onNodeClick,
  clearClick,
  selectedNode,
  selectedCycle
}: Props) {
  const paint = useCallback(
    (node: any, ctx: any) => {
      const fontSize = 3;
      ctx.font = `${fontSize}px Sans-Serif`;
      const textWidth = ctx.measureText(node.id).width;
      const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // some padding

      if (node.id === selectedNode?.node) {
        ctx.fillStyle = "rgba(200, 200, 200, 0.8)";
        ctx.fillRect(
          node.x - bckgDimensions[0] / 2,
          node.y - bckgDimensions[1] / 2 - fontSize,
          ...bckgDimensions
        );
      }
      ctx.fillStyle = "rgba(0, 0, 0, 1)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = node.color;
      ctx.fillText(node.id, node.x, node.y - fontSize);

      node.__bckgDimensions = bckgDimensions;
    },
    [selectedNode]
  );

  function linkInCycle(link: any) {
    if (selectedCycle?.links.has(link?.source?.id + link?.target?.id)) {
      return true;
    }
    return false;
  }

  function linkColor(link: any) {
    if (link?.source?.id === selectedNode?.node) {
      return DESCENDANTS;
    } else if (link?.target?.id === selectedNode?.node) {
      return ANCESTORS;
    } else if (linkInCycle(link)) {
      return CYCLE;
    }
    return NORMAL_LINK;
  }

  function nodeColor(node: any) {
    if (node.id === selectedNode?.node) {
      return SELECTED_NODE;
    } else if (selectedNode?.descendants.has(node.id)) {
      return DESCENDANTS;
    } else if (selectedNode?.ancestors.has(node.id)) {
      return ANCESTORS;
    } else if (selectedCycle?.nodes.has(node.id)) {
      return CYCLE;
    }
    return NORMAL_NODE;
  }

  return (
    <ForceGraph2D
      graphData={graphData}
      linkDirectionalArrowLength={4}
      linkDirectionalArrowRelPos={1}
      onNodeClick={(node, _) => {
        onNodeClick(node.id!.toString());
      }}
      onBackgroundClick={_ => clearClick()}
      linkColor={linkColor}
      linkWidth={link => (linkInCycle(link) ? 2 : 1)}
      linkDirectionalParticleWidth={link => (linkInCycle(link) ? 3 : 0)}
      linkDirectionalParticles={link => (linkInCycle(link) ? 4 : 0)}
      nodeVal={node => (node.id === selectedNode?.node ? 0.7 : 0.4)}
      nodeColor={nodeColor}
      nodeCanvasObjectMode={_ => "after"}
      nodeCanvasObject={paint}
      minZoom={3}
    ></ForceGraph2D>
  );
}

export default GraphVisual;
