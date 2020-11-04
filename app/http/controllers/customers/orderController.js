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
				req.flash('success','Order Placed Successfully')
				delete req.session.cart
				return res.redirect('/customers/orders')
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
		}

	}
}

module.exports = orderController