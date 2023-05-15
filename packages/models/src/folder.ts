import { ChainId } from './network'
import { NftItemId } from './token'

export interface Folder {
  id: string
  name: string
  isPrivate: boolean
  isBuiltIn: boolean
  floorPriceInUsd: number
  totalValueInUsd: number
  totalValueMovement: number
  instantLiquidityInUsd: number

  floorPriceMovement: number
  owner: string
  createdAt: string
  nftCount: number
  cover?: NftItemId
  collectionCount: number
}

export interface FolderNftRelationship {
  folderId: string
  chainId: ChainId
  contractAddress: string
  tokenId: string
  index: number
}

export interface CreateFolderPayload {
  name: string
  isPrivate: boolean
}

export interface UpdateFolderPayload {
  name: string
  isPrivate: boolean
  nfts: NftItemId[]
}
