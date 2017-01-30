import React, {Component, PropTypes} from "react";
import request from "superagent-bluebird-promise";
import Modal from "react-bootstrap/lib/Modal";
import Button from "react-bootstrap/lib/Button";

class WorkflowModal extends Component {
	renderTitle() {
		if (!this.props.workflowParams) {
			return (
				<center>These are not the Workflow Parameters you are looking for</center>
			)
		} else {
			return (
				<div>
					Global Workflow Selected: {this.props.workflowName}
					<h5>
						{this.props.reachEngineUrl}/reachengine/api/workflows/{this.props.workflowId}/params?includeUserInput=true&includeRequired=true&incincludeOther=false
					</h5>
				</div>
			)
		}
	}
	renderBody() {
		if (!this.props.workflowParams) {
			return (
				<center> Nothing to display. </center>
			)
		} else {
			return (
				<pre>
					{JSON.stringify(this.props.workflowParams.rows, null, 4)}
				</pre>
			)
		}
	}
  render() {
		let title = this.renderTitle();
		let body = this.renderBody();
    return (
      <Modal className="modal" show={this.props.show} bsSize="large" aria-labelledby="contained-modal-title-lg">
				<Modal.Title id="contained-modal-title-lg">
          {title}
				</Modal.Title>
				<Modal.Body>
					{body}
				</Modal.Body>
        <Modal.Footer className="modal-footer">
          <Button onClick={this.props.onHide}>Close</Button>
        </Modal.Footer>
      </Modal>
    )
  }
}

export default WorkflowModal
