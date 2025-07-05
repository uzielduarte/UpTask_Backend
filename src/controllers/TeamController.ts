import { Request, Response } from 'express'
import User from '../models/User'
import Project from '../models/Project'

export class TeamMemberController {
    static findMemberByEmail = async (req: Request, res: Response) => {
        const { email } = req.body
        
        const user = await User.findOne({email}).select('id email name')
        if(!user) {
            res.status(404).json({error: 'Usuario no encontrado'})
            return
        }
        res.json(user)
        return
    }

    static addMemberToProject = async (req: Request, res: Response) => {
        const { id } = req.body
        
        const user = await User.findById(id).select('id')

        if(!user) {
            res.status(404).json({error: 'Usuario no encontrado'})
            return
        }

        if(req.project.team.some(member => member.toString() === user.id.toString())) {
            res.status(409).json({error: 'El usuario ya esta agregado al proyecto'})
            return
        }

        req.project.team.push(user.id)
        await req.project.save()

        res.send('Usuario agregado correctamente al projecto')
    }

    static removeMemberFromProject = async (req: Request, res: Response) => {
        const { userId } = req.params

        if(req.project.team.some(member => member.toString() === userId)) {
            req.project.team = req.project.team.filter(member => member.toString() !== userId)
            await req.project.save()
    
            res.send('Usuario removido correctamente del proyecto')
        } else {
            res.status(404).json({error: 'El usuario no esta agregado al proyecto'})
        }

    }

    static getTeamMembers = async (req: Request, res: Response) => {
        const project = await Project.findById(req.project.id).populate({
            path: 'team',
            select: 'id email name'
        })

        res.json(project.team)
    }
}