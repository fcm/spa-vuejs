
import axios from 'axios'
import localforage from 'localforage'
import router from '@/router'
import { bus } from '@/plugins/event-bus'

const http = axios.create({
  baseURL: process.env.API_URL
})

// REQUESTS HANDLES
const intercepRequest = async (config) => {
  const token = await localforage.getItem('token')
  config.headers.common['x-access-token'] = token
  return config
}
const intercepRequestError = (error) => {
  Promise.reject(error)
}

// RESPONSES HANDLERS
const intercepResponse = (response) => response

const intercepResponseError = (error) => {
  let message = error.message

  if (error.response != null) {
    /**
    * Token expirado ou inválido
    */
    if (error.response.status === 403) {
      localforage.removeItem('token').then(() => {
        router.push({ name: 'auth.index', query: { expired: true } })
      })
    }

    message = error.response.data.error
  }

  bus.$emit('display-alert', {
    type: 'error',
    message
  })
  Promise.reject(error)
}

http.interceptors.request.use(intercepRequest, intercepRequestError)
http.interceptors.response.use(intercepResponse, intercepResponseError)

export default http
