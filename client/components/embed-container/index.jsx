/**
 * A component that notices when the content has embeds that require outside JS. Load the outside JS and process the embeds
 */

import React from 'react';
import ReactDom from 'react-dom';
import PureMixin from 'react-pure-render/mixin';
import filter from 'lodash/filter';
import forEach from 'lodash/forEach';
import forOwn from 'lodash/forOwn';
import noop from 'lodash/noop';

import { loadScript } from 'lib/load-script';

import debugFactory from 'debug';

const debug = debugFactory( 'calypso:components:embed-container' );

const embedsToLookFor = {
	'blockquote[class^="instagram-"]': embedInstagram,
	'blockquote[class^="twitter-"]': embedTwitter,
	'fb\\\:post, [class^=fb-]': embedFacebook,
	'[class^=tumblr-]': embedTumblr
};

function processEmbeds( domNode ) {
	forOwn( embedsToLookFor, ( fn, embedSelector ) => {
		let nodes = domNode.querySelectorAll( embedSelector );
		forEach( filter( nodes, nodeNeedsProcessing ), fn );
	} );
}

function nodeNeedsProcessing( domNode ) {
	if ( domNode.hasAttribute( 'data-wpcom-embed-processed' ) ) {
		return false; // already marked for processing
	}

	domNode.setAttribute( 'data-wpcom-embed-processed', '1' );
	return true;
}

let loaders = {};
function loadAndRun( scriptUrl, callback ) {
	let loader = loaders[ scriptUrl ];
	if ( ! loader ) {
		loader = new Promise( function( resolve, reject ) {
			loadScript( scriptUrl, function( err ) {
				if ( err ) {
					reject( err );
				} else {
					resolve();
				}
			} );
		} );
		loaders[ scriptUrl ] = loader;
	}
	loader.then( callback, function( err ) {
		debug( 'error loading ' + scriptUrl, err );
		loaders[ scriptUrl ] = null;
	} );
}

function embedInstagram( domNode ) {
	debug( 'processing instagram for', domNode );
	if ( typeof instgrm !== 'undefined' ) {
		global.instgrm.Embeds.process();
		return;
	}

	loadAndRun( 'https://platform.instagram.com/en_US/embeds.js', embedInstagram.bind( null, domNode ) );
}

function embedTwitter( domNode ) {
	debug( 'processing twitter for', domNode );

	if ( typeof twttr !== 'undefined' ) {
		global.twttr.widgets.load( domNode );
		return;
	}

	loadAndRun( 'https://platform.twitter.com/widgets.js', embedTwitter.bind( null, domNode ) );
}

function embedFacebook( domNode ) {
	debug( 'processing facebook for', domNode );
	if ( typeof fb !== 'undefined' ) {
		return;
	}

	loadAndRun( 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.2', noop );
}

let tumblrLoader;
function embedTumblr( domNode ) {
	debug( 'processing tumblr for', domNode );
	if ( tumblrLoader ) {
		return;
	}

	// tumblr just wants us to load this script, over and over and over
	tumblrLoader = true;

	function removeScript() {
		forEach( document.querySelectorAll( 'script[src="https://secure.assets.tumblr.com/post.js"]' ), function( el ) {
			el.parentNode.removeChild( el );
		} );
		tumblrLoader = false;
	}

	setTimeout( function() {
		loadScript( 'https://secure.assets.tumblr.com/post.js', removeScript );
	}, 30 );
}

export default React.createClass( {
	mixins: [ PureMixin ],

	componentDidMount() {
		debug( 'did mount' );
		processEmbeds( ReactDom.findDOMNode( this ) );
	},

	componentDidUpdate() {
		debug( 'did update' );
		processEmbeds( ReactDom.findDOMNode( this ) );
	},

	componentWillUnmount() {
		debug( 'unmounting' );
	},

	render() {
		return React.Children.only( this.props.children );
	}
} );
