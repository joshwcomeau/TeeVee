Template.show_info.helpers({
  formatted_genre: function() {
    return this.genres.join(', ');
  }
});

Template.show_info.events({
  'mouseover i': function() {
    console.log(this);
  },
})
