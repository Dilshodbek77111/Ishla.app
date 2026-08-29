const nodemailer=require('nodemailer');
const configured=Boolean(process.env.SMTP_HOST&&process.env.SMTP_USER&&process.env.SMTP_PASS); const transporter=configured?nodemailer.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT||587),secure:Number(process.env.SMTP_PORT)===465,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}}):null;
async function send(to,subject,text){if(!transporter){if(process.env.NODE_ENV!=='test') console.log(`[EMAIL DEV] ${to} | ${subject}\n${text}`); return;} try{await transporter.sendMail({from:process.env.SMTP_FROM||process.env.SMTP_USER,to,subject,text})}catch(e){console.error('Email delivery failed:',e.message)}}
module.exports={send};
