_ = lodash;
SeenEpisodes = new Mongo.Collection('seen_episodes');

Meteor.methods({
  ToggleSeenEpisode: function(query, seen) {
    return SeenEpisodes.upsert(query, {
      $set: { seen: seen }
    });
  }
});
