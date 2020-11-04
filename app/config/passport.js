const LocalStrategy = require('passport-local').Strategy
const User = require('../models/user')
const bcrypt = require('bcrypt')

function init(passport){
	passport.use(new LocalStrategy({ usernameField: 'email' },async (email, password, done)=>{
		//login

		const user = await User.findOne({ email: email })
		if(!user){
			return done(null, false, { message: 'No User Found'})
		}
		bcrypt.compare(password, user.password).then(match=>{
			if(match){
				return done(null , user, { message: 'Logged in' })
			}
			return done(null, false, { message: 'Password not match'})
		}).catch(err=>{
			return done(null, false, { message: 'Something went wrong' })
		})

	}))

	passport.serializeUser((user,done)=>{
		done(null, user._id)
	})

	passport.deserializeUser((id, done)=>{
		User.findById(id, (err, user)=>{
			done(err, user)
		})
	})


}

module.exports = init