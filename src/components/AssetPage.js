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

    componentDidMount() {
        // First, load the asset
        this.getAsset()
            .then(asset => {
                this.setState({asset: asset});

                // After retrieving the Asset the metadata can be fetched
                return this.getAssetMetadata(asset.metadataId);
            })
            .then(assetMetadata => {
                this.setState({assetMetadata: assetMetadata});

                // Now retrieve the Asset content so it can be displayed
                this.getAssetContentUrl();
            });
    }

    getAssetContentUrl() {
        // Get asset type and id from the Url params
        let { type, id } = this.props.params;

        // Depending on the asset type, content can be retrieved in a few ways
        switch (type) {
            case 'image':
                // Before we can display and image we first need a Content record
                this.getProxyContent()
                    .then(imageProxyContent => {
                        // Now that we have a Content record we can build a Url
                        // to display the raw proxy
                        this.setState({
                            proxyContent: imageProxyContent,
                            streamingUrl: this.getImageContentUrl(imageProxyContent.id)}
                        );
                    });
                break;
            case 'audio':
                this.getProxyContent()
                    .then(audioProxyContent => {
                        this.setState({
                            proxyContent: audioProxyContent,
                            streamingUrl: this.getAudioContentUrl()
                        });
                    });
                break;
            case 'video':
                this.getProxyContent()
                    .then(videoProxyContent => {
                        this.setState({
                            proxyContent: videoProxyContent
                        });
                        return this.getVideoStreamingURL(this.props.params.id);
                    })
                    .then(streamingUrlResponse => {
                        this.setState({streamingUrl: streamingUrlResponse});
                    });
                break;
            case 'clip':
                // Clips do not have a content proxy as they are
                // just metadata around the parent video. To display a clip we can
                // fetch the content and secureStreamingUrl of the parent video.
                let clip = this.state.asset;
                this.getClipProxyContent(clip.videoId)
                    .then(videoProxyContent => {
                        this.setState({
                            proxyContent: videoProxyContent
                        });
                        return this.getVideoStreamingURL(clip.videoId);
                    })
                    .then(streamingUrlResponse => {
                        // Add the clip start and offset time so that the video
                        // only shows the specific clip
                        let startTime = clip.startOffsetSeconds;
                        let endTime = clip.endOffsetSeconds;
                        let streamingUrl = streamingUrlResponse.streamingUrl;
                        this.setState({streamingUrl: `${streamingUrl}#t=${startTime},${endTime}`});
                    });
                break;
            default:
                break;
        }
    }

    buildAssetInventoryUrl(type, id) {
        // The inventory apis have an 's' appended to the asset type
        // e.g. video => videos for type video, audio => audios for type audio
        let pluralAssetType = type + 's';

        // The inventory Url for a `clip` is special in that it is nested under `videos`
        if (type === 'clip') {
            return `reachengine/api/inventory/videos/${pluralAssetType}/${id}`;
        }
        else {
            return `reachengine/api/inventory/${pluralAssetType}/${id}`;
        }
    }

    getAsset() {
        let { reachEngineUrl, sessionKeyHeader} = this.props.authenticationPayload;
        let { type, id } = this.props.params;
        // Asset records are retrieved through the inventory api
        let assetInventoryUrl = this.buildAssetInventoryUrl(type, id);
        return request
            .get(`${reachEngineUrl}/${assetInventoryUrl}`)
            .set(sessionKeyHeader)
            .type('application/json')
            .promise()
            .then(res => {
                return res.body;
            });
    }

    getAssetMetadata(metadataId) {
        let { reachEngineUrl, sessionKeyHeader} = this.props.authenticationPayload;
        return request
            .get(`${reachEngineUrl}/reachengine/api/metadata/${metadataId}`)
            .set(sessionKeyHeader)
            .type('application/json')
            .promise()
            .then(res => {
                return res.body;
            });
    }

    getProxyContent() {
        let { reachEngineUrl, sessionKeyHeader} = this.props.authenticationPayload;
        // Content is defined by content use (PROXY, SOURCE, MEZZANINE)

        // A Content record contains technical metadata about a specific file
        // such as image dimensions, file type, file name, and file path

        // Content records are a sub resource of an asset inventory item
        let { type, id } = this.props.params;
        let assetInventoryUrl = this.buildAssetInventoryUrl(type, id);
        return request
            .get(`${reachEngineUrl}/${assetInventoryUrl}/proxy`)
            .set(this.props.authenticationPayload.sessionKeyHeader)
            .type('application/json')
            .promise()
            .then(res => {
                return res.body;
            });
    }

    getClipProxyContent(videoId) {
        let { reachEngineUrl, sessionKeyHeader} = this.props.authenticationPayload;
        let assetInventoryUrl = this.buildAssetInventoryUrl('video', videoId);
        return request
            .get(`${reachEngineUrl}/${assetInventoryUrl}/proxy`)
            .set(this.props.authenticationPayload.sessionKeyHeader)
            .type('application/json')
            .promise()
            .then(res => {
                return res.body;
            });
    }

    getImageContentUrl(contentId) {
        let { reachEngineUrl, sessionKeyHeader} = this.props.authenticationPayload;

        // By adding /raw to a content url we can load an image content proxy
        let { type, id } = this.props.params;
        let assetInventoryUrl = this.buildAssetInventoryUrl(type, id);
        return `${reachEngineUrl}/${assetInventoryUrl}/contents/${contentId}/raw?attach=false`;
    }


    getAudioContentUrl() {
        let { reachEngineUrl } = this.props.authenticationPayload;

        // Audo content can be retrieved as a sub resource of Inventory/Audio/Content
        let { type, id } = this.props.params;
        let assetInventoryUrl = this.buildAssetInventoryUrl(type, id);
        // Here we will get the url to stream an audio proxy
        return `${reachEngineUrl}/${assetInventoryUrl}/proxy/raw?attach=false`;
    }

    getVideoStreamingURL(videoId) {
        let { reachEngineUrl, sessionKeyHeader} = this.props.authenticationPayload;

        // Video streaming urls are requested through the secureStreamingUrl api
        // This returns a temporary url that is only valid for a limited duration as
        // set by Reach Engine.

        // The secureStreamingUrl api is a sub resource of /inventory/video
        let { type, id } = this.props.params;
        let assetInventoryUrl = this.buildAssetInventoryUrl(type, id);
        return request
            .get(`${reachEngineUrl}/${assetInventoryUrl}/secureStreamingUrl`)
            .set(sessionKeyHeader)
            .type('application/json')
            .promise()
            .then(res => {
                return res.body;
            });
    }

    renderAsset() {
        if (this.state.streamingUrl) {
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
            } else if (this.props.params.type == 'clip') {
                return (
                    <video width="320" height="240" controls>
                        <source src={this.state.streamingUrl} type="video/mp4"/>
                        Your browser does not support the video tag.
                    </video>
                );
            }
        } else {
            return (
                <div>This asset type does not have a streaming URL</div>
            )
        }
    }

    render() {
        let { type, id } = this.props.params;
        let contentProxyType = type;
        if (type === 'clip') {
            contentProxyType = 'video';
        }
        return (
            <div>
                <h1>Asset Details</h1>
                <section>
                    <h2>Asset Record:</h2>
                    <summary>
                        <div>ID: {this.state.asset.id}</div>
                        <div>Asset Name: {this.state.asset.name}</div>
                        <div>Created at: {this.state.asset.created}</div>
                    </summary>
                    <aside>
                        <div>Inventory API: {this.buildAssetInventoryUrl(type, id)}</div>
                        <pre>{JSON.stringify(this.state.asset, null, 2)}</pre>
                    </aside>
                </section>
                <section>
                    <h2>Asset Metadata</h2>
                    <summary>
                        <div>ID: {this.state.assetMetadata.id}</div>
                        <div>Created at: {this.state.assetMetadata.created}</div>
                    </summary>
                    <aside>
                        <div>Metadata API: reachengine/api/metadata/{this.state.assetMetadata.id}</div>
                        <pre>{JSON.stringify(this.state.assetMetadata, null, 2)}</pre>
                    </aside>
                </section>
                <section>
                    <h2>Asset Content</h2>
                    <summary>
                        {this.renderAsset()}
                    </summary>
                    <aside>
                        <div>Proxy Content API: {this.buildAssetInventoryUrl(contentProxyType, id)}/proxy</div>
                        <pre>{JSON.stringify(this.state.proxyContent, null, 2)}</pre>
                    </aside>
                </section>
            </div>
        );
    }
}

export default AssetPage
