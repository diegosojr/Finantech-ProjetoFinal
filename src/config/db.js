const mongoose = require("mongoose")

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/finantech")
        console.log("MongoDB conectado com sucesso")
    } catch (error) {
        console.log("Erro ao conectar no MongoDB:", error)
        process.exit(1)
    }
}

module.exports = connectDB
