import { Card, Tab, Tabs } from "react-bootstrap";
import { Graph } from "../types/Graph";
import { TvShow } from "../types/TvShow";
import CycleFinder from "./CycleFinder";
import TvShowInspector from "./TvShowInspector";

type Props = {
  tvShow: TvShow | null;
  graph: Graph;
  cycle: string[] | null;
  setCycle: (cycle: string[] | null) => void;
  setTab: (tab: string) => void;
};

function SidePanel({ tvShow, graph, cycle, setCycle, setTab }: Props) {
  return (
    <Card id="side-panel" className="h-100 overflow-hidden">
      <Tabs
        onSelect={e => {
          if (e) {
            setTab(e);
          }
        }}
        defaultActiveKey={TvShowInspector.toString()}
      >
        <Tab
          className="h-100 overflow-hidden"
          eventKey={TvShowInspector.toString()}
          title="TV Show Inspector"
        >
          <TvShowInspector tvShow={tvShow} />
        </Tab>
        <Tab
          className="h-100 overflow-auto"
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
