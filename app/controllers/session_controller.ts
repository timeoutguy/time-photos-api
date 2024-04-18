import { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class SessionController {
  async store({ request, auth }: HttpContext) {
    const { email, password, rememberMe } = request.only(['email', 'password', 'rememberMe'])

    const user = await User.verifyCredentials(email, password)

    const token = await auth.use('jwt').genereate(user, rememberMe)

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
      token,
    }
  }

  async loginWithToken({ auth }: HttpContext) {
    if (auth.isAuthenticated && auth.user) {
      return {
        user: {
          id: auth.user.id,
          email: auth.user.email,
          fullName: auth.user.fullName,
        },
      }
    }
  }

  async destroy({ auth }: HttpContext) {
    await auth.use('jwt').revoke()

    return {
      message: 'Logged out',
    }
  }
}
