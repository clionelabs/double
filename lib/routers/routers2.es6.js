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

/**
 * Redirect to the approimate url
 *   if channel is assigned to customer
 *     go to customer tab with the channel selected
 *   otherwise,
 *     go to incoming tab with the channel selected
 */
Router.route('channel/:_id', {
  name: 'channel.default',

  where: 'server',

  action() {
    let channelId = this.params._id;
    let channel = D.Channels.findOne(channelId);
    let url;
    if (channel.customerId) {
      url = Router.routes['assistant.customers.selected'].url({
        _id: channel.customerId
      }, {
        query: {selectedChannel: channelId}
      });
    } else {
      url = Router.routes['assistant.unrouted'].url({
      }, {
        query: {selectedChannelId: channelId}
      });
    }

    this.response.writeHead(302, {
      'Location': url
    });
    this.response.end();
  }
});
