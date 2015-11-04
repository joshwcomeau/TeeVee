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
      Meteor.subscribe('seen_episodes'),
      ShowLoader.load(this.params.id)
    ];
  },
  data: function() { 
    return Shows.findOne({ id: parseInt(this.params.id) }); 
  }
});
