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
  },
  isPending() {
    return this.inOut !== D.Messages.InOut.IN && this.inOut !== D.Messages.InOut.OUT;
  }
});

Template.channelMessage.events({
  'click .cancel': function(e) {
    e.preventDefault();
    D.Messages.remove(this._id);
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

Template.channelReply._submit = function(form) {
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
    $(form.content).css('height', 'auto');
    $(form.content).removeAttr("disabled");
  });
}

Template.channelReply.onRendered(function() {
  $("textarea.autogrow").autogrow({animate: false});
});

Template.channelReply.events({
  "keydown textarea.autogrow": function (e) {
    if (e.keyCode == 13 && !e.shiftKey && !e.ctrlKey && !e.altKey) {
      event.preventDefault();
      let form = event.target.form;
      Template.channelReply._submit(form);
    }
  },

  "submit #send-message-form": function (event) {
    event.preventDefault();
    let form = event.target;
    Template.channelReply._submit(form);
  }
});
