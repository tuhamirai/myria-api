const express = require("express");
require("dotenv").config();

var cors = require("cors");

const app = express();
const port = 3000 || process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const sendGridMail = require("@sendgrid/mail");
const client = require("@sendgrid/client");

client.setApiKey(process.env.SENDGRID_API_KEY);
sendGridMail.setApiKey(process.env.SENDGRID_API_KEY);
async function sendMail(emailParams) {
  try {
    await sendGridMail.send({
      from: process.env.FROM_EMAIL || "hello@myria.com",
      to: process.env.TO_EMAIL || "hello@myria.com",
      subject: emailParams.subject,
      text: emailParams.message,
      html: `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html lang="en">
      <head>
        <meta charset="utf-8">
      
        <meta name="description" content="The HTML5 Herald">
        <meta name="author" content="SitePoint">
      <meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
      
        <link rel="stylesheet" href="css/styles.css?v=1.0">
      
      </head>
      
      <body>
        <div class="img-container" style="display: flex;justify-content: center;align-items: center;border-radius: 5px;overflow: hidden; font-family: 'helvetica', 'ui-sans';">              
              </div>
              <div class="container" style="margin-left: 20px;margin-right: 20px;">
              <h3>You've got a new mail from ${emailParams.name}, their email is: ✉️${emailParams.fromEmail} </h3>
              <div style="font-size: 16px;">
              <p>Message:</p>
              <p>${emailParams.message}</p>
              <br>
              </div>
              
              </div>
      </body>
      </html>`,
    });
    return { message: `Email has been sent successfully` };
  } catch (error) {
    return { message: "Error sending email" };
  }
}

async function subscription(params) {
  const request = {
    method: "PUT",
    url: "/v3/marketing/contacts",
    body: {
      list_ids: ["896616eb-fed8-477e-ad84-73e82a722c65"],
      contacts: [
        {
          email: params.email,
        },
      ],
    },
  };

  try {
    await client.request(request);
    return { message: "subscription has been submitted successfully" };
  } catch (error) {
    return { message: "subscription error" };
  }
}

app.post("/contact-us", async (req, res, next) => {
  try {
    res.json(await sendMail(req.body));
  } catch (err) {
    next(err);
  }
});

app.put("/subscription", async (req, res, next) => {
  try {
    res.json(await subscription(req.body));
  } catch (err) {
    next(err);
  }
});

app.get("/healthcheck", async (_, res, next) => {
  res.sendStatus(200);
});

app.use((err, _, res, __) => {
  const statusCode = err.statusCode || 500;
  console.error(err.message, err.stack);
  res.status(statusCode).json({ message: err.message });
  return;
});

app.listen(port, () => {
  console.log(`Example API listening at http://localhost:${port}`);
});
