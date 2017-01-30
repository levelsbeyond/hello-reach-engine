import React, {Component, PropTypes} from "react";
import request from "superagent-bluebird-promise";
import Modal from "react-bootstrap/lib/Modal";
import Button from "react-bootstrap/lib/Button";

class WorkflowModal extends Component {
    render() {
        if (!this.props.workflowParams) {
            return (
                <Modal className="modal" show={this.props.show} bsSize="large" aria-labelledby="contained-modal-title-lg">
                    <Modal.Title id="contained-modal-title-lg">
                        These are not the Workflow Parameters you are looking for
                    </Modal.Title>
                    <Modal.Footer className="modal-footer">
                        <Button onClick={this.props.onHide}>Close
                        </Button>
                    </Modal.Footer>
                </Modal>
            )
        } else {
            return (
              <Modal className="modal" show={this.props.show} bsSize="large" aria-labelledby="contained-modal-title-lg">
                <Modal.Title id="contained-modal-title-lg">
                    Global Workflow Selected: {this.props.workflowName}
                  <h5>
                      {this.props.reachEngineUrl}/reachengine/api/workflows/{this.props.workflowId}/params?includeUserInput=true&includeRequired=true&incincludeOther=false
                  </h5>
                </Modal.Title>
                <Modal.Body className="modal-body">
									<pre>
                    {JSON.stringify(this.props.workflowParams.rows, null, 4)}
									</pre>
                </Modal.Body>
                <Modal.Footer className="modal-footer">
	                <Button onClick={this.props.onHide}>Close</Button>
                </Modal.Footer>
              </Modal>
            )
        }
    }
}

export default WorkflowModal
