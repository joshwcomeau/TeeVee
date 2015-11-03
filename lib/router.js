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
    console.log("Wait On");
    return [
      Meteor.subscribe('seen_episodes'),
      ShowLoader.load(this.params.id)
    ];
  }
});
