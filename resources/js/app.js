import axios from 'axios'
import Noty from 'noty'
import { initAdmin } from './admin'
import moment from 'moment'


let addToCart = document.querySelectorAll('.add-to-cart')
let cartCounter = document.querySelector('#cartCounter')
function updateCart(pizza){
	axios.post('/update-cart',pizza).then(res => {
		// console.log(res)
		cartCounter.innerText = res.data.totalQty
		new Noty({
			type: 'success',
			timeout: 1000,
			text: 'Item added to cart',
			// layout: 'bottomLeft',  for customize position
			progressBar : false

		}).show();
	}).catch(err=>{
		new Noty({
			type: 'error',
			timeout: 1000,
			text: 'Something Went Wrong',
			// layout: 'bottomLeft',  for customize position
			progressBar : false

		}).show();
	})
}

addToCart.forEach((btn)=>{
	btn.addEventListener('click',(e)=>{
		
		let pizza = JSON.parse(btn.dataset.pizza)
		updateCart(pizza)
		console.log(pizza)
	})
})

const alertMsg = document.querySelector('#success-alert')
if(alertMsg){
	setTimeout(()=>{
		alertMsg.remove()
	},2000)
}



// Change order status
let statuses = document.querySelectorAll('.status_line')
let hidIn = document.querySelector('#hiddenInput') 
let order = hidIn ? hidIn.value : null
order = JSON.parse(order)
let time = document.createElement('small')

function updateStatus(order){
	statuses.forEach((status)=>{
		status.classList.remove('step-completed')
		status.classList.remove('current')
	})
	let stepCompleted = true
	statuses.forEach((status)=>{
		let dataProp = status.dataset.status

		if(stepCompleted){
			status.classList.add('step-completed')
		}
		if(dataProp === order.status){
			stepCompleted = false
			time.innerText = moment(order.updatedAt).format('hh:mm A')
			status.appendChild(time)
			if(status.nextElementSibling){
				status.nextElementSibling.classList.add('current')	
			}
			
		}
	})


}	

updateStatus(order)

// Socket

let socket = io()

initAdmin(socket)
// Join 
if(order){
	socket.emit('join',`order_${order._id}`)
	
}

let adminAreaPath = window.location.pathname

if(adminAreaPath.includes('admin')){
	socket.emit('join','adminRoom')
} 
// room name = order_(order_id) unique

socket.on('orderUpdated',(data)=>{
	const updatedOrder = { ...order }  // copy the order object
	updatedOrder.updatedAt = moment().format()
	updatedOrder.status = data.status
	updateStatus(updatedOrder)
	new Noty({
			type: 'success',
			timeout: 1000,
			text: 'Order Updated',
			// layout: 'bottomLeft',  for customize position
			progressBar : false

		}).show();
	
})