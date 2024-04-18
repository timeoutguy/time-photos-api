import User from '#models/user'
import { errors, symbols } from '@adonisjs/auth'
import { AuthClientResponse, GuardContract } from '@adonisjs/auth/types'
import { HttpContext } from '@adonisjs/core/http'
import jwt from 'jsonwebtoken'

export type JwtGuardOptions = {
  secret: string
}

export type JwtGuardUser<RealUser> = {
  getId(): string | number | null
  getOriginal(): RealUser
}

export interface JwtUserProviderContract<RealUser> {
  [symbols.PROVIDER_REAL_USER]: RealUser

  createUserForGuard(user: RealUser): Promise<JwtGuardUser<RealUser>>

  findById(identifier: string | number | BigInt): Promise<JwtGuardUser<RealUser> | null>
}

export class JwtGuard<UserProvider extends JwtUserProviderContract<User>>
  implements GuardContract<UserProvider[typeof symbols.PROVIDER_REAL_USER]>
{
  #ctx: HttpContext
  #userProvider: UserProvider
  #options: JwtGuardOptions

  constructor(ctx: HttpContext, userProvider: UserProvider, options: JwtGuardOptions) {
    this.#ctx = ctx
    this.#userProvider = userProvider
    this.#options = options
  }

  declare [symbols.GUARD_KNOWN_EVENTS]: {}

  driverName: 'jwt' = 'jwt'

  authenticationAttempted: boolean = false

  isAuthenticated: boolean = false

  user?: UserProvider[typeof symbols.PROVIDER_REAL_USER]

  async genereate(user: UserProvider[typeof symbols.PROVIDER_REAL_USER]) {
    const providerUser = await this.#userProvider.createUserForGuard(user)
    const remembered = this.#ctx.request.body().rememberMe
    const token = jwt.sign(
      {
        userId: providerUser.getId(),
        fullName: providerUser.getOriginal().fullName,
        email: providerUser.getOriginal().email,
      },
      this.#options.secret,
      { expiresIn: remembered ? '30d' : '1d' }
    )

    return {
      type: 'bearer',
      token,
    }
  }

  async authenticate(): Promise<UserProvider[typeof symbols.PROVIDER_REAL_USER]> {
    if (this.authenticationAttempted) {
      return this.getUserOrFail()
    }
    this.authenticationAttempted = true

    const authHeader = this.#ctx.request.header('Authorization')

    if (!authHeader) {
      return new errors.E_UNAUTHORIZED_ACCESS('Unauthorized access', {
        guardDriverName: this.driverName,
      })
    }

    const [, token] = authHeader.split('Bearer ')

    if (!token) {
      return new errors.E_UNAUTHORIZED_ACCESS('Unauthorized access', {
        guardDriverName: this.driverName,
      })
    }

    const payload = jwt.verify(token, this.#options.secret)

    if (typeof payload !== 'object' || !('userId' in payload)) {
      throw new errors.E_UNAUTHORIZED_ACCESS('Unauthorized access', {
        guardDriverName: this.driverName,
      })
    }

    const providerUser = await this.#userProvider.findById(payload.userId)
    if (!providerUser) {
      throw new errors.E_UNAUTHORIZED_ACCESS('Unauthorized access', {
        guardDriverName: this.driverName,
      })
    }

    this.user = providerUser.getOriginal()
    return this.getUserOrFail()
  }

  async check(): Promise<boolean> {
    try {
      await this.authenticate()
      return true
    } catch {
      return false
    }
  }

  getUserOrFail(): UserProvider[typeof symbols.PROVIDER_REAL_USER] {
    if (!this.user) {
      throw new errors.E_UNAUTHORIZED_ACCESS('Unauthorized access', {
        guardDriverName: this.driverName,
      })
    }

    return this.user
  }

  async authenticateAsClient(
    user: UserProvider[typeof symbols.PROVIDER_REAL_USER],
  ): Promise<AuthClientResponse> {
    const token = await this.genereate(user)

    return {
      headers: {
        authorization: `Bearer ${token.token}`,
      },
    }
  }
}
