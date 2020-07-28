'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class WalletSchema extends Schema {
  up () {
    this.create('wallets', (table) => {
      table.increments()
      table.integer('user_id')
      table.bigInteger('amount')
      table.bigInteger('gift')
      table.bigInteger('recieve')
      table.bigInteger('topups')
      table.timestamps()
    })
  }

  down () {
    this.drop('wallets')
  }
}

module.exports = WalletSchema
