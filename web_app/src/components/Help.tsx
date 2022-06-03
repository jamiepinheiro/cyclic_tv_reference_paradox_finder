import "../css/index.css";
import { useState } from "react";
import { Modal, Button, Figure } from "react-bootstrap";
import { AiFillQuestionCircle } from "react-icons/ai";

function Help() {
  const [showHelp, setShowHelp] = useState(true);
  return (
    <div>
      <div id="help" className="opacity-50">
        <h1
          className="px-2"
          onClick={() => setShowHelp(true)}
          style={{ cursor: "pointer" }}
        >
          <AiFillQuestionCircle />
        </h1>
      </div>
      <Modal
        show={showHelp}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header>
          <Modal.Title id="contained-modal-title-vcenter">
            Cyclic TV Reference Paradox Finder
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <i>Cyclic TV Reference Paradoxes</i> occur when a chain of TV show
            references contain a cycle.
          </p>

          <div className="my-1 mb-3">
            <p>ie.</p>
            <Figure className="col-12 px-5">
              <Figure.Image src={process.env.PUBLIC_URL + "/example.png"} />
              <Figure.Caption>
                Here, in the Simpsons' fictional universe, Rick and Morty exists
                as a TV show (shown by the reference). However, in the Rick and
                Morty fictional universe, The Simpsons also exists as a TV show.
                These two references create a cycle where each depends on the
                other being fictional in their respective universe, which cannot
                both be true simultaneously - a paradox!
              </Figure.Caption>
            </Figure>
          </div>
          <p>
            Using subtitle files, a large dataset of TV show references were
            generated. This tool displays this dataset in a graph where the
            nodes are TV shows, and the edges are references. References can be
            viewed by clicking on individual nodes in this graph.
            <br />
            <br />
            Want to learn more? Check out this{" "}
            <a href="https://jamiepinheiro.com">blog post</a>.
          </p>
        </Modal.Body>
        <Modal.Footer className="justify-content-between">
          <div>
            Problem? Suggestion?{" "}
            <a
              target="_blank"
              rel="noreferrer"
              href="https://github.com/jamiepinheiro/cyclic_tv_reference_paradox_finder/issues/new"
            >
              Open an issue.
            </a>
          </div>
          <Button onClick={() => setShowHelp(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Help;
