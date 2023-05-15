import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const slice = createSlice({
  name: 'coingecko',
  initialState: {
    usdPriceQueue: [] as string[],
    usdPrice: {} as Record<string, number | null>,
  },
  reducers: {
    fetchUsdPrice(state, action: PayloadAction<string[]>) {
      for (const id of action.payload) {
        if (!state.usdPriceQueue.includes(id)) state.usdPriceQueue.push(id)
      }
    },
    clearUsdPriceQueue(state) {
      state.usdPriceQueue = []
    },
    setUsdPrice(state, { payload: { id, price } }: PayloadAction<{ id: string; price: number | null }>) {
      state.usdPrice[id] = price
    },
  },
})

export const { fetchUsdPrice, setUsdPrice, clearUsdPriceQueue } = slice.actions

export default slice.reducer
