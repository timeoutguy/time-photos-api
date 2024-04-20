import vine from '@vinejs/vine'

export const createImageValidator = vine.compile(
  vine.object({
    image: vine.file({
      size: '2mb',
      extnames: ['jpg', 'jpeg', 'png'],
    }),
    name: vine.string().trim().maxLength(255),
    categories: vine.array(vine.string()).optional(),
  })
)

export const updateImageValidator = vine.compile(
  vine.object({
    image: vine
      .file({
        size: '2mb',
        extnames: ['jpg', 'jpeg', 'png'],
      })
      .optional(),
    name: vine.string().trim().maxLength(255).optional(),
    categories: vine.array(vine.string()).optional(),
  })
)
