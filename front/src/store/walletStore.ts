import { create } from 'zustand'
import { walletService } from '../services/wallet/index.ts'
import type { Wallet, WalletTransaction } from '../services/wallet/index.ts'

type WalletStatus = 'idle' | 'loading' | 'ready' | 'error'

interface WalletState {
  wallet: Wallet | null
  status: WalletStatus
  error: string | null
  loadWallet: () => Promise<void>
  addTransaction: (transaction: WalletTransaction) => void
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Failed to load the wallet.'
}

export const useWalletStore = create<WalletState>((set, get) => ({
  wallet: null,
  status: 'idle',
  error: null,

  loadWallet: async () => {
    set({ status: 'loading', error: null })
    try {
      const wallet = await walletService.myWallet()
      set({ wallet, status: wallet ? 'ready' : 'error', error: wallet ? null : 'No wallet found.' })
    } catch (error) {
      set({ status: 'error', error: toErrorMessage(error) })
    }
  },

  addTransaction: (transaction) => {
    const { wallet } = get()
    if (!wallet) return
    set({ wallet: { ...wallet, transactions: [transaction, ...wallet.transactions] } })
  },
}))
