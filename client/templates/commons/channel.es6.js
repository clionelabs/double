Template.channelMessage.onRendered(function() {
  let $messageDiv = this.$(".message").parent();
  $messageDiv.scrollTop($messageDiv.prop("scrollHeight"));
});

Template.channelMessage.helpers({
  inOutClass() {
    switch (this.inOut) {
      case D.Messages.InOut.IN:
        return 'in';
      case D.Messages.InOut.OUT:
        return 'out';
      case D.Messages.InOut.OUTING:
        return 'outing';
      case D.Messages.InOut.OUTING_DELIVERED:
        return 'outing_delivered';
      default:
        return '';
    }
  }
});

Template.channelMessages.onCreated(function() {
  let instance = this;
  instance.autorun(function() {
    let customerId = Session.get(SessionKeys.CURRENT_CUSTOMER)._id;
    let channelId = Session.get(SessionKeys.getCustomerSelectedChannelIdKey(customerId));
    let key = SessionKeys.getNumberOfMessageLoadedOfChannelKey(channelId);
    if (!Session.get(key, 0)) {
      Session.setAuth(Meteor.settings.public.messages.defaultLimitOfSubscription);
    }
    instance.subscribe('channelMessagesSorted', channelId, Session.get(key));
  });
});

Template.channelMessages.onDestroyed(function() {
  let channel = this.data;
  let channelId = channel._id;
  Session.setAuth(SessionKeys.getNumberOfMessageLoadedOfChannelKey(channelId),
      Meteor.settings.public.messages.defaultLimitOfSubscription);
});

Template.channelMessages.helpers({
  messages() {
    return this.messages({sort: {timestamp: 1}});
  }
});

Template.channelTitle.helpers({
  templateName() {
    let suffix = s(this.category.toLowerCase()).capitalize().value();
    return `channelTitle${suffix}`;
  }
});

Template.channelReply.events({
  "submit #send-message-form": function (event) {
    event.preventDefault();
    let form = event.target;
    let channelId = form.channelId.value;
    let content = form.content.value;

    let doc = {
      channelId: channelId,
      content: content,
      inOut: D.Messages.InOut.OUTING,
      timestamp: moment().valueOf()
    }
    $(form.content).attr("disabled", "disabled");
    D.Messages.insert(doc, function(error) {
      // TODO: handle error
      $(form.content).val('');
      $(form.content).removeAttr("disabled");
    });
  }
});
