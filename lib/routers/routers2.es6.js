/**
 * We make a separate routers2 file here to avoid the mysterious Handler with name 'C' exists error
 * That's the only reason to have separate routers file. Can merge them if the error is fixed
 */
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

