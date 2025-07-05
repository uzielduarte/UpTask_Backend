import mongoose, { Schema, Document, Types, mongo } from "mongoose"

export interface INote extends Document {
    content: string,
    createdBy: Types.ObjectId,
    task: Types.ObjectId
}

const NoteSchema : Schema = new Schema({
    content: {
        type: String,
        required: true
    },
    createdBy: {
        type: Types.ObjectId,
        ref: 'User',
        required: true
    },
    task: {
        type: Types.ObjectId,
        ref: 'Task',
        required: true
    }
}, {timestamps: true})

const NoteModel = mongoose.model<INote>('Note', NoteSchema)


export default NoteModel