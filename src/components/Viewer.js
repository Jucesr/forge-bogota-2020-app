/*global Autodesk*/
/*global THREE*/

import React from 'react'
import { callApi } from '../utils/api';
import PropTypes from "prop-types";
import _ from "lodash";

class Viewer extends React.Component {

    constructor() {
        super();
        this.viewer = undefined;
        this.height = 0;
        this.width = 0;
        this.state = {
            documentId: "",
        };
    }

    ///////////////////////////////////////////////////////////////////
    // Component has been mounted so this container div is now created
    // in the DOM and viewer can be instantiated
    //
    ///////////////////////////////////////////////////////////////////
    
    componentDidMount = () => {
        
        const options = {
            env: 'AutodeskProduction',
            getAccessToken: async function (onSuccess) {
                const response = await callApi(`/token`);
                const {access_token, expires_in} = response.body;
                // Code to retrieve and assign token value to
                // accessToken and expire time in secons.
                onSuccess(access_token, expires_in);
            }
        };
        const self = this;
        Autodesk.Viewing.Initializer(options, () => {

            // var config3d = {
            //     // extensions: ['AddMeasureMarkup']
            //   };

            var htmlDiv = document.getElementById(this.props.id);
            this.viewer = new Autodesk.Viewing.GuiViewer3D(htmlDiv);
            var startedCode = this.viewer.start();
            if (startedCode > 0) {
                console.error('Failed to create a Viewer: WebGL not supported.');
                return;
            }
        
            console.log('Initialization complete, loading a model next...');
            // var urn = 'urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6aTMtbW9kZWxzL3Nhbml0YXJ5LnBkZg';
            var documentId = this.props.documentId;
            Autodesk.Viewing.Document.load(documentId, this.onDocumentLoadSuccess, this.onDocumentLoadFailure);
        });
    };

    componentDidUpdate = (prevProps, prevState) => {

        if (this.viewer && this.viewer.impl) {
            if (this.viewerContainer.offsetHeight !== this.height || this.viewerContainer.offsetWidth !== this.width) {
                this.height = this.viewerContainer.offsetHeight;
                this.width = this.viewerContainer.offsetWidth;
                this.viewer.resize()
            }
        }

        // Typical usage (don't forget to compare props):
        if (this.props.documentId !== prevProps.documentId && this.viewer) {
            Autodesk.Viewing.Document.load(this.props.documentId, this.onDocumentLoadSuccess, this.onDocumentLoadFailure);
        }
        
    };


    onDocumentLoadSuccess = (doc) => {

        var viewables = doc.getRoot().search({'type':'geometry'});
        this.viewer.loadDocumentNode(doc, viewables[this.props.viewable ? this.props.viewable : 0]).then(i => {
            //  Set the viewer for the Parent component so it can be used from other components
            // alert('Viewer Loaded')
            if(this.props.onInit){
                this.props.onInit(this.viewer)
            }
 
        });
    }

    onDocumentLoadFailure = (viewerErrorCode, message) => {
        console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode + message);
    };


    getSelectedItems = () => {
        const viewer = this.viewer;
        return viewer.getSelection();
    };

    getViewer = () => {
        return this.viewer
    };

    ///////////////////////////////////////////////////////////////////
    // Component will unmount so we can destroy the viewer to avoid
    // memory leaks
    //
    ///////////////////////////////////////////////////////////////////
    componentWillUnmount = () => {
        if (this.viewer) {

            if (this.viewer.impl.selector) {
                this.viewer.tearDown();
                this.viewer.finish();
                this.viewer = null
            }
        }
    };

    ///////////////////////////////////////////////////////////////////
    // Render component, resize the viewer if exists
    //
    ///////////////////////////////////////////////////////////////////
    render() {
        return (
        <div className="Viewer" id={this.props.id} ref={(div) => this.viewerContainer = div}></div>
        )
    }

}


Viewer.propTypes = {
};

Viewer.defaultProps = {
};


export default Viewer;

