import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOtpEmail(email: string, code: string) {
  const { data, error } = await resend.emails.send({
    from: `私厨菜单 <${process.env.RESEND_EMAIL_FROM}>`,
    to: email,
    subject: "登录验证码",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-align: center;">私厨菜单登录</h2>
          <p style="color: #666; text-align: center;">你的登录验证码是：</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #f97316;">${code}</span>
          </div>
          <p style="color: #999; font-size: 12px; text-align: center;">验证码有效期为 5 分钟</p>
          <p style="color: #999; font-size: 12px; text-align: center;">如果你没有请求登录，请忽略此邮件。</p>
        </body>
      </html>
    `,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
