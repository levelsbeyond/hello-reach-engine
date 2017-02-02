import React, {Component} from "react";
import request from "superagent-bluebird-promise";
import Griddle from "griddle-react";
import Select from "react-select";
import WorkflowModal from "./WorkflowModal";
import 'react-select/dist/react-select.css';

class Search extends React.Component {
	constructor(props, context) {
		super(props, context);

		var headers = [
			"thumbnail",
			"id",
			"inventoryKey",
			"name",
			"dateCreated",
			"dateUpdated"
		];

		// initial search state.
		this.state = {
			showModal: false,
			workflowParams: [],
			workflowId: "",
			workflowName: "",
			GlobalWorkflowNames: [],
			searchData: [],
			searchHeaders: headers,
			offset: 0,
			page: 0,
			total: 0,
			limit: 25,
			keywords: ""
		};
	}
	componentDidMount() {
		// initial search when we load.
		this.search();
		// Loading Global Workflows data
		this.getWorkflows();
	}
	getWorkflowParams(workflowId) {
		// Get workflow params from the Url params
		let {reachEngineUrl, sessionKeyHeader} = this.props.authenticationPayload;
		// Workflow params are retrieved through the workflows api
		return request
			.get(`${reachEngineUrl}/reachengine/api/workflows/${workflowId}/params?includeUserInput=true&includeRequired=true&includeOther=false`)
			.set(sessionKeyHeader)
			.type('application/json')
			.promise()
	}
	closeModal() {
		this.setState({showModal: false});
	}
	onSelect(workflow) {
		this.getWorkflowParams(workflow.id)
		.then(res => {
					this.setState({
						showModal: true,
						workflowId: workflow.id,
						workflowName: workflow.label,
						workflowParams: res.body
					});
		});
	}
	getWorkflows() {
			// Get workflow from the Url
			let {reachEngineUrl, sessionKeyHeader} = this.props.authenticationPayload;
			// Workflow records are retrieved through the workflows api
			request
				.get(`${reachEngineUrl}/reachengine/api/workflows?fetchLimit=100&includeCommon=true&userCanExecuteOnly=true`)
				.set(sessionKeyHeader)
				.type('application/json')
				.promise()
				.then(res => {
					// res.body.workflows is an array of objects that contains each Global Workflow
						this.setState({GlobalWorkflowNames: res.body.workflows});
						this.getGlobalWorkflowNames(res.body.workflows);
				});
	}

	getGlobalWorkflowNames(workflows) {
		//Get Global Workflow Names and Ids
		var GlobalWorkflowsObject = workflows.map(function(globalWorkflows) {
			return {
				label: globalWorkflows.name, id: globalWorkflows.id
			}
		});
		this.setState({GlobalWorkflowNames: GlobalWorkflowsObject})
	}

	//what page is currently viewed
	setPage(index){
		// set the offset and page, then search
		var offset = index * this.state.limit;
		this.setState({offset: offset, page: index}, function() {
			this.search();
		});
	}

	setFilter(filter) {
		// set the state keywords, then call search
		this.setState({keywords:filter}, function() {
			this.search();
		});
	}

	search() {
		// build the search url, then call the server for data.
		var offsetLimit = `OFFSET ${this.state.offset} SIZE ${this.state.limit} ORDER_BY dateUpdated DESC`;
		var assetTypes = `types=video&types=image&types=document&types=other&types=collection&types=audio&types=clip&types=project`;
		var searchUrl = `reachengine/api/inventory/search?${assetTypes}&rql=${offsetLimit}&keywords=${this.state.keywords}`;

		request
			.get(`${this.props.authenticationPayload.reachEngineUrl}/${searchUrl}`)
			.type('application/json')
			.set(this.props.authenticationPayload.sessionKeyHeader)
			.promise()
			.then(res => {
				// total and results returned in the body, set them in our state vars.
				this.setState({total: res.body.total, searchData: res.body.results});
				// go build on the thumbnail urls
				this.getThumbs();
			});
	}

	getThumbs() {
		// build the thumb url for assets, attach them to the result object from search
		var results = [];
		var sessionKeyHeader = "?__sessionKey="+this.props.authenticationPayload.sessionKeyHeader.__sessionkey
		this.state.searchData.forEach(function(asset, index) {

			if (asset.inventoryKey === 'collection'
				|| asset.inventoryKey === 'audio'
				|| asset.inventoryKey === 'project')
				{

				// no thumbs for these.
				asset.thumbnail="";
			} else {
				// standard thumbnail url pattern
				var thubmnailUrl = `/reachengine/api/inventory/${asset.inventoryKey}s/${asset.id}/thumbnail/raw`;

				if (asset.inventoryKey === 'clip'){
					// clip thumbnail url pattern, from the videos api
					thubmnailUrl = `/reachengine/api/inventory/videos/${asset.inventoryKey}s/${asset.id}/thumbnail/raw`;
				}
				// img tag for embed
				asset.thumbnail=<img src={this.props.authenticationPayload.reachEngineUrl + thubmnailUrl + sessionKeyHeader} height="36"/>;
			}
			results.push(asset);
		}, this);
		this.setState({searchData: results});
	}

	render() {
		if(!this.state.GlobalWorkflowNames) {
			return null;
		}

		var LinkComponent = React.createClass({
			render: function() {
				var url ="#/assets/" + this.props.rowData.inventoryKey + "/"+ this.props.rowData.id;
				return <a href={url}>{this.props.data}</a>
			}
		});

		var columnMeta = [
			{
				"columnName": "name",
				"customComponent": LinkComponent
			}
		];

		return (
		<div>
		<WorkflowModal
			show={this.state.showModal}
			onHide={::this.closeModal}
			onEnter={this.getWorkflowParams}
			workflowParams={this.state.workflowParams}
			workflowId={this.state.workflowId}
			workflowName={this.state.workflowName}
			reachEngineUrl={this.props.authenticationPayload.reachEngineUrl}
		/>
		<Select
			options={this.state.GlobalWorkflowNames}
			onChange={::this.onSelect}
			placeholder="Select a Global Workflow"
			searchable={false}
			clearable={false}
		/>
		<Griddle
			useExternal={true}
			externalSetFilter={::this.setFilter}
			externalSetPage={::this.setPage}
			externalCurrentPage={this.state.page}
			externalPageSize={this.state.limit}
			externalMaxPage={Math.round(this.state.total/this.state.limit)}
			results={this.state.searchData}
			columns={this.state.searchHeaders}
			columnMetadata={columnMeta}
			showFilter={true}
		/>
		</div>
		)
	}
}

export default Search
