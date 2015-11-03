// Local-only Collections
Shows     = new Mongo.Collection(null);
Seasons   = new Mongo.Collection(null);
Episodes  = new Mongo.Collection(null);


Template.layout.rendered = function() {
  Meteor.typeahead.inject();
};


Template.season_list.helpers({
  seasons: function() {
    return Seasons.find({
      showId: Session.get('show_id')
    });
  },
  loaded: function() {
    // TODO: Replace me with proper routing.
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
      userId:     Meteor.userId(),
      showId:     this.showId,
      episodeId:  this.id
    }
    
    Meteor.call('ToggleSeenEpisode', query, seen);
  }
});

Template.header.helpers({
  // Typeahead handler: Fetches TV show name and IDs from the API.
  retrieveSuggestions: function(query, sync, callback) {
    API.get(TV_MAZE.search(query)).then( (response) => {
      // Format API response for typeahead list.
      let show_names = response.map( (result) => {
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
    }, (err) => {
      return console.log("Error fetching suggestions from TV api:", err);
    });
  },
  
  // Select a show; show all the episodes and their status
  selectShow: function(ev, suggestion, dataset) {
    Router.go('show', { id: suggestion.id });
  }
});
