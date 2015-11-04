Template.search.helpers({
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
