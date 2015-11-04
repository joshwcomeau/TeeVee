Template.season.helpers({
  season_num: function() {
    return this[0].season;
  }
});

Template.season.events({
  'click .mark': function(ev) {
    alert('Coming soon!');
  }
})
