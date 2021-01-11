const redis = require('redis')
const Wallet = require('../wallet')
const { ChannelType } = require('../utils')

class PubSub {
  constructor ({ blockchain, transactionPool, io, redisUrl }) {
    this.blockchain = blockchain
    this.transactionPool = transactionPool
    this.io = io
    this.publisher = redis.createClient(redisUrl)
    this.subscriber = redis.createClient(redisUrl)

    this.subscribeToChannels()
    this.subscriber.on('message', (channel, message) => this.handleMessage(channel, message))
  }

  handleMessage (channel, message) {
    const parsedMessage = JSON.parse(message)

    switch (channel) {
      case ChannelType.BLOCKCHAIN:
        this.blockchain.replaceChain(parsedMessage, true, () => {
          this.transactionPool.clearBlockchainTransactions({ chain: parsedMessage })
        })
        this.io.emit('transaction')
        this.io.emit('blocks')
        this.io.emit('wallet')
        break
      case ChannelType.TRANSACTION:
        this.transactionPool.setTransaction(parsedMessage)
        this.io.emit('transaction')
        break
      case ChannelType.ADDRESS:
        parsedMessage.map(address => Wallet.knownAddresses.set(address[0], address[1]))
        this.io.emit('newAddress')
        break
      default:
        console.log(`Channel : ${channel} - Message : ${message}.`)
        break
    }
  }

  subscribeToChannels () {
    Object.values(ChannelType).forEach(channel => {
      this.subscriber.subscribe(channel)
    })
  }

  publish ({ channel, message }) {
    this.publisher.publish(channel, message)
  }

  broadcastAddresses () {
    this.publish({ channel: ChannelType.ADDRESS, message: JSON.stringify(Array.from(Wallet.knownAddresses)) })
  }

  broadcastChain () {
    this.publish({ channel: ChannelType.BLOCKCHAIN, message: JSON.stringify(this.blockchain.chain) })
  }

  broadcastTransaction (transaction) {
    this.publish({ channel: ChannelType.TRANSACTION, message: JSON.stringify(transaction) })
  }
}

module.exports = PubSub
