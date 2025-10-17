import mongoose from "mongoose";
import express from "express"
import connectDB from "./db/db.js"
import dotenv from 'dotenv'

dotenv.config({ path: './env' })

connectDB()
    .then(
        () => {
            app.listen(process.env.PORT || 8000, () => {
                console.log(`Server is running at PORT : ${process.env.PORT}`)
            })
        }
    )
    .catch(
        (err) => {
            console.log("MONGODB connection failed", err)
        }
    )



//    Way 1 of connecting DB
//     /*()() is called IIFE — Immediately Invoked Function Expression.The outer parentheses define an anonymous function.The first () invokes it.That function returns another function.The second () invokes the returned function.*/

//     /* In async function, await pauses the execution unless promise from async is fulfilled. if promise rejected, it will throw error. */

//     (async () => {
//         try {
//             mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//             app.on("error", (error) => {
//                 console.log("Error:", error)
//                 throw error
//             })
//             app.listen(process.env.PORT, () => {
//                 console.log(`App is listening on PORT ${process.env.PORT}`)
//             })
//         }
//         catch (error) {
//             console.error("ERROR", error)
//             throw error
//         }
//     })() 