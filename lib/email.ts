import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMagicLinkEmail(email: string, magicLink: string) {
  const { data, error } = await resend.emails.send({
    from: `私厨菜单 <${process.env.RESEND_EMAIL_FROM}>`,
    to: email,
    subject: "登录私厨菜单",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-align: center;">私厨菜单登录</h2>
          <p style="color: #666; text-align: center;">点击下方按钮登录你的账号</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${magicLink}" 
               style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              点击登录
            </a>
          </div>
          <p style="color: #999; font-size: 12px; text-align: center;">如果按钮无法点击，请复制以下链接到浏览器：<br><a href="${magicLink}">${magicLink}</a></p>
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
