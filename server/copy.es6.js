Meteor.startup(() => {
  _.extend(Meteor,
    {
      copies : {
        "subjects": {
          "loginAccess" : "David from Double: Your Dashboard Access"
        }
      }
    }
  );
});
