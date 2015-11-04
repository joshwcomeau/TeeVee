Template.episode.helpers({
  
});

Template.episode.events({
  'change .episode-checkbox': function(ev) {
    let seen = $(ev.target).is(":checked");
    
    console.log("Episode context", this)
    
    // Update our local Collection
    console.log(Episodes.find(this._id));
    // Episodes.update(this._id, {
    //   $set: { seen: seen }
    // });
    
    // Update the DB on the server
    let query = {
      userId:     Meteor.userId(),
      showId:     this.showId,
      episodeId:  this._id
    }
    
    Meteor.call('ToggleSeenEpisode', query, seen);
  }
});
