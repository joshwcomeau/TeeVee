Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  waitOn: () => Meteor.subscribe('seen_episodes')
});

Router.route('/', { 
  name: 'home' 
});

Router.route('/shows/:id', function() {
  // We need to do a few things here:
  // - retrieve full show details from API
  // - retrieve episode list from API
  // - retrieve our `seen` data from Mongo
  // - set our local Session state variables
  
  // TODO: Cache the requested show info so I don't have to re-fetch every time.
  
  // TODO: Refactor this into several collection methods, if those exist.
  // Invoke them here, with promises as needed.
  
  // Retrieve Show info and episodes
  let show_info_promise = API.get(TV_MAZE.shows(this.params.id));
  let episodes_promise  = API.get(TV_MAZE.episodes(this.params.id));
  
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
        let seen_episode = SeenEpisodes.findOne({
          userId: Meteor.user()._id,
          episodeId: episode.id
        });
        
        episode.seen = seen_episode ? seen_episode.seen : false;
        
        // Insert it into our local (front-end) DB.
        // Used in the `season_list` template (and nested templates below)
        Episodes.insert(episode)
        
      });
    });
            
    // Update the session, so we can easily look this show and these episodes
    // up in the template helpers.
    Session.set('show_id', show_id);
    
    return this.render('show'); 
    
  }, (reason) => {
    console.log("FAILED to fetch TV show info:", reason)
  });
}, {
  name: 'show',
});