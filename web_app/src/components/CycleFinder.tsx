import { useState } from "react";
import {
  Badge,
  Button,
  Carousel,
  ListGroup,
  ListGroupItem
} from "react-bootstrap";
import { Graph } from "../types/Graph";
import { Reference } from "../types/Reference";
import { BsFillArrowDownCircleFill } from "react-icons/bs";

type Props = {
  graph: Graph;
  cycle: string[] | null;
  setCycle: (cycle: string[] | null) => void;
};

function CycleFinder({ graph, cycle, setCycle }: Props) {
  function SelectCycle() {
    return (
      <ListGroup className="p-3">
        {graph.cycles.map((cycle, i) => (
          <ListGroup.Item
            key={i}
            className="d-flex justify-content-between align-items-start"
            action
            onClick={() => setCycle(cycle)}
          >
            <div>
              {cycle.map((title, j) => (
                <small key={j}>
                  <code>{title}</code> {j == cycle.length - 1 ? "" : " -> "}
                </small>
              ))}
            </div>
            <Badge bg="primary" pill>
              {cycle.length}
            </Badge>
          </ListGroup.Item>
        ))}
      </ListGroup>
    );
  }

  function References(references: Reference[]) {
    const [index, setIndex] = useState(0);

    const handleSelect = (selectedIndex: number) => {
      setIndex(selectedIndex);
    };

    return (
      <Carousel
        activeIndex={index}
        onSelect={handleSelect}
        variant="dark"
        indicators={false}
        interval={null}
        controls={references.length > 1}
      >
        {references.map((reference, i) => (
          <Carousel.Item key={i} className="text-center">
            <div className="px-5">
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
            </div>
          </Carousel.Item>
        ))}
      </Carousel>
    );
  }

  if (!cycle) {
    return SelectCycle();
  }

  return (
    <div className="p-3">
      <Button onClick={() => setCycle(null)}>Back</Button>
      {cycle.map((title, i) => {
        if (i < cycle.length - 1) {
          const references = graph.tvShows
            .get(title)!
            .referencesTo.get(cycle[i + 1])!;
          return (
            <div key={i} className="text-center">
              <div className="my-3">
                {title}
                {References(references)}
              </div>
              <h5 className="text-muted">
                <BsFillArrowDownCircleFill />
              </h5>
            </div>
          );
        }
        return <div className="text-center"> {title} </div>;
      })}
    </div>
  );
}

export default CycleFinder;
