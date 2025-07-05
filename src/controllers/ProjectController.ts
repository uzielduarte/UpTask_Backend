import type { Request, Response } from 'express'
import Project from '../models/Project'

export class ProjectController {

    static createProject = async (req: Request, res: Response) => {
        const project = new Project(req.body)
        
        // Asignar manager
        project.manager = req.user.id
        try {
            await project.save()
            res.send('Proyecto creado correctamente')
        } catch (error) {
            console.log(error)
        }
    }

    static getAllProjects = async(req: Request, res: Response) => {
        try {
            const projects = await Project.find({
                $or: [
                    {manager: {$in: req.user.id}},
                    {team: {$in: req.user.id}} // let members see projects which he's added to as a member
                ]
            })
            res.json(projects)
        } catch (error) {
            console.log(error)
        }
    }

    static getProjectById = async (req: Request, res: Response) => {
        const {id} = req.params
        
        try {
            const project = await Project.findById(id).populate('tasks')
            if(!project) {
                res.status(404).json({error: 'Proyecto no encontrado'})
                return
            }
            // let members set project's tasks
            if(project.manager.toString() !== req.user.id.toString() && !project.team.includes(req.user.id)) {
                res.status(400).json({error: 'Accion no valida'})
                return
            }

            res.json(project)

        } catch (error) {
            console.log(error)
        }
    }

    static updateProject = async (req: Request, res: Response) => {
                
        try {
                        
            req.project.clientName = req.body.clientName
            req.project.projectName = req.body.projectName
            req.project.description = req.body.description
            await req.project.save()
            res.send('Proyecto actualizado')
        } catch (error) {
            console.log(error)
        }
    }

    static deleteProject = async (req: Request, res: Response) => {
        
        try {   
            await req.project.deleteOne()
            res.send('Proyecto eliminado')
        } catch (error) {
            console.log(error)
        }
    }
}