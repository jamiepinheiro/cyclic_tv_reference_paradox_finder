import "../css/index.css";
import { useState } from "react";
import { Modal, Button, Row } from "react-bootstrap";
import { AiFillQuestionCircle } from "react-icons/ai";

function Help() {
  const [showHelp, setShowHelp] = useState(false);
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
            <b>Cyclic TV Reference Paradoxes</b> occur when a chain of TV
            references loop in on themselves.
          </p>

          <div className="my-1 mb-3">
            <p>ie.</p>
            <img src="example.png" alt="" className="col-12 px-5" />
          </div>
          <p>
            Using subtitle files, a large dataset of these TV show references
            were generated. This tool displays this dataset in a graph where the
            nodes are TV shows, and the edges are references. References can be
            viewed by clicking on individual nodes in this graph.
            <br />
            <br />
            <i>Experiencing a problem?</i>
            <br />
            Open an issue{" "}
            <a href="https://github.com/jamiepinheiro/cyclic_tv_reference_paradox_finder/issues/new">
              here
            </a>
            .
            <br />
            <br />
            <i>Want to learn more?</i>
            <br />
            Check out this <a href="https://asdoifjosij.com">blog post</a>.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setShowHelp(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Help;
