'use strict'


const Env = use('Env')


module.exports = {
  key_publishable: Env.get('STRIPE_KEY_PUBLISHABLE'),
  key_secret: Env.get('STRIPE_KEY_SECRET')
}