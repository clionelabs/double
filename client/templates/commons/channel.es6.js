Template.channelMessage.onRendered(function() {
  let $messageDiv = this.$(".message").parent();
  if ($messageDiv.hasClass("isBottom")) {
    $messageDiv.scrollTop($messageDiv.prop("scrollHeight"));
  }
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
  let instance = Template.instance();
  instance.autorun(function() {
    let channelId = Template.currentData()._id;
    instance.currentNumberOfSubscription = Meteor.settings.public.messages.defaultLimitOfSubscription;
    instance.subscribe('channelMessagesSorted', channelId, instance.currentNumberOfSubscription, function() {
      instance.$('.selected-channel-messages').addClass("isBottom");
      instance.$('.selected-channel-messages').scroll(function(e) {
        if ($(this).scrollTop() + $(this).height() > $(this).prop('scrollHeight') - 50) {
          $(this).addClass("isBottom");
        } else if ( ($(this).scrollTop() + $(this).height() <= $(this).prop('scrollHeight') - 50) &&
            ($(this).scrollTop() + $(this).height() > $(this).prop('scrollHeight') - 150) ) {
          $(this).removeClass("isBottom");
        }
      });
    });
  });
});

Template.channelMessages.helpers({
  messages() {
    return this.messages({sort: {timestamp: 1}});
  },
  loadingSpinner() {

    return "fa-spin fa-spinner";
  }
});

Template.channelMessages.events({
  "click .load-more" : function(e, instance) {
    instance.currentNumberOfSubscription += Meteor.settings.public.messages.increase;
    $('.load-more>.loading-indicator').addClass('fa-spin').addClass('fa-spinner').removeClass('fa-angle-up');
    instance.subscribe('channelMessagesSorted', instance.data._id, instance.currentNumberOfSubscription, function() {
      $('.load-more>.loading-indicator').removeClass('fa-spin').removeClass('fa-spinner').addClass('fa-angle-up');
    });
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
    if (!content) return false;

    // avoid sending multiple times
    if ($(form.content).attr("disabled")) {
      return false;
    }

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
