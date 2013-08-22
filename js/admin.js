jQuery(document).ready(function($) {

	if ( $('#wpml-tabs').length > 0 )
		$('#wpml-tabs').tabs();

	$('input#tmdb_empty').click(function(e) {
		e.preventDefault();
		
		a = document.getElementsByClassName('tmdb_data_field');
		for ( i = 0; i < a.length; ++i ) a.item(i).value = null;
		document.getElementById('tmdb_save_images').style.display = 'none';
		document.getElementById('progressbar').style.display = 'none';
		a = document.getElementsByClassName('tmdb_select_movie');
		while( a.item(0) ) a.item(0).remove();
		a = document.getElementsByClassName('tmdb_movie_images');
		while( a.item(0) ) a.item(0).remove();
		document.getElementById('tmdb_data').innerHTML = null;
		wpml.status.clear();
	});

	$('input#APIKey_check').click(function(e) {
		e.preventDefault();
		$('#api_status').remove();
		$.ajax({
			type: 'GET',
			url: ajax_object.ajax_url,
			data: {
				action: 'tmdb_api_key_check',
				key: $('input#APIKey').val()
			},
			success: function(response) {
				$('input#APIKey_check').after(response);
			},
			beforeSend: function() {
				$('input#APIKey_check').addClass('button-loading');
			},
			complete: function() {
				$('input#APIKey_check').removeClass('button-loading');
			},
		});
	});

	$('#wpml-import input#doaction').click(function(e) {

		action = $(this).prev('select[name=action]');
		if ( ! action.length || 'tmdb_data' != action.val() ) {
			console.log('!action');
			return false;
		}

		wpml.import.get_movies();
	});

	$('#wpml-import #wpml_empty').click(function() {
		$('.wpml-import-movie-select').remove();
	})

	$('input#tmdb_search').click(function(e) {
		e.preventDefault();
		wpml.movie.search_movie();
	});

	// Status

	$('#movie-status-select').siblings('a.edit-movie-status').click(function() {
		if ( $('#movie-status-select').is(":hidden") ) {
			$('#movie-status-select').slideDown('fast');
			$(this).hide();
		}
		return false;
	});

	$('.save-movie-status', '#movie-status-select').click(function() {
		$('#movie-status-select').slideUp('fast');
		$('#movie-status-select').siblings('a.edit-movie-status').show();
		$('#movie-status-display').text($('#movie_status > option:selected').text());
		return false;
	});

	$('.cancel-movie-status', '#movie-status-select').click(function() {
		$('#movie-status-select').slideUp('fast');
		$('#movie_status').val($('#hidden_movie_status').val());
		$('#movie-status-display').text($('#hidden_movie_status').val());
		$('#movie-status-select').siblings('a.edit-movie-status').show();
		
		return false;
	});

	// Media

	$('#movie-media-select').siblings('a.edit-movie-media').click(function() {
		if ( $('#movie-media-select').is(":hidden") ) {
			$('#movie-media-select').slideDown('fast');
			$(this).hide();
		}
		return false;
	});

	$('.save-movie-media', '#movie-media-select').click(function() {
		$('#movie-media-select').slideUp('fast');
		$('#movie-media-select').siblings('a.edit-movie-media').show();
		$('#movie-media-display').text($('#movie_media > option:selected').text());
		return false;
	});

	$('.cancel-movie-media', '#movie-media-select').click(function() {
		$('#movie-media-select').slideUp('fast');
		$('#movie_media').val($('#hidden_movie_media').val());
		$('#movie-media-display').text($('#hidden_movie_media').val());
		$('#movie-media-select').siblings('a.edit-movie-media').show();
		
		return false;
	});

	// Rating

	$('#movie-rating-select').siblings('a.edit-movie-rating').click(function() {
		if ( $('#movie-rating-select').is(":hidden") ) {
			$('#movie_rating_display').hide();
			$('#movie-rating-select').slideDown('fast');
			$(this).hide();
		}
		return false;
	});

	$('.save-movie-rating', '#movie-rating-select').click(function() {
		var n = $('.star.s').last().prop('id').replace('star-','');
		$('#movie-rating-select').slideUp('fast');
		$('#movie-rating-select').siblings('a.edit-movie-rating').show();
		$('#movie_rating_display').removeClass().addClass('stars-'+n).show();
		$('#movie_rating, #hidden_movie_rating').val(n);
		return false;
	});

	$('.cancel-movie-rating', '#movie-rating-select').click(function() {
		$('#movie-rating-select').slideUp('fast');
		$('#movie_media').val($('#hidden_movie_media').val());
		$('#movie-rating-display').text($('#hidden_movie_media').val());
		$('#movie-rating-select').siblings('a.edit-movie-rating').show();
		$('#movie_rating_display').show();
		return false;
	});

	$('.star').not('.s').hover(
		function() {
			$(this).addClass('on');
			$(this).prevAll().addClass('on');
			$(this).nextAll().removeClass('on');
		},
		function() {
			$(this).removeClass('on');
			$(this).nextAll().removeClass('on');
		}
	);

	$('.star').click(function() {
		$('.star').removeClass('s');
		$(this).addClass('s');
		$(this).prevAll().addClass('s');
		$(this).nextAll().removeClass('s');
	});

	$('input#wpml_save').click(function() {
		wpml.movie.save_details();
	});
});

$ = jQuery;

wpml = {

	movie: {

		get_movie: function(id) {

			$.ajax({
				type: 'GET',
				url: ajax_object.ajax_url,
				data: {
					action: 'tmdb_search',
					type: 'id',
					data: id
				},
				success: function(response) {
						tmdb_data = document.getElementById('tmdb_data');
						while (tmdb_data.lastChild) tmdb_data.removeChild(tmdb_data.lastChild);
						tmdb_data.style.display = 'none';
						wpml.movie.populate(response);
						wpml.movie.images.set_featured(response.poster_path);
				},
				beforeSend: function() {
					$('input#tmdb_search').addClass('button-loading');
				},
				complete: function() {
					$('input#tmdb_search').removeClass('button-loading');
				},
			});

		},

		populate: function(data) {

			$('.tmdb_data_field').each(function() {

				field = this;
				field.value = '';
				type = field.type;
				_id = this.id.replace('tmdb_data_','');

				if ( typeof data[_id] == "object" ) {
					if ( Array.isArray( data[_id] ) ) {
						if ( _id == 'images' ) {
							wpml.movie.images.populate(data.images);
						}
						else {
							_v = [];
							$.each(data[_id], function() {
								_v.push( field.value + this.name );
							});
							field.value = _v.join(', ');
						}
					}
				}
				else {
					_v = ( data[_id] != null ? data[_id] : '' );
					field.value = _v;
				}
				$('.list-table, .button-empty').show();
			});

		},

		populate_select_list: function(data) {

			$('#tmdb_data').append(data.p).show();

			var html = '';

			$.each(data.movies, function() {
				html += '<div class="tmdb_select_movie">';
				html += '	<a id="tmdb_'+this.id+'" href="#">';
				html += '		<img src="'+this.poster+'" alt="'+this.title+'" />';
				html += '		<em>'+this.title+'</em>';
				html += '	</a>';
				html += '	<input type=\'hidden\' value=\''+this.json+'\' />';
				html += '</div>';
			});

			$('#tmdb_data').append(html);
		},

		save_details: function() {

			$.ajax({
				type: 'POST',
				url: ajax_object.ajax_url,
				data: {
					action: 'wpml_save_details',
					post_id: $('#post_ID').val(),
					wpml_details: {
						media: $('#movie_media').val(),
						status: $('#movie_status').val(),
						rating: $('#movie_rating').val()
					}
				},
				beforeSend: function() {
					$('input#wpml_save').addClass('button-loading');
				},
				complete: function() {
					$('input#wpml_save').removeClass('button-loading');
				},
			});

		},

		search_movie: function() {

			$('#tmdb_data > *, .tmdb_select_movie, .tmdb_movie_images').remove();

			type = $('#tmdb_search_type > :selected').val();
			data = $('#tmdb_query').val();
			lang = $('#tmdb_search_lang').val();

			if ( type == 'title' )
				wpml.status.set(ajax_object.search_movie_title+' "'+data+'"');
			else if ( type == 'id' )
				wpml.status.set(ajax_object.search_movie+' #'+data);

			$.ajax({
				type: 'GET',
				url: ajax_object.ajax_url,
				data: {
					action: 'tmdb_search',
					type: type,
					data: data,
					lang: lang
				},
				success: function(response) {
					if ( response.result == 'movie' ) {
						wpml.movie.populate(response);
						wpml.movie.images.set_featured(response.poster_path);
					}
					else if ( response.result == 'movies' ) {
						wpml.movie.populate_select_list(response);

						$('.tmdb_select_movie a').click(function(e) {
							e.preventDefault();
							id = this.id.replace('tmdb_','');
							wpml.movie.get_movie(id);
						});
					}
				},
				beforeSend: function() {
					$('input#tmdb_search').addClass('button-loading');
				},
				complete: function() {
					$('input#tmdb_search').removeClass('button-loading');
				},
			});
		},

		images: {

			populate: function(images) {

				$('#tmdb_data_images').val('');

				_v = [];
				$.each(images, function() {
					html  = '<div class="tmdb_movie_images">';
					html += '<a href="#" class="tmdb_movie_image_remove"></a>';
					html += '<img src=\''+ajax_object.base_url_small+this.file_path+'\' data-tmdb=\''+JSON.stringify(this)+'\' alt=\'\' />';
					html += '</div>';
					$('#tmdb_images_preview').append(html);
					_v.push(ajax_object.base_url_original+this.file_path);
				});
				$('#tmdb_data_images').val(_v.join(','));

				$('.tmdb_movie_image_remove').click(function(e) {
					e.preventDefault();
					$(this).parent('.tmdb_movie_images').remove();
					_v = [];
					$('.tmdb_movie_images').each(function() {
						j = $.parseJSON($(this).find('img').attr('data-tmdb'));
						_v.push(ajax_object.base_url_original+j.file_path);
					});
					$('#tmdb_data_images').val(_v.join(','));
				});

				$('#tmdb_save_images').click(function(e) {
					e.preventDefault();
					wpml.movie.images.save();
				});
				
				$('#tmdb_save_images').show();

			},

			save: function() {

				img   = $('#tmdb_data_images').val().split(',');
				title = $('#tmdb_data_title').val();
				total = img.length;

				$('#progressbar').progressbar({
					value: false
				}).show();

				$.each(img, function(i) {
					i = i+1;
					wpml.status.set(ajax_object.save_image+' #'+i);
					$.ajax({
						type: 'GET',
						url: ajax_object.ajax_url,
						data: {
							action: 'tmdb_save_image',
							image: this,
							post_id: $('#post_ID').val(),
							title: title+' − Photo '+i
						},
						success: function(_r) {
							v = $('#tmdb_data_images').val();
							$('#tmdb_data_images').val(v.replace(img,''));
							
						},
						complete: function() {
							$('#progressbar').progressbar({
								value: ( $('#progressbar').progressbar('value') + ( 100 / total ) )
							});
							$('.progress-label').text($('#progressbar').progressbar('value') + '%');
						}
					});
				});
				$('.tmdb_movie_images').remove();

			},

			set_featured: function(image) {

				if ( ! $('#wpml-tmdb') || wp.media.featuredImage.get() > 0 )
					return false;

				wpml.status.set(ajax_object.set_featured);
				title = $('#tmdb_data_title').val();

				$.ajax({
					type: 'GET',
					url: ajax_object.ajax_url,
					data: {
						action: 'tmdb_set_featured',
						image: image,
						post_id: $('#post_ID').val(),
						title: title+' − '+ajax_object.poster
					},
					success: function(r) {
						if (r) {
							wp.media.featuredImage.set(r);
							wpml.status.set(ajax_object.done);
						}
						else {
							wpml.status.set(ajax_object.oops);
						}
					}
				});

			},
		},
	},

	import: {

		target: {},

		get_movie: function(id) {

			$.ajax({
				type: 'GET',
				url: ajax_object.ajax_url,
				data: {
					action: 'tmdb_search',
					type: 'id',
					data: id,
					_id: post_id
				},
				success: function(response) {
						/*tmdb_data = document.getElementById('tmdb_data');
						while (tmdb_data.lastChild) tmdb_data.removeChild(tmdb_data.lastChild);
						tmdb_data.style.display = 'none';
						wpml.movie.populate(response);
						wpml.movie.images.set_featured(response.poster_path);*/
						console.log(response);
				},
				beforeSend: function() {
					$('input#tmdb_search').addClass('button-loading');
				},
				complete: function() {
					$('input#tmdb_search').removeClass('button-loading');
				},
			});

		},

		get_movies: function() {

			$('.movies > tbody input[type=checkbox]:checked').each(function(i) {

				post_id = this.value;
				tr      = $(this).parents('tr');
				tr.prop('id', 'p_'+post_id);

				title = tr.find('.movietitle span.movie_title').text();

				if ( ! post_id.length ) {
					console.log('!post_id');
					return false;
				}

				wpml.import.search_movie(title);
			});
			
		},
		
		populate_movie: function(data) {
			console.log(data);
			$.each(data, function() {
				//TODO: populate fields and spans
			});
		},
		
		populate_select_list: function(data) {

			var html = '';

			$.each(data.movies, function() {
				html += '<div class="tmdb_select_movie">';
				html += '	<a id="tmdb_'+this.id+'" href="#">';
				html += '		<img src="'+this.poster+'" alt="'+this.title+'" />';
				html += '		<em>'+this.title+'</em>';
				html += '	</a>';
				html += '	<input type=\'hidden\' value=\''+this.json+'\' />';
				html += '</div>';
			});

			html = '<tr class="wpml-import-movie-select"><td colspan="6"><div class="tmdb_select_movies">'+html+'</div></td></tr>'

			wpml.import.target.after(html);
		},

		search_movie: function(title) {

			$.ajax({
				type: 'GET',
				url: ajax_object.ajax_url,
				data: {
					action: 'tmdb_search',
					type: 'title',
					data: title,
					lang: '',
					_id: post_id
				},
				success: function(response) {

					tr = $('#p_'+response._id);
					wpml.import.target = tr;

					if ( response.result == 'movie' ) {
						wpml.import.populate_movie(response);
					}
					else if ( response.result == 'movies' ) {
						wpml.import.populate_select_list(response);

						$('.tmdb_select_movie a').unbind('click').bind('click', function(e) {
							e.preventDefault();
							_id = this.id.replace('tmdb_','');
							wpml.import.get_movie(_id);
						});
					}
				},
				beforeSend: function() {
					$('input#doaction').addClass('button-loading');
				},
				complete: function() {
					$('input#doaction').removeClass('button-loading');
				},
			});

		},
		
		set_target: function(wot) {
			this.target = wot;
		},
	},

	status: {

		set: function(message) {
			$('#tmdb_status').text(message);
		},

		clear: function() {
			$('#tmdb_status').empty();
		}
		
	},

};