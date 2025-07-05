import mongoose from "mongoose";
import colors from "colors"


export const connectDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.DATABASE_URL)
        const url = `${connection.connection.host}:${connection.connection.port}`
        console.log(colors.magenta.bold(`MongoDB Cenectado en: ${url}`))
    } catch (error) {
        console.log(colors.bgRed('Error de conexion a la base de datos'))
        process.exit(1)
    }
}