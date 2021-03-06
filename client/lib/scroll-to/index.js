/**
 * External dependencies
 */
import raf from 'raf';
import TWEEN from 'tween.js';

function getWindowScroll() {
	let x = window.pageXOffset || document.documentElement.scrollLeft,
		y = window.pageYOffset || document.documentElement.scrollTop;
	return { x: x, y: y };
}

function makeScrollUpdater( container ) {
	container = ( container && container.scrollTop !== undefined )
		? container
		: window;

	return function() {
		if ( container === window ) {
			container.scrollTo( this.x, this.y );
		} else {
			container.scrollTop = this.y;
			container.scrollLeft = this.x;
		}
	}
}

function animate() {
	if ( TWEEN.getAll().length > 0 ) {
		raf( animate );
		TWEEN.update();
	}
}

/**
 * Scrolls to the specified window location
 * @param {Object} options - options object (see below)
 * @param {number} options.x - desired left or x coordinate
 * @param {number} options.y - desired top or y coordinate
 * @param {function} options.easing - easing function, defaults to TWEEN.Easing.Circular.Out
 * @param {number} options.duration - duration in ms, default 500
 * @param {function} options.onStart - callback before start is called
 * @param {function} options.onComplete - callback when scroll is finished
 * @param {HTMLElement} options.container - the container to scroll instead of window, if any
 */
function scrollTo( options ) {
	var currentWindowScroll = getWindowScroll(),
		tween = new TWEEN.Tween( currentWindowScroll )
		.easing( options.easing || TWEEN.Easing.Circular.Out )
		.to( { x: options.x, y: options.y }, options.duration || 500 )
		.onUpdate( makeScrollUpdater( options.container ) );

	if ( options.onStart ) {
		tween.onStart( options.onStart );
	}
	if ( options.onComplete ) {
		tween.onComplete( options.onComplete );
	}
	if ( TWEEN.getAll().length === 0 ) {
		tween.start();
		animate();
	} else {
		tween.start();
	}
}

export default scrollTo;
