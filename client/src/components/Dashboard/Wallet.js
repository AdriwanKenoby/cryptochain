import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { walletAPI } from '../../services'
import io from 'socket.io-client'

const Wallet = () => {
  const [walletInfo, setWalletInfo] = useState({})
  const mounted = useRef(true)

  const fetchInfo = () => {
    walletAPI.fetchWalletInfo()
      .then(json => setWalletInfo(json))
      .catch(err => alert(err.message))
  }

  useEffect(() => {
    mounted.current = true
    if (mounted.current) fetchInfo()
    const socket = io()
    socket.on('wallet', () => fetchInfo())

    return () => {
      mounted.current = false
      socket.close()
    }
  }, [])

  return (
    <div className='Wallet'>
      <p>Address : {walletInfo.address}</p>
      <p>Balance : {walletInfo.balance}</p>
    </div>
  )
}

export default Wallet
