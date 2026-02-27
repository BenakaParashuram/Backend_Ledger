const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});


// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend Ledger" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

async function sendRegistrationEmail(userEmail , name){
    const subject = 'Welcome to Backend Ledger!'
    const text = `Hello ${name} , Thankyou for Registering at Backend Ledger`
    const html = `<p>Hello ${name} , Thankyou for Registering at Backend Ledger</p>`
    
    await sendEmail(userEmail , subject , text , html)
}

async function sendTransactionEmail(userEmail, name, amount, toAccount) {
    const subject = 'Transaction Successful - Backend Ledger'

    const text = `
Hello ${name},

Your transaction was successful.

Amount Debited: ₹${amount}
Transferred To: ${toAccount}

Thank you for using Backend Ledger.
`

    const html = `
        <h2>Transaction Successful ✅</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Your transaction was successfully processed.</p>
        <ul>
            <li><strong>Amount Debited:</strong> ₹${amount}</li>
            <li><strong>Transferred To:</strong> ${toAccount}</li>
        </ul>
        <p>Thank you for using Backend Ledger.</p>
    `

    await sendEmail(userEmail, subject, text, html)
}


async function sendTransactionFailureMail(userEmail, name, amount, toAccount) {
    const subject = 'Transaction Failed - Backend Ledger'

    const text = `
Hello ${name},

We regret to inform you that your transaction has failed.

Amount Attempted: ₹${amount}
Intended Recipient: ${toAccount}

Please check your balance or try again later.
`

    const html = `
        <h2 style="color:red;">Transaction Failed ❌</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Your transaction could not be completed.</p>
        <ul>
            <li><strong>Amount Attempted:</strong> ₹${amount}</li>
            <li><strong>Intended Recipient:</strong> ${toAccount}</li>
        </ul>
        <p>Please check your account balance or try again later.</p>
    `

    await sendEmail(userEmail, subject, text, html)
}


module.exports = 
{
  sendRegistrationEmail , 
  sendTransactionEmail , 
  sendTransactionFailureMail
};