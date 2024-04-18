/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

const UsersController = () => import('#controllers/users_controller')
const ImagesController = () => import('#controllers/images_controller')
const SessionController = () => import('#controllers/session_controller')
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router.group(() => {
  router.get('users', [UsersController, 'index'])
  router.get('users/:id', [UsersController, 'show'])
  router.post('users/register', [UsersController, 'store'])
  router.patch('users/:id', [UsersController, 'update'])
  router.delete('users/:id', [UsersController, 'destroy'])
})

router.post('login', [SessionController, 'store'])
router
  .group(() => {
    router.post('login/token', [SessionController, 'loginWithToken'])
    router.post('logout', [SessionController, 'destroy'])
  })
  .use(
    middleware.auth({
      guards: ['jwt'],
    })
  )

router
  .group(() => {
    router.post('images', [ImagesController, 'store'])
    router.get('images', [ImagesController, 'index'])
    router.get('images/:id', [ImagesController, 'show'])
    router.patch('images/:id', [ImagesController, 'update'])
    router.delete('images/:id', [ImagesController, 'destroy'])
  })
  .use(
    middleware.auth({
      guards: ['jwt'],
    })
  )
