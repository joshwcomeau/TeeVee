Episodes = new Mongo.Collection('episodes');

// Using TVMAZE API for all TV show lookups.
const TV_API = {
  search: (query) => {
    return `http://api.tvmaze.com/search/shows?q=${query}`
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
    searchForShow: function(query, sync, callback) {
      Meteor.http.call("GET", TV_API.search(query), (err, response) => {
        if (err) return console.log("Found error:", err);
        
        // Format API response for typeahead list.
        let show_names = response.data.map( (result) => { 
          return { 
            value:  result.show.name, 
            id:     result.show.id
          };
        });
        
        console.log("Found show names:", show_names)
        
        return callback( show_names );
      });
    }
  });
}

