import { NAVY } from "../utils/Colors";

function MadeBy() {
  return (
    <div id="madeBy" className="opacity-50">
      <div className="float-end px-2" style={{ backgroundColor: NAVY }}>
        <small className="text-light text-end">
          Made by{" "}
          <a id="link" target="_blank" href="https://jamiepinheiro.com">
            Jamie Pinheiro
          </a>
        </small>
      </div>
    </div>
  );
}

export default MadeBy;
