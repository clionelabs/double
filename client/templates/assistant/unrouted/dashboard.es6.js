Template.assistantUnroutedDashboard.helpers({
  channels() {
    let showSpam = Session.get(SessionKeys.UNASSIGNED_SHOW_SPAM);
    if (showSpam) {
      return D.Channels.find({customerId: {$exists: false}, isSpam: true});
    } else {
      return D.Channels.find({customerId: {$exists: false}, isSpam: {$ne: true}});
    }
  },
  isSelectedClass() {
    return this._id === Session.get(SessionKeys.CURRENT_UNASSIGNED_CHANNEL_ID)? "active": "";
  },
  getCurrentSelectedChannel() {
    let channelId = Session.get(SessionKeys.CURRENT_UNASSIGNED_CHANNEL_ID);
    return channelId? D.Channels.findOne(channelId): null;
  }
});

Template.assistantUnroutedDashboard.events({
  "click #show-spam-checkbox": function(event) {
    Session.set(SessionKeys.UNASSIGNED_SHOW_SPAM, event.target.checked);
    Session.setAuth(SessionKeys.CURRENT_UNASSIGNED_CHANNEL_ID, null);
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
