Feedback.ProtoType.sendEmail = function() {
  const task = Tasks.findOne(this.taskId);
  const customer = Users.findOneCustomer(this.customerId);
  const emailFrom = 'founders@double.co';
  const emailTo = customer.emails[0].address;
  Email.send({
    from: emailFrom,
    to: emailTo,
    subject: 'Help make Double better',
    text : `
${customer.profile.firstname},

Your Double recently spent ${task.totalDurationInMinutes()} minutes to complete your request, "${task.title}".

How would you rate our service? Simply reply to this email with 1 - 5 (1 being very unsatisfied and 5 being very satisified). Any other feedback on how we can make Double better for you?

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
