import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider
} from '@tanstack/react-query'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { isAxiosError } from 'axios'
import { client } from './client-axios/client.gen'
import "./index.css"
import { routeTree } from './routeTree.gen'

client.setConfig({
  baseURL: import.meta.env.VITE_API_URL,
  throwOnError: true,
  auth: async () => {
    return localStorage.getItem("access_token") || ""
  }
})

const handleApiError = (error: Error) => {
  if (isAxiosError(error) && [401, 403].includes(error.response?.status ?? 0)) {
    localStorage.removeItem("access_token")
    window.location.href = '/login'
  } 
}

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: handleApiError,
  }),
  mutationCache: new MutationCache({
    onError: handleApiError,
  }), 
})

const router = createRouter({ routeTree })
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router}/>
    </QueryClientProvider>
  </StrictMode>,
)