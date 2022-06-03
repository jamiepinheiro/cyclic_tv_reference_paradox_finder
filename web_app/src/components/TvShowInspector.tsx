import "../css/index.css";
import {
  Accordion,
  Badge,
  Button,
  Card,
  ListGroup,
  Tab,
  Tabs
} from "react-bootstrap";
import { TvShow } from "../types/TvShow";
import { Reference } from "../types/Reference";
import { useEffect, useState } from "react";

type Props = {
  tvShow: TvShow | null;
  setTvShow: (tvShow: TvShow | null) => void;
  tvShowOptions: TvShow[];
};

function TvShowInspector({ tvShow, setTvShow, tvShowOptions }: Props) {
  const [activeKey, setActiveKey] = useState(
    !tvShow ? "By" : tvShow.referencedBy.size > 0 ? "By" : "To"
  );

  useEffect(() => {
    setActiveKey(!tvShow ? "By" : tvShow.referencedBy.size > 0 ? "By" : "To");
  }, [tvShow]);

  if (!tvShow) {
    return (
      <div className="p-3">
        <h5>Select a TV show</h5>
        <p>
          Inspect a TV Show's references by clicking on a node in the graph or
          selecting one below.
        </p>
        <ListGroup>
          {tvShowOptions.map(tvShowOption => (
            <ListGroup.Item
              key={tvShowOption.title}
              onClick={() => setTvShow(tvShowOption)}
              className="d-flex justify-content-between align-items-start"
              action
            >
              <div>{tvShowOption.title}</div>
              <Badge bg="info" pill>
                {tvShowOption.referencedBy.size}
                {" | "}
                {tvShowOption.referencesTo.size}
              </Badge>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </div>
    );
  }
  const showsReferencedIn = Array.from(tvShow.referencedBy.keys()).length;
  const timesReferencedInOtherShows = Array.from(tvShow.referencedBy.values())
    .map(r => r.length)
    .reduce((prev, curr) => prev + curr, 0);
  const showsReferencedTo = Array.from(tvShow.referencesTo.keys()).length;
  const timesReferencedToOtherShows = Array.from(tvShow.referencesTo.values())
    .map(r => r.length)
    .reduce((prev, curr) => prev + curr, 0);

  function References(references: Map<string, Reference[]>) {
    return (
      <Accordion defaultActiveKey={["0"]}>
        {Array.from(references).map(([title, showReferences], i) => (
          <Accordion.Item key={i} eventKey={i.toString()}>
            <Accordion.Header as="slot">
              {title}
              <small className="px-1 text-muted">
                ({showReferences.length})
              </small>
            </Accordion.Header>

            <Accordion.Body className="p-1">
              <ListGroup variant="flush">
                {Array.from(showReferences).map((reference, i) => (
                  <ListGroup.Item key={i} className="py-1 px-2">
                    <div>
                      <small className="text-muted">
                        <code>
                          {reference.season}
                          {reference.episode}{" "}
                        </code>
                        {reference.start_time}
                        <br></br>
                      </small>
                    </div>
                    <small>{reference.text}</small>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>
    );
  }

  return (
    <div className="p-3">
      <Button
        className="mb-3"
        variant="secondary"
        onClick={() => setTvShow(null)}
      >
        Back
      </Button>
      <h5>{tvShow.title}</h5>
      <ListGroup className="my-3">
        <ListGroup.Item>
          Referenced <b>{timesReferencedInOtherShows}</b> times across{" "}
          <b>{showsReferencedIn}</b> shows
        </ListGroup.Item>
        <ListGroup.Item>
          References <b>{showsReferencedTo}</b> shows a total of{" "}
          <b>{timesReferencedToOtherShows}</b> times
        </ListGroup.Item>
      </ListGroup>

      <Card id="panel" className="p-2">
        <Tabs
          activeKey={activeKey}
          onSelect={e => {
            if (e) {
              setActiveKey(e);
            }
          }}
          variant="pills"
          className="mb-2 pb-1"
        >
          <Tab
            eventKey={"By"}
            title="Referenced By"
            disabled={tvShow.referencedBy.size === 0}
          >
            {References(tvShow.referencedBy)}
          </Tab>
          <Tab
            eventKey={"To"}
            title="References To"
            disabled={tvShow.referencesTo.size === 0}
          >
            {References(tvShow.referencesTo)}
          </Tab>
        </Tabs>
      </Card>
    </div>
  );
}

export default TvShowInspector;
