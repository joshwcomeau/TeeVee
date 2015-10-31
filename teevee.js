Episodes = new Mongo.Collection('episodes');

// Using TVMAZE API for all TV show lookups.
const TV_API = {
  search: 'http://api.tvmaze.com/search/shows?q='
};

if (Meteor.isServer) {
  
  Meteor.methods({
    searchForShow: function(query, options) {
      options = options || {};
      let api_url = TV_API.search+query;
      // this.unblock();

      return Meteor.http.call("GET", api_url);
      
    },
    getShowEpisodes: function(show_id) {
      
    }
  });
}

if (Meteor.isClient) {
  Meteor.startup(function () {
    Meteor.typeahead.inject();
  });

  // counter starts at 0
  Session.setDefault('counter', 0);

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
    searchForShow: function(query, sync, callback) {
      console.log("Search helper fired!");
      Meteor.call('searchForShow', query, {}, function(err, response) {
        if (err) return console.log("Found error:", err);
        
        console.log("Context", this);
        console.log("Response:", response);
        
        // Format API response for typeahead list.
        let show_names = response.map( (show) => { 
          { value: show.name }
        });
        
        return callback( show_names );
      });
    }
  });
}

