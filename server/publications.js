Meteor.publish('shows', function(show_id) {
  try {
    API.get( TV_MAZE.shows(show_id) ).then( (show) => {
      // Shows come with an 'id' field, but we're going to ditch that in favor
      // of mongo-style `_id` fields, set to the same value.
      let show_data = _.omit(show, 'id');
      this.added('shows', parseInt(show_id), show_data);
      
      this.ready();
    }, (err) => {throw err;} );
    
  } catch(err) {
    console.log("Error fetching Shows from API:", err)
  }
});

Meteor.publish('episodes', function(show_id) {
  try {
    API.get( TV_MAZE.episodes(show_id) ).then( (episodes) => {
      episodes.forEach( (episode) => {
        let episode_id = episode.id;
        
        // Check if this user has seen this episode
        if ( this.userId ) {
          let seen_episode = SeenEpisodes.findOne({
            userId: this.userId,
            episodeId: episode_id
          });
          
          episode.seen = seen_episode ? seen_episode.seen : false;
        }
        
        // Add the show ID as a reference to the episode
        let episode_data = _.assign(
          _.omit(episode, 'id'), 
          { showId: parseInt(show_id) }
        );
        
        this.added('episodes', episode_id, episode_data);
      });
      this.ready();
    }, (err) => {throw err;} );
    
  } catch(err) {
    console.log("Error fetching Episodes from API:", err)
  }
});

Meteor.publish('seen_episodes', function() {
  console.log("Publishing for user", this.userId)
  return SeenEpisodes.find({
    userId: this.userId
  });
});

Meteor.publish('starred_shows', function() {
  return StarredShows.find({
    userId: this.userId
  });
});
