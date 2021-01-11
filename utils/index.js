const EC = require('elliptic').ec
const ec = new EC('secp256k1')
const cryptoHash = require('./crypto-hash')
const ChannelType = require('./ChannelType')

const verifySignature = ({ publicKey, data, signature }) => {
  return ec.keyFromPublic(publicKey, 'hex').verify(cryptoHash(data), signature)
}

module.exports = { ec, verifySignature, cryptoHash, ChannelType }
