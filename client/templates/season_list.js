Template.season_list.helpers({
  seasons: function() {
    return Seasons.find({
      showId: Session.get('show_id')
    });
  },
  loaded: function() {
    // TODO: Replace me with proper routing.
    return Session.get('show_id');
  }
});
