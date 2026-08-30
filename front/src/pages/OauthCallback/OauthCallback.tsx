import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { graphqlClient } from '../../services/graphqlClient.ts'
import { useUserStore } from '../../store/userStore.ts'

function OauthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const loadCurrentUser = useUserStore((state) => state.loadCurrentUser)
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    const token = searchParams.get('token')
    if (!token) {
      navigate('/login?error=oauth', { replace: true })
      return
    }

    graphqlClient.setAuthToken(token)
    loadCurrentUser().then(() => navigate('/', { replace: true }))
  }, [searchParams, navigate, loadCurrentUser])

  return <div className="register-page">Signing you in…</div>
}

export default OauthCallback
