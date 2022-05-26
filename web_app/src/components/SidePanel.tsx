import { Card, Tab, Tabs } from "react-bootstrap";
import { Graph } from "../types/Graph";
import { TvShow } from "../types/TvShow";
import CycleFinder from "./CycleFinder";
import TvShowInspector from "./TvShowInspector";

type Props = {
  tvShow: TvShow | null;
  unsetTvShow: () => void;
  graph: Graph;
  cycle: string[] | null;
  setCycle: (cycle: string[] | null) => void;
};

function SidePanel({ tvShow, unsetTvShow, graph, cycle, setCycle }: Props) {
  return (
    <Card id="side-panel" className="h-100 overflow-hidden">
      <Tabs
        onSelect={e => {
          if (e === TvShowInspector.toString()) {
            setCycle(null);
          } else if (e === CycleFinder.toString()) {
            unsetTvShow();
          }
        }}
        defaultActiveKey={TvShowInspector.toString()}
      >
        <Tab
          className="h-100 overflow-auto"
          eventKey={TvShowInspector.toString()}
          title="TV Show Inspector"
        >
          <TvShowInspector tvShow={tvShow} />
        </Tab>
        <Tab
          className="overflow-auto"
          eventKey={CycleFinder.toString()}
          title="Cyclic Reference Finder"
        >
          <CycleFinder graph={graph} cycle={cycle} setCycle={setCycle} />
        </Tab>
      </Tabs>
    </Card>
  );
}

export default SidePanel;
