Template.show_info.helpers({
  tv_show: function() {
    return Shows.findOne( { id: Session.get('show_id') } );
  },
  formatted_genre: function() {
    let show = Shows.findOne( { id: Session.get('show_id') } );
    return show.genres.join(', ');
  }

});
