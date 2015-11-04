Meteor.methods({
  ToggleSeenEpisode: function(query, seen) {
    console.log("Toggle seen episode method", query, seen)
    let update = SeenEpisodes.upsert(query, {
      $set: { seen: seen }
    });
    console.log("Result", update);
    return update;
  }
  // ,
  // ToggleStarredShow: function(query, starred) {
  //   return StarredShows.upsert(query, {
  //     $set: { starred: starred }
  //   });
  // }
});
