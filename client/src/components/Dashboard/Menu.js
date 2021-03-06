import React from 'react'
import { useSelector } from 'react-redux'
import { isOpen } from '../../redux/features/wallet/walletSlice'
import Wallet from './Wallet'
import CreateWallet from './CreateWallet'

const Menu = () => {
  const walletOpen = useSelector(isOpen)
  if (walletOpen) {
    return (
    <Wallet />
    )
  }
  return (
    <CreateWallet />
  )
}

export default Menu
