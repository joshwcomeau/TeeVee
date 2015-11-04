Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading'
});

Router.route('/', {
  name: 'home'
});

Router.route('/shows/:id', {
  name: 'show',
  waitOn: function() {
    return [
      Meteor.subscribe('shows_api', this.params.id),
      Meteor.subscribe('episodes_api', this.params.id),
      Meteor.subscribe('seen_episodes'),
      Meteor.subscribe('starred_shows')
    ];
  },
  data: function() { 
    return Shows.findOne( parseInt(this.params.id) ); 
  }
});
