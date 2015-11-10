let subs = RouterSubs;

Router.route('assistant/tasksSummary', {
  name: 'assistant.tasksSummary',
  onBeforeAction() {
    if (!(Users.isAssistant(Meteor.userId()) || Users.isAdmin(Meteor.userId()))) {
      Router.go("welcome");
    }
    this.next();
  },
  waitOn() {
    return [
      subs.subscribe("myTasks"),
      subs.subscribe("customers")
    ];
  },
  action() {
    this.render('assistantTasksSummary');
  }
});

