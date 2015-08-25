Template.channelMessage.onRendered(function() {
  let $messageDiv = this.$(".message").parents(".selected-channel-messages");
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
  },
  taggedTasks() {
    if (this.taggedTaskIds) {
      let messageId = this._id;
      return Tasks.find({_id: {$in: this.taggedTaskIds}}).map(function(task) {
        return _.extend(task, {messageId: messageId});
      });
    } else {
      return [];
    }
  }
});

Template.channelMessage.events({
  'click .cancel': function(e) {
    e.preventDefault();
    D.Messages.remove(this._id);
  },
  'click .remove-tag': function(e) {
    e.stopPropagation();
    let taskId = this._id;
    let messageId = this.messageId;
    Messages.removeTask(messageId, taskId);
  },
  'click .task-tag .title': function() {
    let taskId = this._id;
    Router.go('assistant.tasks', {_id: taskId});
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
    let selectedMessageIds = this.selectedMessageIdsVar.get();
    return this.messages({sort: {timestamp: 1}}).map(function(message) {
      return _.extend(message, {
        selected: selectedMessageIds[message._id]
      });
    });
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
  },
  "click .selection": function() {
    let selectedChannel = Template.currentData();
    let messageIds = selectedChannel.selectedMessageIdsVar.get();
    if (messageIds[this._id]) {
      delete messageIds[this._id];
    } else {
      messageIds[this._id] = true;
    }
    selectedChannel.selectedMessageIdsVar.set(messageIds);
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

  let doc = {
    channelId: channelId,
    content: content,
    inOut: D.Messages.InOut.OUTING,
    timestamp: moment().valueOf()
  };
  D.Messages.insert(doc, function(error) {
    // TODO: handle error
  });
  $(form.content).val('');
  $(form.content).css('height', 'auto');
  return true;
};

Template.channelReply.onRendered(function() {
  $("textarea.autogrow").autogrow({animate: false});
});

Template.channelReply.onCreated(function() {
  this.selectedEmojiCategory = new ReactiveVar('people');
});

Template.channelReply.helpers({
  emojiListCategories() {
    let instance = Template.instance();
    let selectedCategory = instance.selectedEmojiCategory.get();
    let extendedList = _.map(emojiList, function(emoji) {
      return {
        category: emoji.category,
        example: emoji.items[0],
        selected: selectedCategory === emoji.category
      }
    });
    return extendedList;
  },
  emojiItems() {
    let instance = Template.instance();
    let selectedCategory = instance.selectedEmojiCategory.get();
    let items = [];
    _.each(emojiList, function(emoji) {
      if (emoji.category === selectedCategory) {
        items = emoji.items;
      }
    });
    return items;
  }
});

Template.channelReply.events({
  "keydown textarea.autogrow": function (e, tmpl) {
    if (e.keyCode === 13 && !e.shiftKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      tmpl.$('button[type="submit"]').click();
    } else {
      return true;
    }
  },

  "submit #send-message-form": function (event) {
    event.preventDefault();
    let form = event.target;
    Template.channelReply._submit(form);
    return true;
  },

  "click .emoji-category": function(event) {
    event.preventDefault();
    event.stopPropagation();
    let instance = Template.instance();
    instance.selectedEmojiCategory.set(this.category);
    return true;
  },

  "click .emoji-item": function(event) {
    let code = `:${this}:`;
    let $textarea = $("#send-message-form").find("#content");
    $textarea.val($textarea.val() + code);
    $textarea.focus();
    return true;
  }
});
