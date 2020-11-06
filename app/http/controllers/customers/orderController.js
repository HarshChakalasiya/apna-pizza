const Order = require('../../../models/order')
const moment = require('moment')
function orderController(){
	return {
		store(req,res){
			// validate req
			const { phone, address} = req.body
			if(!phone || !address){
				req.flash('error','All fields are required')
				return res.redirect('/cart')
			}

			const order = new Order({
				customerId: req.user._id,
				items: req.session.cart.items,
				phone : phone,
				address: address
			})
			order.save().then(result=> {	
				Order.populate(result,{ path: 'customerId' }, (err,placedOrder)=>{
					req.flash('success','Order Placed Successfully')
					delete req.session.cart
					// Emit 
					const eventEmitter = req.app.get('eventEmitter')
					eventEmitter.emit('orderPlaced',placedOrder)

					return res.redirect('/customers/orders')
				})
				
			}).catch(err=>{
				req.flash('error','Something went wrong')
				return res.redirect('/cart')
			})
		},

		async index(req,res){
			const orders = await Order.find({ customerId: req.user._id }, null, 
				{sort: {
						'createdAt': -1
			}})
			// for disable order placed notification when back & forward in browser
			res.header('Cache-Control', 'no-cache,private, no-store, must-revalidate, max-stable=0, pre-check=0')
			//
			res.render('customers/orders', { orders: orders, moment: moment })
		},

		async show(req,res){
			const order= await Order.findById(req.params.id)
			// authorize user

			if(req.user._id.toString() === order.customerId.toString()){
				return res.render('customers/singleOrder',{order: order})
			}
			
				return res.redirect('/')
			
	}
}
}

module.exports = orderController