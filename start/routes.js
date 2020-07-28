'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

//Route.on('/').render('welcome')
Route.group(() => {
    Route.get('register', 'RegisterController.create').as('register.create')
    Route.post('register', 'RegisterController.store').as('register.store')

    Route.get('login', 'LoginController.create').as('login.create')
    Route.post('login', 'LoginController.store').as('login.store')
}).middleware(['guest'])


Route.get('/', async({ response }) => {
    return response.redirect('/mywallet')
  })

Route.group(() => {
    Route.get('mywallet', 'WalletController.index').as('wallet.index')

    Route.get('mywallet/topup', 'WalletController.create').as('wallet.create')
    Route.post('mywallet/topup', 'WalletController.store').as('wallet.store')

    Route.get('mywallet/gift', 'WalletController.gift').as('wallet.gift')
    Route.post('mywallet/transfer', 'WalletController.transfer').as('wallet.transfer')

    Route.get('mywallet/transaction', 'WalletController.transaction').as('wallet.transaction')

    Route.get('logout', 'LoginController.destroy').as('logout')
}).middleware(['auth'])

