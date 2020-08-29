const express = require("express")
const app = express()
const mongoose = require("mongoose")
require("dotenv").config()

// ROUTES
const user = require("./routes/userRoute")

const DB_URL = process.env.DB_URL
const PORT = 3000 || process.env.PORT
mongoose.connect(
    DB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
).then(
    result => {
        app.listen(PORT)
        console.log(`Database connected.\nApp running on port: ${PORT} . . .`)
    }
).catch(
    err => console.log(err)
)

app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.use("/api/v1/user", user)
app.use( "/api/v1", (req, res) => {
    res.send("<h1>Welcome to VoteChats")
})
app.use('/', (req, res) => {
    res.redirect('/api/v1')
})
app.use('*', (req, res) => {
    res.send("<code>you entered an invalid endpoint</code>")
})