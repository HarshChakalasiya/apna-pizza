require('dotenv').config()
const express = require('express')
const app = express()
const ejs= require('ejs')
const path = require('path')
const expressLayout = require('express-ejs-layouts')
const PORT = process.env.PORT || 3000    // If port is availalble in node modules then use that otherwise use 3000 
const mongoose= require('mongoose')
const session = require('express-session')
const flash = require('express-flash')   // To send cookie    
const MongoDbStore= require('connect-mongo')(session)  // TO store cookies & sessions in db
// DB Connection

const url = 'mongodb://localhost/pizza';
mongoose.connect(url,{ useNewUrlParser:true, useCreateIndex:true, useUnifiedTopology:true, useFindAndModify: true});

const connection = mongoose.connection;

connection.once('open',()=>{
	console.log('Database Connected');
}).catch(err=>{
	console.log('Connection Failed');
});
// Session Store

let mongoStore = new MongoDbStore({
	mongooseConnection: connection,
	collection : 'sessions'
})

// Session Config

app.use(session({
	secret: process.env.COOKIE_SECRET,  // for cookies setup
	resave: false,
	saveUninitialized: false,
	store: mongoStore,
	cookie: {
		maxAge: 1000*60*60*24
	}
}))

app.use(flash())
// Asset path

app.use(express.static('public'))
app.use(express.json())  // for fetching json data from the browser

// Global Middleware
app.use((req,res,next)=>{
	res.locals.session = req.session
	next()   // Mandatory call because otherwise it reload continuesly never stop
})


// set Template engine



app.use(expressLayout)
app.set('views',path.join(__dirname,'/resources/views'))
app.set('view engine','ejs')

require('./routes/web')(app)


app.listen(PORT, ()=> {
	console.log(`listening on port on ${PORT}`);
})