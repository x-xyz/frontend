import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import cookie from 'cookie'

const slice = createSlice({
  name: 'app',
  initialState: {
    authToken: '',
    authTokenUpdatedAt: 0,
    isLoadingAuthToken: false,
  },
  reducers: {
    setLoadingAuthToken(state, action: PayloadAction<boolean>) {
      state.isLoadingAuthToken = action.payload
    },
    setAuthToken(state, action: PayloadAction<string>) {
      state.authToken = action.payload
      state.authTokenUpdatedAt = Date.now()
      if (process.browser) {
        document.cookie = cookie.serialize('auth-token', state.authToken, {
          secure: true,
          sameSite: true,
          path: '/',
          maxAge: 86400,
        })
      }
    },
  },
})

export const { setAuthToken, setLoadingAuthToken } = slice.actions

export default slice.reducer
