Template.assistantUnroutedDashboard.helpers({
  channels() {
    let showSpam = Template.currentData().isShowSpam === 'true';
    let selectedChannelId = Template.currentData().selectedChannelId;
    let selector = { customerId: { $exists: false }};
    if (showSpam) {
      _.extend(selector, { isSpam: true });
    } else {
      _.extend(selector, { isSpam: {$ne: true} });
    }
    let channels = D.Channels.find(selector).fetch();
    return _.map(channels, function(channel){
      return _.extend({}, channel, { isCurrent : channel._id === selectedChannelId });
    });
  },
  isSelectedClass() {
    let channel = this;
    return (channel.isCurrent) ? "active": "";
  },
  getCurrentSelectedChannel() {
    let channelId = Template.currentData().selectedChannelId;
    return channelId ? D.Channels.findOne(channelId) : null;
  }
});

Template.assistantUnroutedDashboard.onRendered(function() {
  let isShowSpam = Template.currentData().isShowSpam === 'true';
  this.$('#show-spam-checkbox').prop("checked", isShowSpam);
});

Template.assistantUnroutedDashboard.events({
  "click #show-spam-checkbox": function(event) {
    let showSpam = Template.currentData().isShowSpam === 'true';
    Router.go('assistant.unrouted', {}, { query : "isShowSpam=" + event.target.checked });
  },

  "click .select-channel": function() {
    let isShowSpam = Template.currentData().isShowSpam === 'true';
    let channel = this;
    let selectedChannelId = this._id;
    Router.go('assistant.unrouted',
        {},
        { query : "isShowSpam=" + isShowSpam + "&selectedChannelId=" + selectedChannelId });
  },

  "click .set-channel": function(event) {
    event.stopPropagation();
    let channel = this;
    Session.setAuth(SessionKeys.CURRENT_UNASSIGNED_CHANNEL_ID, null);
    Modal.show('channelSettingsModal', channel);
  }
});
