<?php
/**
 * Abstract Widget Class
 * 
 * @package   WPMovieLibrary
 * @author    Charlie MERLAND <charlie.merland@gmail.com>
 * @license   GPL-3.0
 * @link      http://www.caercam.org/
 * @copyright 2014 CaerCam.org
 */

/**
 * Taxonomies Widget.
 * 
 * Display a list of the Movies Taxonomies: Collections, Genres or Actors. This
 * replace the previous  Collections, Genres and Actors Widgets.
 * 
 * @since    1.2
 */
abstract class WPML_Widget extends WP_Widget {

	protected $widget_css;
	protected $widget_description;
	protected $widget_id;
	protected $widget_name;
	protected $widget_form;
	protected $widget_params;

	/**
	 * Constructor
	 * 
	 * @since    1.2
	 */
	public function __construct() {

		$widget_args = array(
			'classname'   => $this->widget_css,
			'description' => $this->widget_description
		);

		$this->WP_Widget( $this->widget_id, $this->widget_name, $widget_args );
	}

	/**
	 * update function.
	 * 
	 * @since    1.2
	 * 
	 * @param    array    $new_instance
	 * @param    array    $old_instance
	 * 
	 * @return   array
	 */
	function update( $new_instance, $old_instance ) {

		$instance = $old_instance;

		if ( ! $this->widget_params )
			return $instance;

		foreach ( $this->widget_params as $key => $setting ) {
			if ( isset( $new_instance[ $key ] ) )
				$instance[ $key ] = sanitize_text_field( $new_instance[ $key ] );
			elseif ( 'checkbox' === $setting['type'] )
				$instance[ $key ] = 0;
			else
				$instance[ $key ] = '';
		}

		return $instance;
	}

	/**
	 * form function.
	 * 
	 * @since    1.2
	 * 
	 * @param    array    $instance
	 * 
	 * @return   void
	 */
	function form( $instance ) {

		if ( ! $this->widget_params || ! $this->widget_form )
			return;

		echo WPMovieLibrary::render_template( $this->widget_form, array( 'widget' => $this, 'instance' => $instance ), $require = 'always' );
	}
}