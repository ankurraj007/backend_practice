import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRouter from "./routes/user.routes.js"

const app = express()

const port = process.env.PORT || 8000


// Debug middleware to log all incoming requests
app.use((req, res, next) => {
    console.log(`Incoming ${req.method} request to: ${req.url}`);
    next();
});

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

//configures Express to automatically parse incoming request bodies containing JSON payloads.
app.use(express.json({ limit: "500kb" }))
app.use(express.urlencoded({ extended: true, limit: "500kb" }))
app.use(express.static("public"))
app.use(cookieParser())



//route declaration
app.use("/api/v1/users", userRouter)


app.use((req, res) => {
    console.log('404 Handler reached for:', req.method, req.originalUrl);
    res.status(404).send('Not Found');
});

app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`)
})

export { app }