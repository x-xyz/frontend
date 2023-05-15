import { TransferManagerErc1155, TransferManagerErc721 } from '@x/abis'
import transferManagerErc1155Abi from '@x/abis/transfer-manager-erc1155.json'
import transferManagerErc721Abi from '@x/abis/transfer-manager-erc721.json'
import { addresses } from '@x/constants'
import { ChainId } from '@x/models'

import { useContract, useReadonlyContract } from '../useContract'

export function useTransferManagerErc721Contract(chainId: ChainId) {
  return useContract<TransferManagerErc721>(addresses.transferManagerErc721, transferManagerErc721Abi, true, chainId)
}

export function useReadonlyTransferManagerErc721Contract(chainId: ChainId) {
  return useReadonlyContract<TransferManagerErc721>(addresses.transferManagerErc721, transferManagerErc721Abi, chainId)
}

export function useTransferManagerErc1155Contract(chainId: ChainId) {
  return useContract<TransferManagerErc1155>(addresses.transferManagerErc1155, transferManagerErc1155Abi, true, chainId)
}

export function useReadonlyTransferManagerErc1155Contract(chainId: ChainId) {
  return useReadonlyContract<TransferManagerErc1155>(
    addresses.transferManagerErc1155,
    transferManagerErc1155Abi,
    chainId,
  )
}
