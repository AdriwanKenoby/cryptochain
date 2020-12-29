'use strict';

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const createError = require('http-errors');
const Wallet = require('../wallet');
const Miner = require('../miner');
const Address = require('../DB/models/address');
const passport = require('../app/passport');
const transporter = require('../app/transporter');

router.get('/blocks', passport.authenticate('bearer', { session: false }), (req, res) => {
  res.json( req.app.locals.blockchain.chain );
});

router.get('/blocks/length', passport.authenticate('bearer', { session: false }), (req, res) => {
  res.json(req.app.locals.blockchain.chain.length);
});

router.get('/blocks/:id', passport.authenticate('bearer', { session: false }), (req, res) => {
  const { id } = req.params,
  { length } = req.app.locals.blockchain.chain,
  blocksReversed = req.app.locals.blockchain.chain.slice().reverse();

  let startIndex = (id-1) * 5,
  endIndex = id * 5;

  startIndex = startIndex < length ? startIndex : length;
  endIndex = endIndex < length ? endIndex : length;

  res.json(blocksReversed.slice(startIndex, endIndex));
});

router.post('/transact', passport.authenticate('bearer', { session: false }), (req, res, next) => {
  const { amount, recipient } = req.body;
  const id = JSON.stringify(req.user._id);
  const wallet = req.app.locals.wallets.get(id);
  let transaction = req.app.locals.transactionPool.existingTransaction({ inputAddress: wallet.publicKey });

  try {
    if(transaction) {
      transaction.update({ senderWallet: wallet, recipient, amount });
    } else {
      transaction = wallet.createTransaction({ recipient, amount , chain: req.app.locals.blockchain.chain });
    }
  } catch(err) {
    console.error(err);
    return next(err);
  }

  req.app.locals.transactionPool.setTransaction(transaction);
  req.app.locals.pubsub.broadcastTransaction(transaction);

  res.json({ type: 'success', transaction });
});

router.get('/transaction-pool-map', (req, res) => {
  res.json(req.app.locals.transactionPool.transactionMap);
});

router.get('/mine-transactions', passport.authenticate('bearer', { session: false }), (req, res, next) => {
  const id = JSON.stringify(req.user._id);
  const wallet = req.app.locals.wallets.get(id);
  const miner = req.app.locals.miners.get(wallet.publicKey)
  try {
    miner.mineTransactions();
  } catch(err) {
    return next(err);
  }
  res.redirect('/api/blocks');
});

router.get('/wallet-info', passport.authenticate('bearer', { session: false }), (req, res) => {
  const id = JSON.stringify(req.user._id);
  const address = req.app.locals.wallets.get(id).publicKey;
  res.json({
    address: address,
    balance: Wallet.calculateBalance({ chain: req.app.locals.blockchain.chain, address, timestamp: Date.now() })
  });
});

router.get('/known-addresses', passport.authenticate('bearer', { session: false }), (req, res) => {
  res.json(Array.from(Wallet.knownAddresses));
});

router.get('/download', passport.authenticate('bearer', { session: false }), (req, res, next) => {
  fs.writeFile(path.join(__dirname,'..', 'blockchain-file.json'), JSON.stringify(req.app.locals.blockchain.chain, null, ' '), (err) => {
    if (err) return next(err);
    res.download(path.join(__dirname,'..', 'blockchain-file.json'));
  });
});

router.post('/create-wallet-and-miner', passport.authenticate('bearer', { session: false }), (req, res) => {
  const { privateKey } = req.body;
  const id = JSON.stringify(req.user._id);
  if(privateKey) {
    req.app.locals.wallets.set(id, new Wallet({ username: req.user.username, privateKey }));
  } else {
    req.app.locals.wallets.set(id, new Wallet({ username: req.user.username }));
  }
  req.app.locals.pubsub.broadcastAddresses();

  const address = new Address({
    username: req.user.username,
    key: req.app.locals.wallets.get(id).publicKey
  });
  address.save();

  req.app.locals.miners.set(req.app.locals.wallets.get(id).publicKey, new Miner({
    blockchain: req.app.locals.blockchain,
    transactionPool: req.app.locals.transactionPool,
    wallet: req.app.locals.wallets.get(id),
    pubsub: req.app. locals.pubsub
  }));

  let mail = {
    from: 'no-reply@cryptochain.org',
    to: req.user.email,
    subject: 'Cryptochain Private Key',
    template: 'emailPrivateKey',
    context: {
      title: 'Private Key',
      username: req.user.username,
      key: req.app.locals.wallets.get(id).keyPair.getPrivate('hex')
    }
  }

  transporter.sendMail(mail, (err, info) => {
    if(err) console.error(err);
  });

  res.json({ type: 'success', wallet: req.app.locals.wallets.get(id).publicKey, balance: req.app.locals.wallets.get(id).balance });
});

module.exports = router;
