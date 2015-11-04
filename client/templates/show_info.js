Template.show_info.helpers({
  formatted_genre: function() {
    return this.genres.join(', ');
  }
});

Template.show_info.events({
  'click .starred': function() {
    
  },
})
