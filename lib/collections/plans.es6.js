Plans = new Meteor.Collection('plans', {
  transform(doc) {
    return _.extend({}, Plan.ProtoType, doc);
  }
});

/**
 *  @params freeCreditMs
 *  @params name
 *  @params cycle { count , unit }
 *  @params amount
 */
Plan = {
  ProtoType : {
    getCycleDuration() {
      return moment.duration(this.cycle.count, this.cycle.unit);
    }
  }
};

Plans.NoPlan = {
  _id : 'none',
  name : 'No Plan',
  freeCreditMs : 0,
  cycle : 'never',
  amount : 0
};