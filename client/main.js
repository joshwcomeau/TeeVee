_ = lodash;
SeenEpisodes = new Mongo.Collection('seen_episodes');

// Local-only Collections
Shows     = new Mongo.Collection(null);
Seasons   = new Mongo.Collection(null);
Episodes  = new Mongo.Collection(null);

// Using TVMAZE API for all TV show lookups.
const TV_API = {
  search: (query) => {
    return `http://api.tvmaze.com/search/shows?q=${query}`;
  },
  get_show: (id) => {
    return `http://api.tvmaze.com/shows/${id}`;
  },
  get_episodes: (id) => {
    return `http://api.tvmaze.com/shows/${id}/episodes`;
  }
};


Meteor.startup(function () {
  Meteor.typeahead.inject();
});


Template.season_list.helpers({
  seasons: function() {
    return Seasons.find({
      showId: Session.get('show_id')
    });
  },
  loaded: function() {
    return Session.get('show_id');
  }
});

Template.season.helpers({
  episodes: function() {
    return Episodes.find({
      showId: Session.get('show_id'),
      season: this.number
    });
  }
});

Template.show_info.helpers({
  tv_show: function() {
    return Shows.findOne( { id: Session.get('show_id') } );
  },
  formatted_genre: function() {
    let show = Shows.findOne( { id: Session.get('show_id') } );
    return show.genres.join(', ');
  }

});

Template.season.events({
  'click .mark': function(ev) {
    alert('Coming soon!');
  }
})

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
      userId:     Meteor.user()._id,
      showId:     this.showId,
      episodeId:  this.id
    }
    
    Meteor.call('ToggleSeenEpisode', query, seen);
  }
});

Template.search.helpers({
  // Typeahead handler: Fetches TV show name and IDs from the API.
  retrieveSuggestions: function(query, sync, callback) {
    Meteor.http.call("GET", TV_API.search(query), (err, response) => {
      if (err) return console.log("Found error:", err);
      
      // Format API response for typeahead list.
      let show_names = response.data.map( (result) => {
        let show = result.show;
        
        // Show the country code as part of the name if not US.
        if ( show.network && show.network.country && show.network.country.code && show.network.country.code !== 'US') {
          show.name += ` (${show.network.country.code})`
        }
        
        return {
          value:    show.name,
          id:       show.id
        };
      });
      
      return callback( show_names );
    });
  },
  
  // Select a show; show all the episodes and their status
  selectShow: function(ev, suggestion, dataset) {
    // We need to do a few things here:
    // - retrieve full show details from API
    // - retrieve episode list from API
    // - retrieve our `seen` data from Mongo
    // - set our local Session state variables
    
    // TODO: Cache the requested show info so I don't have to re-fetch every time.
    
    // Retrieve Show info and episodes
    let show_info_promise = get_show_info(suggestion.id);
    let episodes_promise  = get_episodes(suggestion.id);
    
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
      
    }, (reason) => {
      console.log("FAILED to fetch TV show info:", reason)
    });
  }
});




// Private Client methods

function get_show_info(show_id) {
  return new Promise( (resolve, reject) => {
    Meteor.http.call("GET", TV_API.get_show(show_id), (err, response) => {
      if (err) return reject(err);
      resolve(response.data);
    });
  });
}

function get_episodes(show_id) {
  return new Promise( (resolve, reject) => {
    Meteor.http.call("GET", TV_API.get_episodes(show_id), (err, response) => {
      if (err) return reject(err);
      resolve(response.data);
    });
  });
}
