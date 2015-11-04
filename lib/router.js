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
      Meteor.subscribe('shows', this.params.id),
      Meteor.subscribe('episodes', this.params.id)
    ];
  },
  data: function() { 
    return Shows.findOne( parseInt(this.params.id) ); 
  }
});
