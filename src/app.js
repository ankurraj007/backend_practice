import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN
}))

//configures Express to automatically parse incoming request bodies containing JSON payloads.
app.use(express.json({ limit: "20kb" }))
app.use(express.urlencoded({ extended: true, limit: "20kb" }))
app.use(express.static("public"))
app.use(cookieParser())

export { app }