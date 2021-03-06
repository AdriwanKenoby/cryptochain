'use strict'

const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { transactionSchema } = require('./transactions')

const blockSchema = new Schema({
  timestamp: {
    type: Number,
    required: true,
    unique: true
  },
  lastHash: {
    type: String,
    required: true,
    unique: true
  },
  hash: {
    type: String,
    required: true,
    unique: true
  },
  data: [transactionSchema],
  nonce: {
    type: Number,
    required: true
  },
  difficulty: {
    type: Number,
    required: true
  }
}, { versionKey: false })

module.exports = mongoose.model('blocks', blockSchema)
