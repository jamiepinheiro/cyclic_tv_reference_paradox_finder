import { useCallback } from "react";
import { ForceGraph2D } from "react-force-graph";
import { GraphData } from "../types/GraphData";

type SelectedNode = {
  node: string;
  ancestors: Set<string>;
  descendants: Set<string>;
};

type Props = {
  graphData: GraphData;
  onNodeClick: (id: string) => void;
  clearClick: () => void;
  selectedNode: SelectedNode | null;
};

const NORMAL_LINK = "#CCCCCC";
const NORMAL_NODE = "225599";

const SELECTED_NODE = "RED";
const ANCESTORS = "BLUE";
const DESCENDANTS = "GREEN";

function GraphVisual({
  graphData,
  onNodeClick,
  clearClick,
  selectedNode
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

  function linkColor(link: any) {
    if (!selectedNode) {
      return NORMAL_LINK;
    } else if (link?.source?.id === selectedNode.node) {
      return DESCENDANTS;
    } else if (link?.target?.id === selectedNode.node) {
      return ANCESTORS;
    }
    return NORMAL_LINK;
  }

  function nodeColor(node: any) {
    if (!selectedNode) {
      return NORMAL_NODE;
    } else if (node.id === selectedNode.node) {
      return SELECTED_NODE;
    } else if (selectedNode.descendants.has(node.id)) {
      return DESCENDANTS;
    } else if (selectedNode.ancestors.has(node.id)) {
      return ANCESTORS;
    }
    return NORMAL_NODE;
  }

  return (
    <ForceGraph2D
      graphData={graphData}
      linkDirectionalArrowLength={2}
      linkDirectionalArrowRelPos={1}
      onNodeClick={(node, _) => {
        onNodeClick(node.id!.toString());
      }}
      onBackgroundClick={_ => clearClick()}
      linkColor={linkColor}
      nodeVal={node => (node.id === selectedNode?.node ? 0.7 : 0.4)}
      nodeColor={nodeColor}
      nodeCanvasObjectMode={_ => "after"}
      nodeCanvasObject={paint}
      minZoom={3}
    ></ForceGraph2D>
  );
}

export default GraphVisual;
