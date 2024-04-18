import vine from '@vinejs/vine'

export const createUserValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().maxLength(255),
    email: vine.string().email(),
    password: vine.string().minLength(8).maxLength(255),
  })
)

export const updateUserValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().maxLength(255).optional(),
    email: vine.string().email().optional(),
  })
)
