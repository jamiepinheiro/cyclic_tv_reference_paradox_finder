import { Badge, Button, ListGroup } from "react-bootstrap";
import { Graph } from "../types/Graph";

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

  if (!cycle) {
    return SelectCycle();
  }

  return (
    <div className="p-3">
      <Button onClick={() => setCycle(null)}>Back</Button>
      {JSON.stringify(cycle)}
    </div>
  );
}

export default CycleFinder;
