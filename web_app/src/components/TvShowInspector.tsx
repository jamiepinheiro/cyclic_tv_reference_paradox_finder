import "../css/index.css";
import { Accordion, ListGroup, Placeholder } from "react-bootstrap";
import { TvShow } from "../types/TvShow";
import { Reference } from "../types/Reference";

type Props = {
  tvShow: TvShow | null;
};

function TvShowInspector({ tvShow }: Props) {
  if (!tvShow) {
    return (
      <div className="text-center my-5">
        <h5>Select a TV Show on the graph!</h5>
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
    <div className="p-3 overflow-auto">
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

      {Array.from(tvShow.referencedBy).length > 0 ? (
        <h6>Referenced By</h6>
      ) : null}
      {References(tvShow.referencedBy)}

      {Array.from(tvShow.referencesTo).length > 0 ? (
        <h6 className="mt-3">References To</h6>
      ) : null}
      {References(tvShow.referencesTo)}
    </div>
  );
}

export default TvShowInspector;
