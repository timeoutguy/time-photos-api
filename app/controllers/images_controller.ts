import Image from '#models/image'
import { createImageValidator, updateImageValidator } from '#validators/image'
import { cuid } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { unlink } from 'node:fs'
import { normalize } from 'node:path'

export default class ImagesController {
  /**
   * Display a list of resource
   */
  async index({ auth }: HttpContext) {
    const images = await Image.findManyBy('user_id', auth.user?.id)

    return images
  }

  /**
   * Display form to create a new record
   */
  async create({}: HttpContext) {}

  /**
   * Handle form submission for the create action
   */
  async store({ request, auth }: HttpContext) {
    const { image: imageFile } = await request.validateUsing(createImageValidator)
    const { name, categories } = request.all()

    await imageFile.move(app.publicPath('uploads'), {
      name: `${cuid()}.${imageFile.extname}`,
    })

    const image = new Image()

    image.path = imageFile.fileName ?? ''
    image.name = name
    image.user_id = auth.user?.id as string

    await image.save()

    if (categories && categories.length > 0) {
      await image.related('categories').attach(categories)
    }

    await image.load('categories')

    return image
  }

  /**
   * Show individual record
   */
  async show({ params, auth }: HttpContext) {
    const image = await Image.findByOrFail({ id: params.id, user_id: auth.user?.id })

    return image
  }

  /**
   * Edit individual record
   */
  async edit({ params }: HttpContext) {}

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request }: HttpContext) {
    const payload = await request.validateUsing(updateImageValidator)
    const image = await Image.findOrFail(params.id)

    if (payload.image) {
      await payload.image.move(app.makePath('uploads'), {
        name: `${cuid()}.${payload.image.extname}`,
      })
      const filePath = image.path
      const normalizedPath = normalize(filePath)
      const absolutePath = app.makePath('uploads', normalizedPath)
      unlink(absolutePath, () => {})
    }

    image.merge({
      path: payload.image?.fileName ?? image.path,
      name: payload.name,
    })

    await image.save()

    return image
  }

  /**
   * Delete record
   */
  async destroy({ params, response }: HttpContext) {
    const image = await Image.findOrFail(params.id)

    await image.delete()

    const filePath = image.path
    const normalizedPath = normalize(filePath)
    const absolutePath = app.makePath('uploads', normalizedPath)
    unlink(absolutePath, () => {})

    return response.json({ message: 'Image deleted successfully' })
  }
}
