import vine from '@vinejs/vine'

export const createImageValidator = vine.compile(
  vine.object({
    image: vine.file({
      size: '2mb',
      extnames: ['jpg', 'jpeg', 'png'],
    }),
    name: vine.string().trim().maxLength(255),
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
  })
)
