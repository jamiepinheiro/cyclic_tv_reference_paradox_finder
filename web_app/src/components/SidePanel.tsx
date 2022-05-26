import { Card, Tab, Tabs } from "react-bootstrap";
import { TvShow } from "../types/TvShow";
import TvShowInspector from "./TvShowInspector";

type Props = {
  tvShow: TvShow | null;
};

function SidePanel({ tvShow }: Props) {
  return (
    <Card id="side-panel" className="h-100 overflow-hidden">
      <Tabs defaultActiveKey="1">
        <Tab
          className="h-100 overflow-auto"
          eventKey="1"
          title="TV Show Inspector"
        >
          <TvShowInspector tvShow={tvShow} />
        </Tab>
        <Tab
          className="overflow-auto"
          eventKey="2"
          title="Cyclic Reference Finder"
        >
          <p>asldfjsdlkj</p>
        </Tab>
      </Tabs>
    </Card>
  );
}

export default SidePanel;
