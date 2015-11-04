Template.season.helpers({
  episodes: function() {
    return Episodes.find({
      showId: Session.get('show_id'),
      season: this.number
    });
  }
});

Template.season.events({
  'click .mark': function(ev) {
    alert('Coming soon!');
  }
})
