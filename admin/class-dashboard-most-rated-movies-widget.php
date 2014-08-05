<?php
/**
 * WPMovieLibrary Dashboard Class extension.
 * 
 * Create a Movies preview Widget.
 *
 * @package   WPMovieLibrary
 * @author    Charlie MERLAND <charlie.merland@gmail.com>
 * @license   GPL-3.0
 * @link      http://www.caercam.org/
 * @copyright 2014 CaerCam.org
 */

if ( ! class_exists( 'WPML_Dashboard_Most_Rated_Movies_Widget' ) ) :

	class WPML_Dashboard_Most_Rated_Movies_Widget extends WPML_Dashboard {

		/**
		 * Widget ID
		 * 
		 * @since    1.0.0
		 * 
		 * @var      string
		 */
		protected $widget_id = '';

		/**
		 * Widget Name.
		 * 
		 * @since    1.0.0
		 * 
		 * @var      string
		 */
		protected $widget_name = '';

		/**
		 * Widget callback method.
		 * 
		 * @since    1.0.0
		 * 
		 * @var      array
		 */
		protected $callback = null;

		/**
		 * Widget Controls callback method.
		 * 
		 * @since    1.0.0
		 * 
		 * @var      array
		 */
		protected $control_callback = null;

		/**
		 * Widget callback method arguments.
		 * 
		 * @since    1.0.0
		 * 
		 * @var      array
		 */
		protected $callback_args = null;

		/**
		 * Widget settings.
		 * 
		 * @since    1.0.0
		 * 
		 * @var      array
		 */
		protected $settings = null;

		/**
		 * Widget default settings.
		 * 
		 * @since    1.0.0
		 * 
		 * @var      array
		 */
		protected $default_settings = null;

		/**
		 * Constructor
		 *
		 * @since   1.0.0
		 */
		public function __construct() {

			$this->init();
			$this->register_hook_callbacks();
		}

		/**
		 * Initializes variables
		 *
		 * @since    1.0.0
		 */
		public function init() {

			$this->widget_id = 'wpml_dashboard_most_rated_movies_widget';
			$this->widget_name = __( 'Your most rated movies', 'wpmovielibrary' );
			$this->callback = array( $this, 'widget' );
			$this->control_callback = array( $this, 'widget_handle' );
			$this->callback_args = array( 'id' => $this->widget_id );

			$this->default_settings = array(
				'movies_per_page' => 4,
				'show_year' => 1,
				'show_rating' => 1,
				'show_more' => 1,
				'show_modal' => 1,
				'show_quickedit' => 1,
				'style_posters' => 1,
				'style_metabox' => 1
			);
			$this->settings = $this->widget_settings();
		}

		/**
		 * Register callbacks for actions and filters
		 * 
		 * @since    1.0.0
		 */
		public function register_hook_callbacks() {

			add_action( 'wpml_dashboard_setup', array( $this, '_add_dashboard_widget' ), 10 );

			if ( '1' == $this->settings['style_metabox'] )
				add_action( 'admin_footer', array( $this, 'widget_metabox_style' ), 10 );
		}

		/**
		 * Register the Widget
		 * 
		 * @since    1.0.0
		 */
		public function _add_dashboard_widget() {

			$this->add_dashboard_widget( $this->widget_id, $this->widget_name, $this->callback, $this->control_callback );
		}

		/**
		 * Widget Settings. Get the stored Widget Settings if existing,
		 * save default settings if none.
		 * 
		 * @since    1.0.0
		 * 
		 * @return   array    Widget Settings.
		 */
		private function widget_settings() {

			$widget_id = $this->widget_id;
			$defaults = $this->default_settings;
			$settings = get_user_option( $widget_id . '_settings' );

			if ( ! $settings ) {
				update_user_option( get_current_user_id(), $widget_id . '_settings', $defaults );
				$settings = $defaults;
			}
			else
				$settings = wp_parse_args( $settings, $defaults );

			return $settings;
		}

		/**
		 * Update Widget settings when config form is posted.
		 * 
		 * @since    1.0.0
		 */
		private function update_settings() {

			wpml_check_admin_referer( "save-{$this->widget_id}" );

			$settings = get_user_option( $this->widget_id . '_settings' );
			$_settings = array();

			foreach ( $this->default_settings as $key => $value ) {
				if ( ! isset( $_POST[ $this->widget_id ][ $key ] ) )
					$_settings[ $key ] = 0;
				else
					$_settings[ $key ] = $_POST[ $this->widget_id ][ $key ];
			}

			$settings = wp_parse_args( $_settings, $settings );
			$update = update_user_option( get_current_user_id(), $this->widget_id . '_settings', $settings );

			if ( $update ) {
				WPML_Utils::admin_notice( __( 'Settings saved.' ), $type = 'update' );
				$this->settings = $settings;
			}
		}

		/**
		 * JavaScript part to apply custom styling on plugin Metaboxes.
		 * 
		 * This can't be done in PHP so we need to add a small JS code
		 * to add a class the Metaboxes selected to be stylized.
		 * 
		 * @since    1.0.0
		 */
		public function widget_metabox_style() {

			printf( '<script type="text/javascript">var _widget = document.getElementById("%s"); if ( null != _widget ) _widget.classList.add("no-style");</script>', $this->widget_id );
		}

		/**
		 * Prepare and include the Widget's content. Get and apply
		 * settings.
		 * 
		 * @since    1.0.0
		 * 
		 * @param    int    $limit Number of movies to show
		 * @param    int    $offset Starting after n movies
		 */
		public function get_widget_content( $limit = null, $offset = 0 ) {

			$movies = $this->widget_content( $limit, $offset );
			$settings = $this->settings;

			$class = 'wpml-movie';

			if ( '1' == $settings['show_year'] )
				$class .= ' with-year';
			if ( '1' == $settings['show_rating'] )
				$class .= ' with-rating';
			if ( '1' == $settings['style_posters'] )
				$class .= ' stylized';
			if ( '1' == $settings['show_modal'] )
				$class .= ' modal';

			echo self::render_template( 'dashboard-most-rated-movies/most-rated-movies.php', array( 'movies' => $movies, 'class' => $class, 'offset' => $offset, 'settings' => $settings ) );
		}

		/**
		 * Retrieve and prepare the movies to display in the Widget.
		 * 
		 * @since    1.0.0
		 * 
		 * @param    int    $limit How many movies to get
		 * @param    int    $limit Offset to select movies
		 * 
		 * @return   array    Requested Movies.
		 */
		private function widget_content( $limit = null, $offset = 0 ) {

			global $wpdb;

			if ( is_null( $limit ) )
				$limit = $this->settings['movies_per_page'];

			$args = array(
				'posts_per_page' => $limit,
				'offset'         => $offset,
				'post_type'      => 'movie',
				'post_status'    => 'publish',
				'order'          => 'DESC',
				'orderby'        => 'meta_value_num',
				'meta_key'       => '_wpml_movie_rating'
			);
			$movies = new WP_Query( $args );

			if ( ! $movies->have_posts() )
				return false;

			foreach ( $movies->posts as $movie ) {

				$movie->meta = array(
					'title'        => apply_filters( 'the_title', wpml_get_movie_meta( $movie->ID, 'title' ) ),
					'runtime'      => apply_filters( 'wpml_format_movie_runtime', wpml_get_movie_meta( $movie->ID, 'runtime' ) ),
					'release_date' => apply_filters( 'wpml_format_movie_release_date', wpml_get_movie_meta( $movie->ID, 'release_date' ), 'Y' ),
					'overview'     => apply_filters( 'the_content', wpml_get_movie_meta( $movie->ID, 'overview' ) )
				);
				$movie->rating = wpml_get_movie_meta( $movie->ID, 'rating' );
				$movie->year = $movie->meta['release_date'];
				$movie->meta = json_encode( $movie->meta );

				if ( has_post_thumbnail( $movie->ID ) ) {
					$movie->poster = wp_get_attachment_image_src( get_post_thumbnail_id( $movie->ID ), 'large' );
					$movie->poster = $movie->poster[0];
				}
				else
					$movie->poster = WPML_DEFAULT_POSTER_URL;

				$attachments = get_children( $args = array( 'post_parent' => $movie->ID, 'post_type' => 'attachment' ) );
				if ( ! empty( $attachments ) ) {
					shuffle( $attachments );
					$movie->backdrop = wp_get_attachment_image_src( $attachments[0]->ID, 'full' );
					$movie->backdrop = $movie->backdrop[0];
				}
				else
					$movie->backdrop = $movie->poster;
			}

			return $movies->posts;
		}

		/**
		 * The Widget content.
		 * 
		 * Show a list of the most recently added movies with a panel of
		 * settings to customize the view.
		 * 
		 * @since    1.0.0
		 */
		public function widget() {

			if ( isset( $_POST[ $this->widget_id ] ) )
				$this->update_settings();

			$editing = false;
			$offset = false;
			$settings = $this->settings;

			echo self::render_template( '/dashboard-latest-movies/latest-movies-admin.php', array( 'offset' => $offset, 'settings' => $settings, 'editing' => $editing ), $require = 'always' );

			$this->get_widget_content();
		}

		/**
		 * Widget's configuration callback
		 * 
		 * @since    1.0.0
		 * 
		 * @param    string    $context box context
		 * @param    mixed     $object gets passed to the box callback function as first parameter
		 */
		public function widget_handle( $context, $object ) {

			$settings = $this->settings;
			$editing = ( isset( $_GET['edit'] ) && $object['id'] == $_GET['edit'] );

			if ( $editing && ( ! current_user_can( 'edit_dashboard' ) || ( ! isset( $_GET['_wpnonce'] ) || ! wp_verify_nonce( $_GET['_wpnonce'], "edit_{$this->widget_id}" ) ) ) ) {
				printf( '%s <a href="%s">%s</a>', __( 'You are not allowed to edit this item.' ), admin_url( '/admin.php?page=wpmovielibrary' ), __( 'Go back' ) );
				return false;
			}

			echo self::render_template( '/dashboard-latest-movies/latest-movies-admin.php', array( 'movies' => $movies, 'offset' => $offset, 'settings' => $settings, 'editing' => $editing, 'widget' => $this ), $require = 'always' );
		}

	}

endif;