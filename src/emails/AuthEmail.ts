import { transporter } from "../config/nodemailer"

interface IEmail {
    email: string,
    name: string,
    token: string
}

export class AuthEmail {
    static sendConfirmationEmail = async (user : IEmail) => {
        const info = await transporter.sendMail({
            from: 'Uptask <admin@uptask.com>',
            to: user.email,
            subject: 'UpTask - Confirmacion de cuenta',
            text: 'UpTask - Confirma tu cuenta',
            html: `<p>Hola ${user.name}!. Has creado tu cuenta en UpTask, para completar el proceso solo debes confirmar tu cuenta.</p>
            <p>Visita el siguiente enlace: </p>
            <a href="${process.env.FRONTEND_URL}/auth/confirm-account">Confirmar cuenta</a>
            <p>Ingresa el codigo: <b>${user.token}</b></p>
            <p>Este token expira en 10 minutos</p>`
        })

        console.log('Mensaje enviado', info.messageId)
    }

    static sendPasswordResetToken = async (user : IEmail) => {
        const info = await transporter.sendMail({
            from: 'Uptask <admin@uptask.com>',
            to: user.email,
            subject: 'UpTask - Restablece tu password',
            text: 'UpTask - Restablece tu password',
            html: `<p>Hola ${user.name}!. Has solicitado restablecer tu password.</p>
            <p>Visita el siguiente enlace: </p>
            <a href="${process.env.FRONTEND_URL}/auth/new-password">Restablecer password</a>
            <p>Ingresa el codigo: <b>${user.token}</b></p>
            <p>Este token expira en 10 minutos</p>`
        })

        console.log('Mensaje enviado', info.messageId)
    }
}