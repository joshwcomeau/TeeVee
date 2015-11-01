_ = lodash;
SeenEpisodes = new Mongo.Collection('seen_episodes');

// Local-only Collection
Shows = new Mongo.Collection(null);

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



if (Meteor.isServer) {
  Meteor.methods({
    ToggleSeenEpisode: function(query, seen) {
      return SeenEpisodes.upsert(query, {
        $set: { seen: seen }
      });
    }
  });
}

if (Meteor.isClient) {
  Meteor.startup(function () {
    Meteor.typeahead.inject();
  });


  Template.episode_list.helpers({
    seasons: () => {
      let show = Shows.findOne({ id: Session.get('show_id') });
      if (!show) return undefined;

      return _.values(_.groupBy(show.episodes, 'season'));
    }
  });
  
  Template.show_info.helpers({
    tv_show: () => {
      return Shows.findOne({ id: Session.get('show_id') });
    },
    formatted_genre: () => {
      let show = Shows.findOne({ id: Session.get('show_id') });
      return show.genres.join(', ');
    }

  });
  
  Template.season.events({
    'click .mark.all': function(ev) {
      console.log("Season", this)
      // Create a new copy of the episodes array, mark them all as seen.
      let episodes = _.map(this, (episode) => {
        console.log("Mapping ", episode);
        episode.seen = true;
        return episode;
      });
      
      let show = Shows.findOne({ id: Session.get('show_id')});
      Shows.update(show._id, {
        $set: { episodes: episodes }
      });

    }
  })

  Template.episode.events({
    'change .episode-checkbox': function(ev) {
      
      // Check to see if this episode has a database entry already for this user
      let query = {
        userId:     Meteor.user()._id,
        showId:     this.show_id,
        episodeId:  this.id
      }
      
      // Update our local Collection
      this.seen = $(ev.target).is(":checked");
      let show = Shows.findOne({ id: Session.get('show_id')});
      let episodes = show.episodes;
      let episode_index = _.findIndex(episodes, {id: this.id});
      episodes.splice(episode_index, 1, this);
      
      Shows.update(show._id, {
        $set: { episodes: episodes }
      });
      
      Meteor.call('ToggleSeenEpisode', query, $(ev.target).is(":checked"));      
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
    goToShow: function(ev, suggestion, dataset) {
      // We need to do a few things here:
      // - retrieve full show details from API
      // - retrieve episode list from API
      // - retrieve our `seen` data from Mongo
      // - set our local Session state variables
      
      // TODO: Cache the requested show info so I don't have to re-fetch every time.
      
      
      // Retrieve Show info and episodes
      let show_info_promise = get_show_info(suggestion.id);
      let episodes_promise      = get_episodes(suggestion.id);
      
      Promise.all([show_info_promise, episodes_promise]).then( (values) => {
        let show_info = values[0];
        let episodes  = values[1];
        
        // Trim and combine the API response into something more manageable
        let trimmed_show = _.pick(show_info, 'id', 'name', 'type', 'genres', 'status', 'image', 'summary');
        trimmed_show.episodes = _.map(episodes, (episode) => {
          let trimmed_episode = _.pick(episode, 'id', 'name', 'season', 'number', 'airdate', 'summary');
          // Attach some basic show info to each episode
          trimmed_episode.show_id = trimmed_show.id;
          trimmed_episode.show_name = trimmed_show.name;
          
          // Figure out if this user has seen this episode
          let seen_episode = SeenEpisodes.findOne({ 
            userId: Meteor.user()._id, 
            episodeId: trimmed_episode.id
          });
          
          if ( seen_episode ) {
            trimmed_episode.seen = seen_episode.seen;
          }

          return trimmed_episode;
        });
        
        Shows.insert(trimmed_show);
        
        Session.set('show_id', trimmed_show.id);
        
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
}

