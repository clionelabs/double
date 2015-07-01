Template.assistantUnroutedDashboard.helpers({
  channels() {
    let showSpam = Template.currentData().isShowSpam === 'true';
    let selector = { customerId: { $exists: false }};
    if (!showSpam) {
      _.extend(selector, { isSpam : false });
    }
    return D.Channels.find(selector);
  },
  isSelectedClass() {
    return this._id === Session.get(SessionKeys.CURRENT_UNASSIGNED_CHANNEL_ID)? "active": "";
  },
  getCurrentSelectedChannel() {
    let channelId = Session.get(SessionKeys.CURRENT_UNASSIGNED_CHANNEL_ID);
    return channelId? D.Channels.findOne(channelId): null;
  }
});

Template.assistantUnroutedDashboard.onRendered(function() {
  let isShowSpam = Template.currentData().isShowSpam === 'true';
  this.$('#show-spam-checkbox').prop("checked", isShowSpam);
});

Template.assistantUnroutedDashboard.events({
  "click #show-spam-checkbox": function(event) {
    Router.go('assistant.unrouted', {}, { query : "isShowSpam=" + event.target.checked });
  },

  "click .select-channel": function() {
    Session.setAuth(SessionKeys.CURRENT_UNASSIGNED_CHANNEL_ID, this._id);
  },

  "click .set-channel": function(event) {
    event.stopPropagation();
    let channel = this;
    Session.setAuth(SessionKeys.CURRENT_UNASSIGNED_CHANNEL_ID, null);
    Modal.show('channelSettingsModal', channel);
  }
});
