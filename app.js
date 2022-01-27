const express = require('express');

const app = express();
const port = 3000 || process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const sendGridMail = require("@sendgrid/mail");
sendGridMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendMail(emailParams) {
  try {
    await sendGridMail.send({
      to: emailParams.toEmail,
      from: process.env.TO_EMAIL || "hello@myria.com",
      subject: emailParams.subject,
      text: emailParams.message
    });
    return { message: `Email has been sent successfully` };
  } catch (error) {
    const message = `Error sending email`;
    return { message };
  }
}

app.post('/contact-us', async (req, res, next) => {
  try {
    res.json(await sendMail(req.body));
  } catch (err) {
    next(err);
  }
});

app.use((err, _, res, _) => {
  const statusCode = err.statusCode || 500;
  console.error(err.message, err.stack);
  res.status(statusCode).json({'message': err.message});
  return;
});

app.listen(port, () => {
  console.log(`Example API listening at http://localhost:${port}`)
});