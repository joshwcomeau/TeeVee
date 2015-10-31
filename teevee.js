Episodes = new Mongo.Collection('episodes');

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
    getShowEpisodes: function(show_id) {
      
    }
  });
}



if (Meteor.isClient) {
  Meteor.startup(function () {
    Meteor.typeahead.inject();
  });


  Template.episode_list.helpers({
    episodes: () => {
      let show = Shows.findOne({ id: Session.get('show_id') });
      return show ? show.episodes : undefined;
    }
  });
  
  Template.show_info.helpers({
    tv_show: () => {
      return Shows.findOne({ id: Session.get('show_id') });
    }
  });

  Template.episode.events({
    'change .episode-checkbox': function (ev) {
      Episodes.update(this._id, { 
        $set: { seen: !this.seen } 
      });
    }
  });
  
  Template.search.helpers({
    // Typeahead handler: Fetches TV show name and IDs from the API.
    retrieveSuggestions: function(query, sync, callback) {
      Meteor.http.call("GET", TV_API.search(query), (err, response) => {
        if (err) return console.log("Found error:", err);
        
        // Format API response for typeahead list.
        let show_names = response.data.map( (result) => { 
          return { 
            value:  result.show.name, 
            id:     result.show.id
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
      let episodes_promise  = get_episodes(suggestion.id);
      
      Promise.all([show_info_promise, episodes_promise]).then( (values) => {
        let show_info = values[0];
        let episodes  = values[1];
        
        // Trim and combine the API response into something more manageable
        let trimmed_show = _.pick(show_info, 'id', 'name', 'type', 'genres', 'status', 'image', 'summary');
        trimmed_show.episodes = _.map(episodes, (episode) => {
          return _.pick(episode, 'id', 'name', 'season', 'number', 'airdate', 'summary');
        });
        
        Shows.insert(trimmed_show);
        
        Session.set('show_id', trimmed_show.id);
        
        console.log(Shows.findOne({}))
        
        
        
        console.log("All done", values);
      }, (reason) => {
        console.log("FAILED to fetch TV show info:", reason)
      });
    }
  });
}

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
