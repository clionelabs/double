Feedback.ProtoType.sendEmail = function() {
  const task = Tasks.findOne(this.taskId);
  const customer = Users.findOneCustomer(this.customerId);
  const emailFrom = 'founders@double.co';
  const emailTo = customer.emails[0].address;
  Email.send({
    from: emailFrom,
    to: emailTo,
    bcc: [`cary@double.co`, `thomas@double.co`],
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
    Feedbacks.logEmailSent(feedback._id);
  }
});

Feedbacks.logEmailSent = (feedbackId) => {
  // TODO: We should log the email address we sent to because customer can change email at anytime.
  Feedbacks.update(feedbackId, { $set : { 'isSent' : true , sendAt : moment().valueOf() }});

  const feedback = Feedbacks.findOne({_id: feedbackId});
  const task = Tasks.findOne(feedback.taskId);
  const customer = Users.findOneCustomer(feedback.customerId);
  const emailTo = customer.emails[0].address;
  const url = Router.routes['assistant.tasks'].url({ _id : task._id }); // TODO: refactor
  SlackLog.log('_requests',
    {
      text : `
<!channel>, Feedback email is sent to ${emailTo} for ${task.title} (${url})` ,
      username: 'Double A.I. Parts',
      unfurl_links: true,
      icon_emoji: ':robot_face:'
    });

}
