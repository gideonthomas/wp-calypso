/**
 * External dependencies
 */
<<<<<<< 517d9d459bc01ffb62d021894c6f863129eff2e1
import React from 'react';
import { connect } from 'react-redux';
import includes from 'lodash/includes';
import omit from 'lodash/omit';
import map from 'lodash/map';
import get from 'lodash/get';
import mapValues from 'lodash/mapValues';
=======
var React = require( 'react' );
>>>>>>> fixed linting warnings

/**
 * Internal dependencies
 */
import SidebarItem from 'layout/sidebar/item';
import config from 'config';
import { getSelectedSite } from 'state/ui/selectors';
import { getEditorPath } from 'state/ui/editor/selectors';
import { getPostTypes } from 'state/post-types/selectors';
import QueryPostTypes from 'components/data/query-post-types';
import analytics from 'lib/analytics';
import { decodeEntities } from 'lib/formatting';

var SidebarItem = require( 'layout/sidebar/item' ),
	config = require( 'config' );
	// [MozNote] We don't wanna show WP's custom post page, e.g., Testimonials, Portfolio.
	//           Let's remove code related to postTypesList = require( 'lib/post-types-list' )();

var PublishMenu = React.createClass( {
	propTypes: {
		site: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ),
		sites: React.PropTypes.object.isRequired,
		postTypes: React.PropTypes.object,
		siteSuffix: React.PropTypes.string,
		isSingle: React.PropTypes.bool,
		itemLinkClass: React.PropTypes.func,
		onNavigate: React.PropTypes.func
	},

	// We default to `/my` posts when appropriate
	getMyParameter() {
		const { sites, site } = this.props;
		if ( ! sites.initialized ) {
			return '';
		}

		if ( site ) {
			return ( site.single_user_site || site.jetpack ) ? '' : '/my';
		}

		return ( sites.allSingleSites ) ? '' : '/my';
	},

	getDefaultMenuItems() {
		const { site } = this.props;

		return [
			{
				name: 'post',
				label: this.translate( 'Blog Posts' ),
				className: 'posts',
				capability: 'edit_posts',
				config: 'manage/posts',
				queryable: true,
				link: '/posts' + this.getMyParameter(),
				paths: [ '/posts', '/posts/my' ],
				buttonLink: site ? '/post/' + site.slug : '/post',
				wpAdminLink: 'edit.php',
				showOnAllMySites: true,
			},
			{
				name: 'page',
				label: this.translate( 'Pages' ),
				className: 'pages',
				capability: 'edit_pages',
				queryable: true,
				config: 'manage/pages',
				link: '/pages',
				buttonLink: site ? '/page/' + site.slug : '/page',
				wpAdminLink: 'edit.php?post_type=page',
				showOnAllMySites: true,
			}
		];
	},

	onNavigate( postType ) {
		if ( ! includes( [ 'post', 'page' ], postType ) ) {
			analytics.mc.bumpStat( 'calypso_publish_menu_click', postType );
		}

		this.props.onNavigate();
	},

	renderMenuItem: function( menuItem ) {
		var className = this.props.itemLinkClass(
				menuItem.paths ? menuItem.paths : menuItem.link,
				menuItem.className
			),
			isEnabled = config.isEnabled( menuItem.config ),
			link,
			icon;

		if ( this.props.site.capabilities && ! this.props.site.capabilities[ menuItem.capability ] ) {
			return null;
		}

		// Hide the sidebar link for media
		if ( 'attachment' === menuItem.name ) {
			return null;
		}

		// Hide the sidebar link for multiple site view if it's not in calypso, or
		// if it opts not to be shown.
		const isEnabled = config.isEnabled( menuItem.config );
		if ( ! this.props.isSingle && ( ! isEnabled || ! menuItem.showOnAllMySites ) ) {
			return null;
		}

		let link;
		if ( ( ! isEnabled || ! menuItem.queryable ) && site.options ) {
			link = this.props.site.options.admin_url + menuItem.wpAdminLink;
		} else {
			link = menuItem.link + this.props.siteSuffix;
		}

		if ( menuItem.mozCustomPageType ) {
			link = link + '/?pageType=' + menuItem.name
		}

		let preload;
		if ( includes( [ 'post', 'page' ], menuItem.name ) ) {
			preload = 'posts-pages';

		} else if ( menuItem.name === 'page' || menuItem.mozCustomPageType ) {
			icon = 'pages';
			preload = 'posts-pages';
		} else if ( menuItem.name === 'jetpack-portfolio' ) {
			icon = 'folder';
		} else if ( menuItem.name === 'jetpack-testimonial' ) {
			icon = 'quote';
		} else {
			preload = 'posts-custom';
		}

		let icon;
		switch ( menuItem.name ) {
			case 'post': icon = 'posts'; break;
			case 'page': icon = 'pages'; break;
			case 'jetpack-portfolio': icon = 'folder'; break;
			case 'jetpack-testimonial': icon = 'quote'; break;
			default: icon = 'custom-post-type';
		}

		const className = this.props.itemLinkClass(
			menuItem.paths ? menuItem.paths : menuItem.link,
			menuItem.className
		);

		return (
			<SidebarItem
				key={ menuItem.name }
				label={ menuItem.label }
				className={ className }
				link={ link }
				buttonLink={ menuItem.buttonLink }
				onNavigate={ this.onNavigate.bind( this, menuItem.name ) }
				icon={ icon }
				preloadSectionName={ preload }
				mozCustomPageType={ menuItem.mozCustomPageType }
			/>
		);
	},

	getCustomMenuItems() {
		const customPostTypes = omit( this.props.postTypes, [ 'post', 'page' ] );
		return map( customPostTypes, ( postType, postTypeSlug ) => {
			let buttonLink;
			if ( config.isEnabled( 'manage/custom-post-types' ) ) {
				buttonLink = this.props.postTypeLinks[ postTypeSlug ];
			}

			return {
				name: postType.name,
				label: decodeEntities( get( postType.labels, 'menu_name', postType.label ) ),
				className: postType.name,
				config: 'manage/custom-post-types',
				queryable: postType.api_queryable,

				//If the API endpoint doesn't send the .capabilities property (e.g. because the site's Jetpack
				//version isn't up-to-date), silently assume we don't have the capability to edit this CPT.
				capability: get( postType.capabilities, 'edit_posts' ),

				// Required to build the menu item class name. Must be discernible from other
				// items' paths in the same section for item highlighting to work properly.
				link: '/types/' + postType.name,
				wpAdminLink: 'edit.php?post_type=' + postType.name,
				showOnAllMySites: false,
				buttonLink
      };
    } );
  },

	render: function() {
		var menuItems = this.getDefaultMenuItems( this.props.site );
		// [MozNote] These are the all the page templates we have available in mozmaker-template
		var customPostTypes = [
			{
				name: 'three-box-page',
				label: this.translate( '3-Box Page' )
			},
			{
				name: 'resource-list-page',
				label: this.translate( 'Resource List Page' )
			},
			{
				name: 'scrolling-guide-page',
				label: this.translate( 'Scrolling Guide Page' )
			},
			{
				name: 'recurring-event-page',
				label: this.translate( 'Recurring Event Page' )
			}
		];

		var customMenuItems = customPostTypes.map( function( postType ) {
			return {
				name: postType.name,
				label: postType.labels ? postType.labels.menu_name : postType.label,
				className: 'pages ' + postType.name,
				capability: 'edit_pages',
				config: 'manage/pages',
				// [Notes from Calypso] Required to build the menu item class name. Must be discernible from other
				// items' paths in the same section for item highlighting to work properly.
				link: '/page', // [MozNote] this prevents highlighting from working properly but we can't really fix this problem
				wpAdminLink: 'edit.php?post_type=page',
				showOnAllMySites: true,
				mozCustomPageType: true
      };
    } );

    return (
			<ul>
				{ this.props.site && (
					<QueryPostTypes siteId={ this.props.site.ID } />
				) }
				{ menuItems.map( this.renderMenuItem ) }
			</ul>
		);
	}
} );

export default connect( ( state ) => {
	const siteId = get( getSelectedSite( state ), 'ID' );
	const postTypes = getPostTypes( state, siteId );

	return {
		postTypes,
		postTypeLinks: mapValues( postTypes, ( postType, postTypeSlug ) => {
			return getEditorPath( state, siteId, null, postTypeSlug );
		} )
	};
}, null, null, { pure: false } )( PublishMenu );
