import { DateTime } from 'luxon'
import {
  BaseModel,
  beforeCreate,
  belongsTo,
  column,
  computed,
  manyToMany,
} from '@adonisjs/lucid/orm'
import User from './user.js'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import { randomUUID } from 'node:crypto'
import Category from '#models/category'

export default class Image extends BaseModel {
  static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare path: string

  @column()
  declare user_id: string

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @manyToMany(() => Category)
  declare categories: ManyToMany<typeof Category>

  @computed()
  get url() {
    return `/uploads/${this.path}`
  }

  @beforeCreate()
  static async createUUID(model: Image) {
    model.id = randomUUID()
  }
}
