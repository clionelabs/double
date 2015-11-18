Template.registerHelper('enableIfIsEditing', function(isEditing) {
  return isEditing.get() ? "false" : "true";
});

Template.registerHelper("formatMessage", function(text) {
  text = Blaze.toHTMLWithData(UI._globalHelpers['emojione'], text);
  text = UI._globalHelpers['nl2br'](text);
  return text;
});

Template.registerHelper('isAdmin', function() {
  return Meteor.userId() && Users.isAdmin(Meteor.userId());
});

Template.registerHelper('getSelectChannelData', function () {
  let customer = Template.currentData().currentCustomer;
  return { _id : customer._id };
});
