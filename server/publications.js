Meteor.publish('seen_episodes', function() {
  return SeenEpisodes.find({
    userId: this.userId
  });
});