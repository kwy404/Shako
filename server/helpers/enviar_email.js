require('dotenv').config();

async function enviarEmail({ username, email, code_ativacao, subject, generateHtmlEmail }) {
    // Crie um objeto de transporte para enviar o e-mail
    let transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // Se o serviço de e-mail suportar TLS, altere para true
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  
    // Defina as informações do e-mail
    let mailOptions = {
      from: `"Shako - Baimless 👻" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      html: generateHtmlEmail({username,code_ativacao})
    };
  
    // Envie o e-mail
    await transporter.sendMail(mailOptions);
}

async function enviarEmailBanned({ username, email }, banned, generateHtmlEmail) {
    // Crie um objeto de transporte para enviar o e-mail
    let transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false, // Se o serviço de e-mail suportar TLS, altere para true
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
    });
  
    // Defina as informações do e-mail
    let mailOptions = {
      from: `"Shako - Baimless 👻" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `${banned == 1 ? 'Você foi banido' : 'Você foi desbanido'} - Shako`,
      html: generateHtmlEmail(username, banned)
    };
  
    // Envie o e-mail
    await transporter.sendMail(mailOptions);
}

module.exports = {enviarEmail, enviarEmailBanned};