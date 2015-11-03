Meteor.methods({
  ToggleSeenEpisode: function(query, seen) {
    return SeenEpisodes.upsert(query, {
      $set: { seen: seen }
    });
  }
});
