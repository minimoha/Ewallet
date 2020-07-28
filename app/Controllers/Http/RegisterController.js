'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */


const User = use('App/Models/User')
const Wallet = use('App/Models/Wallet')
const { validate } = use('Validator')

/**
 * Resourceful controller for interacting with registers
 */
class RegisterController {
  /**
   * Show a list of all registers.
   * GET registers
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index ({ request, response, view }) {
  }

  /**
   * Render a form to be used for creating a new register.
   * GET registers/create
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async create ({ request, response, view }) {
    return view.render('user.register')
  }

  /**
   * Create/save a new register.
   * POST registers
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, session, response }) {

     const rules = {
      email: 'required|email|unique:users',
      password: 'required|min:5|confirmed',
    }

    const messages = {
      'email.required': 'The email field is required',
      'email.email': 'Enter a valid email address',
      'email.unique': 'Email already exists',
      'password.required': 'The password field is required',
      'password.min': 'The password field must be at least 5 characters',
      'password.confirmed': 'The password fields do not match',
    }

    const validation = await validate(request.all(), rules, messages)

    if (validation.fails()) {
      session
        .withErrors(validation.messages())
        .flashAll()

      return response.redirect('back')
    }
    
    const user = await User.create({
      username: request.input('email'),
      email: request.input('email'),
      password: request.input('password')
    })

    const wallet = await Wallet.create({
      user_id: user.id,
      amount: 0,
      gift: 0,
      recieve: 0,
      topups: 0
    })

    session.flash({ successMessage: 'You have registered successfully!' })
    return response.redirect('user.login')
  }

  /**
   * Display a single register.
   * GET registers/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params, request, response, view }) {
  }

  /**
   * Render a form to update an existing register.
   * GET registers/:id/edit
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async edit ({ params, request, response, view }) {
  }

  /**
   * Update register details.
   * PUT or PATCH registers/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response }) {
  }

  /**
   * Delete a register with id.
   * DELETE registers/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, request, response }) {
  }
}

module.exports = RegisterController
