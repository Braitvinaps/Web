// import router from '@/router'
import router from '@/router'
import { setLocalStorageItem } from '@/store/helpers/functions'
import axios from 'axios'
import {
  AUTH_CHANGE_PASSWORD, AUTH_ERROR,
  AUTH_LOGOUT, AUTH_REFRESH_TOKEN, AUTH_REGISTER,
  AUTH_REQUEST,
  GOOGLE_AUTH_REQUEST,
  AUTH_SUCCESS
} from '../actions/auth'

const state = {
  token: localStorage.getItem('user-token') || '',
  status: '',
  hasLoadedOnce: false
}

const getters = {
  isAuthenticated: (state) => !!state.token,
  authStatus: (state) => state.status
}

const actions = {
  [AUTH_REQUEST]: ({ commit, dispatch }, uri) => {
    return new Promise((resolve, reject) => {
      commit(AUTH_REQUEST)
      axios({ url: uri, method: 'POST' })
        .then((resp) => {
          setLocalStorageItem('user-token', resp.data.access_token)
          setLocalStorageItem('user-refresh-token', resp.data.refresh_token)
          axios.defaults.headers.common.Authorization = resp.data.access_token
          commit(AUTH_SUCCESS, resp)
          resolve(resp)
        })
        .catch((err) => {
          commit(AUTH_ERROR, err)
          localStorage.removeItem('user-token')
          reject(err)
        })
    })
  },
  [AUTH_REGISTER]: ({ commit }, user) => {
    return new Promise((resolve, reject) => {
      commit(AUTH_REGISTER)
      const uri = process.env.VUE_APP_LEADERTASK_API + 'api/v1/users/new'
      axios({ url: uri, data: user, method: 'POST' })
        .then((resp) => {
          setLocalStorageItem('user-token', resp.data.access_token)
          setLocalStorageItem('user-refresh-token', resp.data.refresh_token)
          axios.defaults.headers.common.Authorization = resp.data.access_token
          commit(AUTH_SUCCESS, resp)
          resolve(resp)
        })
        .catch((err) => {
          commit(AUTH_ERROR, err)
          localStorage.removeItem('user-token')
          reject(err)
        })
    })
  },
  [GOOGLE_AUTH_REQUEST]: ({ commit }, user) => {
    return new Promise((resolve, reject) => {
      commit(GOOGLE_AUTH_REQUEST)
      const uri = process.env.VUE_APP_LEADERTASK_API + 'api/v1/tokens/bygoogle'
      axios({ url: uri, data: user, method: 'POST' })
        .then((resp) => {
          setLocalStorageItem('user-token', resp.data.access_token)
          setLocalStorageItem('user-refresh-token', resp.data.refresh_token)
          axios.defaults.headers.common.Authorization = resp.data.access_token
          commit(AUTH_SUCCESS, resp)
          resolve(resp)
        })
        .catch((err) => {
          commit(AUTH_ERROR, err)
          localStorage.removeItem('user-token')
          reject(err)
        })
    })
  },
  [AUTH_CHANGE_PASSWORD]: ({ commit }, data) => {
    return new Promise((resolve, reject) => {
      // commit(AUTH_CHANGE_PASSWORD) unknown
      const url = process.env.VUE_APP_LEADERTASK_API + 'api/v1/users/password'
      axios({ url: url, data: data, method: 'PATCH' })
        .then((resp) => {
          setLocalStorageItem('user-token', resp.data.access_token)
          setLocalStorageItem('user-refresh-token', resp.data.refresh_token)
          axios.defaults.headers.common.Authorization = resp.data.access_token
          resolve(resp)
        })
        .catch((err) => {
          commit(AUTH_ERROR, err)
          reject(err.response?.data)
        })
    })
  },
  [AUTH_LOGOUT]: ({ commit }) => {
    return new Promise((resolve, reject) => {
      commit(AUTH_LOGOUT)
      localStorage.removeItem('user-token')
      localStorage.removeItem('user-refresh-token')
      localStorage.removeItem('visitedModals')
      const url = process.env.VUE_APP_LEADERTASK_API + 'api/v1/account/exit'
      axios
        .get(url)
        .then((resp) => {
          resolve(resp)
        })
        .catch((err) => {
          commit(AUTH_ERROR, err)
          reject(err)
        })
    })
  },
  [AUTH_REFRESH_TOKEN]: ({ commit }) => {
    return new Promise((resolve, reject) => {
      axios.defaults.headers.common.RefreshToken =
        localStorage.getItem('user-refresh-token')
      const url = process.env.VUE_APP_LEADERTASK_API + 'api/v1/tokens/refresh'
      axios
        .post(url)
        .then((resp) => {
          setLocalStorageItem('user-token', resp.data.access_token)
          setLocalStorageItem('user-refresh-token', resp.data.refresh_token)
          axios.defaults.headers.common.Authorization = resp.data.access_token
          resolve(resp)
        })
        .catch((err) => {
          commit(AUTH_ERROR, err)
          reject(err)
        })
    })
  }
}

const mutations = {
  [AUTH_REQUEST]: (state) => {
    state.status = 'loading'
  },
  [AUTH_REGISTER]: (state) => {
    state.status = 'loading'
  },
  [GOOGLE_AUTH_REQUEST]: (state) => {
    state.status = 'loading'
  },
  [AUTH_SUCCESS]: (state, resp) => {
    state.status = 'success'
    state.token = resp.data.access_token
    state.hasLoadedOnce = true
  },
  [AUTH_ERROR]: (state) => {
    state.status = 'error'
    state.hasLoadedOnce = true
  },
  [AUTH_LOGOUT]: (state) => {
    state.token = ''
    router.push('/login')
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
