Email.from = "david@askdouble.com";

Email.shouldSendRealEmail = () => {
  let onProduction = (process.env.NODE_ENV === 'production');
  let enableInNonProduction = Meteor.settings.email.enableInNonProduction;
  return (onProduction || enableInNonProduction);
};

Email.configureEmail = () => {
  if (Email.shouldSendRealEmail()) {
    var smtpSettings = Meteor.settings.email.smtp;
    var username = encodeURIComponent(smtpSettings.username);
    var password = smtpSettings.password;
    var host = smtpSettings.host;
    var port = smtpSettings.port;
    process.env.MAIL_URL = 'smtp://' + username + ':' + password +
      '@' + host + ':' + port;
    console.info('[System] Email configured: ', process.env.MAIL_URL);
  } else {
    console.info('[System] Not in production mode. Sending all email to console.');
  }
};

Email.configureTemplates = () => {

  let emailTemplates = ['loginAccess'];

  _.each(emailTemplates, (emailTemplate) => {
    SSR.compileTemplate(emailTemplate, Assets.getText('email_templates/' + emailTemplate + '.html'));
    Email[s.capitalize(emailTemplate)] = {
      send : (to, dataContext) => {
        Email._sendTemplate(emailTemplate, to, dataContext);
      }
    };
  });

};

Email.validateMailgun = (apiKey, token, timestamp, signature) => {
  let crypto = Meteor.npmRequire('crypto');
  let hmac = crypto.createHmac('SHA256', apiKey);

  return signature === hmac.update(timestamp + token).digest('hex');
};

Email._sendTemplate = (templateName, to, dataContext) => {
  let content = SSR.render(templateName, dataContext);

  Email.send({
    "from": Email.from,
    "to": to,
    "subject": Meteor.copies.subjects[templateName],
    "html": content
  });
};

Meteor.startup(() => {
  Email.configureEmail();
  Email.configureTemplates();
});
