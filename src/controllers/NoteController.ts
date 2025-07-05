import type { Request, Response } from 'express'
import NoteModel, { INote } from '../models/Note'
import { Types } from 'mongoose'

type NoteParams = {
    noteId: Types.ObjectId
}

export class NoteController {

    static createNote = async (req : Request<{}, {}, INote>, res : Response) => {
        const { content } = req.body

        const note = new NoteModel()
        
        note.content = content
        note.createdBy = req.user.id
        note.task = req.task.id

        req.task.notes.push(note.id)

        try {
            await Promise.allSettled([req.task.save(), note.save()])

            res.send('Nota agregada correctamente')
        } catch (error) {
            res.status(500).json({error: 'Error al guardar'})
        }
    }

    static getTaskNotes = async (req : Request, res : Response) => {
        
        try {
            const notes = await NoteModel.find({task: req.task.id})
            res.json(notes)
        } catch (error) {
            res.status(500).json('Error al cargar los datos')
        }
    }

    static deleteNote = async (req : Request<NoteParams>, res : Response) => {
        const { noteId } = req.params
        const note = await NoteModel.findById(noteId)

        if(!note) {
            res.status(404).json({error: 'Nota no encontrada'})
            return
        }

        if(req.user.id.toString() !== note.createdBy.toString()) {
            res.status(401).json({error: 'No tiene privilegios para eliminar esta nota.'})
            return
        }
        req.task.notes = req.task.notes.filter( note => note.toString() !== noteId.toString())

        try {
            await Promise.allSettled([req.task.save(), note.deleteOne()])
            
            res.send('Nota eliminada correctamente')
        } catch (error) {
           res.status(500).json('Error al eliminar la nota') 
        }
    }
}