Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading'
});

Router.route('/', { 
  name: 'home' 
});

Router.route('/shows/:id', {
  name: 'show',
  onBeforeAction: function () {
    console.log("Before Action");
    console.log("Current user: ", Meteor.user());
    if ( !Meteor.user() ) {
      this.render('not_authenticated');
      return this.stop();
    } else {
      return this.next();
    }
  },
  waitOn: function() {
    console.log("Wait On");
    return [
      Meteor.subscribe('seen_episodes'),
      ShowLoader.load(this.params.id)
    ];
  }
});