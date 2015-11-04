Template.episode.events({
  'change .episode-checkbox': function(ev) {
    let seen = $(ev.target).is(":checked");
    
    // Update our local Collection
    Episodes.update( {
      id: this.id
    }, {
      $set: { seen: seen }
    });
    
    // Update the DB on the server
    let query = {
      userId:     Meteor.userId(),
      showId:     this.showId,
      episodeId:  this.id
    }
    
    Meteor.call('ToggleSeenEpisode', query, seen);
  }
});
