import { SimpleAccount } from './account'
import { Collection } from './collection'
import { SimpleNftItem } from './token'

export interface SearchResult {
  accounts?: SimpleAccount[]
  collections?: Collection[]
  tokens?: SimpleNftItem[]
}
