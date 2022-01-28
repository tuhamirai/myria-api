const express = require("express");
require('dotenv').config()

const app = express();
const port = 3000 || process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const sendGridMail = require("@sendgrid/mail");
const client = require("@sendgrid/client");

client.setApiKey(process.env.SENDGRID_API_KEY);
sendGridMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendMail(emailParams) {
  try {
    await sendGridMail.send({
      from: emailParams.fromEmail,
      to: process.env.TO_EMAIL || "hello@myria.com",
      subject: emailParams.subject,
      text: emailParams.message,
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
      "list_ids": ["896616eb-fed8-477e-ad84-73e82a722c65"], 
      "contacts": [{
          "email": params.email 
      }]
    }
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
