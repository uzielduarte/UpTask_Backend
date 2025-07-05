import type { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import User from '../models/User'
import { checkPassword, hashPassword } from '../utils/auth'
import TokenModel from '../models/Token'
import { generateToken } from '../utils/token'
import { AuthEmail } from '../emails/AuthEmail'
import { generateJWT } from '../utils/jwt'

export class AuthController {
    static createAccount = async (req: Request, res: Response) => {
        try {
            const { password, email } = req.body

            // Verificar duplicados
            const userExists = await User.findOne({ email })
            if (userExists) {
                res.status(409).json({ error: 'El usuario ya esta registrado' })
                return
            }

            const user = new User(req.body)
            // Hash password
            user.password = await hashPassword(password)

            //Generar token
            const token = new TokenModel()
            token.token = generateToken()
            token.user = user.id

            // Enviar el email
            AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            })

            await Promise.allSettled([user.save(), token.save()])

            res.send('Hemos enviado un enlace de confirmacion a tu correo. Por favor, revisa para confirmar la creacion de la cuenta.')
        } catch (error) {
            res.status(500).json({ error: 'Ha habido un error en la creacion de la cuenta' })
        }
    }

    static confirmAccount = async (req: Request, res: Response) => {
        try {
            const { token } = req.body

            const tokenExists = await TokenModel.findOne({ token })
            if (!tokenExists) {
                res.status(404).json({ error: 'Token no valido' })
                return
            }

            const user = await User.findById(tokenExists.user)
            user.confirmed = true

            await Promise.allSettled([user.save(), tokenExists.deleteOne()])
            res.send('Cuenta confirmada correctamente')

        } catch (error) {
            res.status(400).json({ error: 'Hubo un error' })
        }
    }

    static login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body
            const user = await User.findOne({ email })

            if (!user) {
                res.status(404).json({ error: 'Usuario no encontrado' })
                return
            }

            if (!user.confirmed) {
                const token = new TokenModel()
                token.user = user.id
                token.token = generateToken()

                await token.save()

                AuthEmail.sendConfirmationEmail({
                    email: user.email,
                    name: user.name,
                    token: token.token
                })

                res.status(401).json({ error: 'La cuenta no ha sido confirmada. Hemos enviado un e-mail de confirmacion' })
                return
            }

            // Revisar password
            const isPasswordCorrect = await checkPassword(password, user.password)

            if (!isPasswordCorrect) {
                res.status(401).json({ error: 'Password incorrecto' })
                return
            }

            const token = generateJWT({ id: user.id })
            res.send(token)
        } catch (error) {
            res.status(404).json({ error: 'Hubo un error' })
            return
        }
    }

    static requestConfirmationCode = async (req: Request, res: Response) => {
        try {
            const { email } = req.body

            // Usuario exists
            const user = await User.findOne({ email })
            if (!user) {
                res.status(404).json({ error: 'El usuario no esta registrado' })
                return
            }

            if (user.confirmed) {
                res.status(403).json({ error: 'El usuario ya esta confirmado' })
                return
            }

            //Generar token
            const token = new TokenModel()
            token.token = generateToken()
            token.user = user.id

            // Enviar el email
            AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            })

            await Promise.allSettled([user.save(), token.save()])

            res.send('Se ha enviado un nuevo Token a tu email')
        } catch (error) {
            res.status(500).json({ error: 'Ha habido un error en la creacion de la cuenta' })
        }
    }

    static forgotPassword = async (req: Request, res: Response) => {
        try {
            const { email } = req.body

            // Usuario exists
            const user = await User.findOne({ email })
            if (!user) {
                res.status(404).json({ error: 'El usuario no esta registrado' })
                return
            }



            //Generar token
            const token = new TokenModel()
            token.token = generateToken()
            token.user = user.id
            await token.save()

            // Enviar el email
            AuthEmail.sendPasswordResetToken({
                email: user.email,
                name: user.name,
                token: token.token
            })


            res.send('Revisa tu email para instrucciones')
        } catch (error) {
            res.status(500).json({ error: 'Ha habido un error en la restauracion de password' })
        }
    }

    static validateToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.body

            const tokenExists = await TokenModel.findOne({ token })
            if (!tokenExists) {
                res.status(404).json({ error: 'Token no valido' })
                return
            }

            res.send('Token valido. Define tu nuevo password')

        } catch (error) {
            res.status(400).json({ error: 'Hubo un error' })
        }
    }

    static updatePasswordWithToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.params

            const tokenExists = await TokenModel.findOne({ token })
            if (!tokenExists) {
                res.status(404).json({ error: 'Token no valido.' })
                return
            }

            const user = await User.findById(tokenExists.user)
            user.password = await hashPassword(req.body.password)

            await Promise.allSettled([user.save(), tokenExists.deleteOne()])

            res.send('El password se modifico correctamente')
        } catch (error) {
            res.status(400).json({ error: 'Hubo un error' })
        }
    }

    static user = async (req: Request, res: Response) => {
        res.json(req.user)
        return
    }

    static updateProfile = async (req: Request, res: Response) => {
        const { name, email } = req.body

        const userExists = await User.findOne({ email })
        if (userExists && userExists.id.toString() !== req.user.id.toString()) {
            res.status(409).json({ error: 'Este email ya esta registrado' })
            return
        }

        req.user.name = name
        req.user.email = email

        try {
            await req.user.save()
            res.send('Perfil actualizado correctamente')
        } catch (error) {
            res.status(500).send('Hubo un error en la actualizacion del perfil')
        }
    }

    static updateCurrentUserPassword = async (req: Request, res: Response) => {
        const { current_password, password } = req.body

        const user = await User.findById(req.user.id)
        const isPasswordCorrect = await checkPassword(current_password, user.password)

        if (!isPasswordCorrect) {
            res.status(401).json({ error: 'El password actual es incorrecto'})
            return
        }

        try {
            user.password = await hashPassword(password)
            await user.save()
            res.send('Password actualizado correctamente')
        } catch (error) {
            res.status(500).send('Hubo un error en la actualizacion del password')
        }
    }

    static checkPassword = async (req : Request, res : Response) => {
        const { password } = req.body

        const user = await User.findById(req.user.id)
        const isPasswordCorrect = await checkPassword(password, user.password)

        if(!isPasswordCorrect) {
            res.status(401).json({error: 'El password es incorrecto'})
            return
        }

        res.send('Password correcto')
    }
}