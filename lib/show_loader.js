// In Meteor, most dependencies are Collections stored in the server's Mongo.
// I need to asynchronously load TV Shows and episodes from an external API,
// and it looks like Meteor works better when it's done reactively.
// This uses Meteor's native Deps.Dependency library to create a new reactive
// data source, to feed the client.

ShowLoader = {
  _shows: [],
  load: function(id) {
    // Default to GET HTTP requests.
    if ( !this._shows[id] ) {
      // If we've never seen this show before, instantiate and fetch it
      this._shows[id] = {
        id: id,
        ready: false,
        readyDeps: new Deps.Dependency
      };
    
      
      fetch_show(id, (err, response) => {
        let show = this._shows[id];
        show.ready = true;
        return show.readyDeps.changed();
      });
    }
  
    let handle = {
      ready: () => {
        let show = this._shows[id];
        show.readyDeps.depend();
        return show.ready;
      }
    }
    
    return handle;
  }
}

let fetch_show = function(id, callback) {
  // We need to do a few things here:
  // - retrieve full show details from API
  // - retrieve episode list from API
  // - retrieve our `seen` data from Mongo
  // - set our local Session state variables
  
  // TODO: Cache the requested show info so I don't have to re-fetch every time.
  
  // TODO: Refactor this into several collection methods, if those exist.
  // Invoke them here, with promises as needed.
  
  // Retrieve Show info and episodes
  let show_info_promise = API.get( TV_MAZE.shows(id) );
  let episodes_promise  = API.get( TV_MAZE.episodes(id) );
  
  Promise.all([show_info_promise, episodes_promise]).then( (values) => {
    let show_info = values[0];
    let episodes  = values[1];
    let show_id   = show_info.id;
    
    // Insert it into our local (front-end) DB.
    // Used in the `show_info` template
    Shows.insert(show_info);
    
    // Group episodes by season
    let seasons = _.values(_.groupBy(episodes, 'season'));
    
    seasons.forEach( (episodes_per_season) => {
      Seasons.insert({
        showId: show_id,
        number: episodes_per_season[0].season,
        length: episodes_per_season.length
      });
      
      episodes_per_season.forEach( (episode) => {
        // point to its parent show
        episode.showId = show_id;
        
        // Figure out if this user has seen this episode
        if ( Meteor.user() ) {
          let seen_episode = SeenEpisodes.findOne({
            userId: Meteor.userId(),
            episodeId: episode.id
          });
          
          episode.seen = seen_episode ? seen_episode.seen : false;
        }
        
        // Insert it into our local (front-end) DB.
        // Used in the `season_list` template (and nested templates below)
        Episodes.insert(episode)
        
      });
    });
            
    // Update the session, so we can easily look this show and these episodes
    // up in the template helpers.
    Session.set('show_id', show_id);
    
    return callback();
    
  }, (reason) => {
    console.log("FAILED to fetch TV show info:", reason)
    return callback(reason);
  });
}
