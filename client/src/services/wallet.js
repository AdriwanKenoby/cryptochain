import { header } from '../helpers/header'

const fetchWalletInfo = () => {
  return fetch(`${document.location.origin}/api/wallet-info`, {
    headers: {
      ...header(),
      'Content-Type': 'application/json'
    }
  })
    .then(res => {
      if (!res.ok) throw new Error(`Request rejected with status ${res.status}`)
      return res.json()
    })
}

const fetchCreateWallet = ({ privateKey }) => {
  return fetch(`${document.location.origin}/api/create-wallet`, {
    method: 'POST',
    headers: {
      ...header(),
      'Content-Type': 'application/json'
    },
    ...(privateKey && { body: JSON.stringify({ privateKey }) })
  })
    .then(res => {
      if (!res.ok) throw new Error(`Request rejected with status ${res.status}`)
      return res.json()
    })
}

const fetchCreateMiner = () => {
  return fetch(`${document.location.origin}/api/create-miner`, {
    method: 'POST',
    headers: {
      ...header(),
      'Content-Type': 'application/json'
    }
  })
    .then(res => {
      if (!res.ok) throw new Error(`Request rejected with status ${res.status}`)
      return res.json()
    })
}

export const walletAPI = {
  fetchWalletInfo,
  fetchCreateWallet,
  fetchCreateMiner
}
