import React, {Component, PropTypes} from "react";
import request from "superagent-bluebird-promise";

class AssetPage extends Component {

    constructor(props, context) {
        super(props, context);
        // initial search state.
        this.state = {
            asset: {},
            assetMetadata: {},
            streamingUrl: '',
            mimeType: '',
            height: '',
            width: ''
        };

    }
    getAssetType(){
        // Our apis have an 's' for assetTypes as in videos for type video, audios for type audio etc hence we add this 's'
        return this.props.params.type + 's';
    }
    componentDidMount() {
        this.getAsset()
            .then(asset => {
                this.setState({asset: asset});
                return this.getAssetMetadata(asset.metadataId);
            })
            .then((assetMetadata) => {
                this.setState({assetMetadata: assetMetadata});
                this.getAssetUrl();
            });
    }

    getAssetUrl() {
            switch(this.props.params.type){
                case 'image':
                    return this.getProxyImage()
                        .then(imageProxy => {
                            return this.getRawImage(imageProxy.id);
                        });
                case 'audio':
                    return this.getRawAudio();
                case 'video':
                    return this.getVideoStreamingURL();
            }
    }

    getAsset() {
        return request
            .get(`${this.props.authenticationPayload.reachEngineUrl}/reachengine/api/inventory/${this.getAssetType()}/${this.props.params.id}`)
            .set(this.props.authenticationPayload.sessionKeyHeader)
            .type('application/json')
            .promise()
            .then(res => {
                return res.body;
            });
    }

    getAssetMetadata(id) {
        return request
            .get(`${this.props.authenticationPayload.reachEngineUrl}/reachengine/api/metadata/${id}`)
            .set(this.props.authenticationPayload.sessionKeyHeader)
            .type('application/json')
            .promise()
            .then(res => {
                return res.body;
            });
    }

    getProxyImage() {
        return request
            .get(`${this.props.authenticationPayload.reachEngineUrl}/reachengine/api/inventory/images/${this.props.params.id}/proxy`)
            .set(this.props.authenticationPayload.sessionKeyHeader)
            .type('application/json')
            .promise()
            .then(res => {
                this.setState({mimeType: res.body.mimeType, height: res.body.height, width: res.body.width});
                return res.body;
            });
    }

    getRawImage(contentId) {
        this.setState({streamingUrl: `${this.props.authenticationPayload.reachEngineUrl}/reachengine/api/inventory/images/${this.props.params.id}/contents/${contentId}/raw?attach=false`})
    }


    getRawAudio() {
        this.setState({streamingUrl: `${this.props.authenticationPayload.reachEngineUrl}/reachengine/api/inventory/audios/${this.props.params.id}/proxy/raw?attach=false`})
    }

    getVideoStreamingURL() {
        return request
            .get(`${this.props.authenticationPayload.reachEngineUrl}/reachengine/api/inventory/${this.getAssetType()}/${this.props.params.id}/secureStreamingUrl`)
            .set(this.props.authenticationPayload.sessionKeyHeader)
            .type('application/json')
            .promise()
            .then(res => {
                this.setState({streamingUrl: res.body.streamingUrl});
                return res.body;
            });
    }

    renderAsset() {
        if(this.state.streamingUrl) {
            if (this.props.params.type == 'video') {
                return (
                    <video width="320" height="240" controls>
                        <source src={this.state.streamingUrl} type="video/mp4"/>
                        Your browser does not support the video tag.
                    </video>
                );
            } else if (this.props.params.type == 'audio') {
                return (
                    <audio controls>
                        <source src={this.state.streamingUrl} type="audio/mpeg"/>
                    </audio>
                );
            } else if (this.props.params.type == 'image') {
                return (
                    <div><img src={this.state.streamingUrl} style={{height:this.state.height, width: this.state.width}}/></div>
                );
            }
        } else {
            return (
                <div>This asset type does not have a streaming URL</div>
            )
        }
    }

    render() {

        return (
            <div>
                <h1>Asset Details</h1>
                <div>
                    <div>
                        ID: {this.state.asset.id}
                    </div>
                    <div>
                        Asset Name: {this.state.asset.name}
                    </div>
                    <div>
                        Created at: {this.state.asset.created}
                    </div>
                </div>
                <div>
                    <h1>Asset Metadata</h1>
                    <div>
                        ID: {this.state.assetMetadata.id}
                    </div>
                    <div>
                        Created at: {this.state.assetMetadata.created}
                    </div>
                </div>
                {this.renderAsset()}
            </div>
        );
    }
}

export default AssetPage
