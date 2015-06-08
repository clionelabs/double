Template.channelMessage.onRendered(function() {
  let $messageDiv = this.$(".message").parent();
  $messageDiv.scrollTop($messageDiv.prop("scrollHeight"));
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
