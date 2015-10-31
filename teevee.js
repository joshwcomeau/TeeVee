Episodes = new Mongo.Collection('episodes');

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


  Template.body.helpers({
    episodes: () => {
      return Episodes.find({});
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
      console.log("Selected", suggestion);
      // We need to do a few things here:
      // - retrieve full show details from API
      // - retrieve episode list from API
      // - retrieve our `seen` data from Mongo
      // - set our local Session state variables
      
      
      // Retrieve Show info and episodes
      let show_info_promise = get_show_info(suggestion.id);
      let episodes_promise  = get_episodes(suggestion.id);
      
      Promise.all([show_info_promise, episodes_promise]).then( (values) => {
        let episodes = values[0];
        let show_info = values[1]
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
