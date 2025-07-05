import type {Request, Response, NextFunction} from 'express'
import Task, { ITask } from '../models/Task'
//import { param } from 'express-validator'

declare global {
    namespace Express {
        interface Request {
            task: ITask
        }
    }
}

export async function taskExists(req: Request, res: Response, next: NextFunction) {
    try {
        const {taskId} = req.params
        const task = await Task.findById(taskId)

        if(!task) {
            res.status(404).json({error: 'Tarea no encontrada'})
            return
        }
        req.task = task

        next()
    } catch (error) {
        res.status(404).json({error: 'Tarea no encontrada'})
    }
}

export async function taskBelongsToProject(req: Request, res: Response, next: NextFunction) {
    try {
        if(req.task.project.toString() !== req.project.id.toString()) {
            res.status(404).json({error: 'Accion no valida'})

            return
        }
    } catch (error) {
        console.log(error)
    }
    next()
}

export function hasAuthorization(req: Request, res: Response, next: NextFunction) {
    if(req.user.id.toString() !== req.project.manager.toString()){
        res.status(400).json({error: 'Sin previlegios suficientes para realizar esta accion'})

        return
    }

    next()
}

// export function mongoId(req: Request, res: Response, next: NextFunction) {
//     param('taskId').isMongoId().withMessage('Id no valido')
    
//     next()
// }