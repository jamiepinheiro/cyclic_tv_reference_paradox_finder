import { ForceGraph3D } from "react-force-graph";
import "../css/background.css";
import { GraphData } from "../types/GraphData";

type Props = {
  graphData: GraphData;
};

function Background({ graphData }: Props) {
  return (
    <div className="background">
      <ForceGraph3D
        graphData={graphData}
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        onEngineTick={() => {
          console.log("ahe");
        }}
      ></ForceGraph3D>
    </div>
  );
}

export default Background;
