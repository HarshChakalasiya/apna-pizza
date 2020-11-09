require('dotenv').config()
const express = require('express')
const app = express()
const ejs= require('ejs')
const path = require('path')
const expressLayout = require('express-ejs-layouts')
const PORT = process.env.PORT || 3000    // If port is availalble in node modules then use that otherwise use 3000 
const mongoose= require('mongoose')
const session = require('express-session')
const flash = require('express-flash')   // To send message    
const MongoDbStore= require('connect-mongo')(session)  // TO store cookies & sessions in db

const passport = require('passport')

const Emitter= require('events')
// DB Connection

// const url = 'mongodb://localhost/pizza';
// mongoose.connect(process.env.MONGO_CONNECTION_URL,{ useNewUrlParser:true, useCreateIndex:true, useUnifiedTopology:true, useFindAndModify: true});

// const connection = mongoose.connection;

// connection.once('open',()=>{
// 	console.log('Database Connected');
// }).catch(err=>{
// 	console.log('Connection Failed');
// });

const connectDB = require('./config/db');
connectDB();


// Session Store

let mongoStore = new MongoDbStore({
	mongooseConnection: connection,
	collection : 'sessions'
})

// Event emitter for socket

const eventEmitter = new Emitter()
app.set('eventEmitter',eventEmitter)

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

// passport confog
const passportInit = require('./app/config/passport')
passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())

app.use(flash())
// Asset path

app.use(express.static('public'))
app.use(express.urlencoded({ extended : false}))
app.use(express.json())  // for fetching json data from the browser

// Global Middleware
app.use((req,res,next)=>{
	res.locals.session = req.session
	res.locals.user = req.user
	next()   // Mandatory call because otherwise it reload continuesly never stop
})


// set Template engine



app.use(expressLayout)
app.set('views',path.join(__dirname,'/resources/views'))
app.set('view engine','ejs')

require('./routes/web')(app)
app.use((req,res)=>{
	res.status(404).render('errors/404')
})

const server = app.listen(PORT, ()=> {
	console.log(`listening on port on ${PORT}`);
})


// socket

const io= require('socket.io')(server)

io.on('connection', (socket)=>{
	// private rooms
	// join
	
	socket.on('join',(orderId)=>{
		socket.join(orderId)
	})
})


eventEmitter.on('orderUpdated',(data)=>{
	io.to(`order_${data.id}`).emit('orderUpdated', data)
})

eventEmitter.on('orderPlaced',(data)=>{
	io.to('adminRoom').emit('orderPlaced',data)
})