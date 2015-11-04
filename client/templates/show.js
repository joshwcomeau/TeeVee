Template.show.helpers({
  seasons: function() {
    let episodes = Episodes.find({
      showId: this._id
    });
    
    // TODO: Don't use fetch, find some reactive way to do this.
    let fetched_episodes = _.values(_.groupBy(episodes.fetch(), 'season'));
    
    // TODO: Augment the episode data with our starter SeenEpisodes data
    // let seen_episodes = SeenEpisodes.find({
    //   
    // });
    
    return fetched_episodes

  }
});