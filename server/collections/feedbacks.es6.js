Feedback.ProtoType.sendEmail = function() {
  const task = Tasks.findOne(this.taskId);
  const customer = Users.findOneCustomer(this.customerId);
  const emailFrom = 'founders@double.co';
  const emailTo = customer.emails[0].address;
  Email.send({
    from: emailFrom,
    to: emailTo,
    subject: 'Make Double suit your needs more',
    text : `
Hi ${customer.profile.firstname}!

Double has just completed your request "${task.title}". From 1 - 10, how would you rate the service? 1 is worst and 10 is the best. We love feedbacks so we can make Double more useful to you. Thanks!

Co-founder,
Cary & Thomas
`
  });
};

Feedbacks.find({ isSent : false }).observe({
  added(feedback) {
    feedback.sendEmail();
    Feedbacks.update(feedback._id, { $set : { 'isSent' : true , sendAt : moment().valueOf() }});
  }
});

