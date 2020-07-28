'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Config = use('Config')
const stripe = use('stripe')(Config.get('stripe.key_secret'))
const Wallet = use('App/Models/Wallet')
const User = use('App/Models/User')
const Transaction = use('App/Models/Transaction')

/**
 * Resourceful controller for interacting with wallets
 */
class WalletController {
  /**
   * Show a list of all wallets.
   * GET wallets
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index ({ request, auth, response, view }) {

    let wallet = await Wallet
      .query()
      .where('user_id', auth.user.id)
      .fetch()


    return view.render('wallet.index', {
      name: auth.user.username,
      amount: wallet.toJSON()
    })
  }

  /**
   * Render a form to be used for creating a new wallet.
   * GET wallets/create
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async create ({ request, response, view }) {

    return view.render('wallet.create')
  }

  /**
   * Create/save a new wallet.
   * POST wallets
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, auth, session, response }) {

    let token = request.input('stripeToken')
		let chargeAmount = request.input('amount')
		
	
		let charge = stripe.charges.create({
          amount: chargeAmount + '00',
          currency: "ngn",
          source: token
          }, function (err, charge) {
          if(err) {
            console.log("Your card was declined");
            console.log(err.message);
            return response.redirect("mywallet")
          } else {
            console.log("Payment was successful");
            
          }
		});

    let wallet = await Wallet
      .query()
      .where('user_id', auth.user.id)
      .fetch()

     let wallets = wallet.toJSON()

		
    let totalAmount = Number(wallets[0].amount) + Number(chargeAmount)
    let totalTopup = Number(wallets[0].topups) + Number(chargeAmount)

    
    const affectedRows = await Wallet
			.query()
			.where('user_id', auth.user.id)
			.update({ amount: totalAmount, topups: totalTopup })
		
    const transaction = await Transaction.create({
      user_id: auth.user.id,
      username: auth.user.username,
      amount: chargeAmount,
      message: 'Top up'
    })

    console.log('Save to db');
    let msg = `You funded you account with ${chargeAmount}`
    session.flash({ successMessage: msg })
		return response.redirect('/mywallet')
  }

  /**
   * Display a single wallet.
   * GET wallets/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async gift ({ params, request, response, view }) {
    return view.render('wallet.gift')
  }

  /**
   * Render a form to update an existing wallet.
   * GET wallets/:id/edit
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async transfer ({ params, auth, session, request, response, view }) {
    let chargeAmount = request.input('amount')
    let email = request.input('email')

    let wallet = await Wallet
      .query()
      .where('user_id', auth.user.id)
      .fetch()

    let reciever = await User
      .query()
      .where('email', email)
      .fetch()

    let wallets = wallet.toJSON()
    let recievers = reciever.toJSON()

    if (recievers.length === 0) {
      session.flash({ successMessage: "There's no user with the specified email" })
      return response.redirect('back')
    }
    if (recievers[0].email === auth.user.email) {
      session.flash({ successMessage: "You can't transfer fund to same account" })
      return response.redirect('back')
    }
    if (wallets[0].amount <= chargeAmount) {
      session.flash({ successMessage: 'You account is below the specified amount' })
      return response.redirect('back')
    }

    const recieverWallet = await Wallet
			.query()
			.where('user_id', recievers[0].id)
			.fetch()

    let recieverWalletJSON = recieverWallet.toJSON()
		
    let totalAmount = Number(wallets[0].amount) - Number(chargeAmount)
    let totalGift = Number(wallets[0].gift) + Number(chargeAmount)

    let recieverTotalAmount = Number(recieverWalletJSON[0].amount) + Number(chargeAmount)
    let recieverTotalRecieved = Number(recieverWalletJSON[0].recieve) + Number(chargeAmount)


    const affectedRow = await Wallet
			.query()
			.where('user_id', recievers[0].id)
			.update({ amount: recieverTotalAmount, recieve: recieverTotalRecieved })
    
    const affectedRows = await Wallet
			.query()
			.where('user_id', auth.user.id)
      .update({ amount: totalAmount, gift: totalGift })
      
    const transaction = await Transaction.create({
      user_id: auth.user.id,
      username: recievers[0].username,
      amount: chargeAmount,
      message: `Sent`
    })

    const transact = await Transaction.create({
      user_id: recievers[0].id,
      username: auth.user.username,
      amount: chargeAmount,
      message: `Recieved`
    })
		
    
    console.log('Save to db')
    let msg = `You have gifted ${email} NGN ${chargeAmount}`
    session.flash({ successMessage: msg })
		return response.redirect('/mywallet')
  }

  /**
   * Update wallet details.
   * PUT or PATCH wallets/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response }) {
  }

  /**
   * Delete a wallet with id.
   * DELETE wallets/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, request, response }) {
  }

  async transaction ({ request, auth, response, view }) {

    let transaction = await Transaction
      .query()
      .where('user_id', auth.user.id)
      .fetch()

     return view.render('wallet.transaction', {
      transactions: transaction.toJSON()
    })
  }
}

module.exports = WalletController
