import { describe, it, afterAll, beforeEach, expect } from 'vitest'
import request from 'supertest'
import app, { prisma as appPrisma } from '../../src/index'
import { prisma, resetDb } from './testDb'

describe('Users API', () => {
  afterAll(async () => {
    await prisma.$disconnect()
    await appPrisma.$disconnect()
  })

  beforeEach(async () => {
    await resetDb()
  })

  it('POST /api/users cria usuário válido', async () => {
    const email = `ana${Date.now()}@ex.com`
    const res = await request(app)
      .post('/api/users')
      .send({ name: 'Ana', email })
    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toMatchObject({ name: 'Ana', email })
  })

  it('GET /api/users lista usuários', async () => {
    const email = `ana${Date.now()}@ex.com`
    await prisma.user.create({ data: { name: 'Ana', email } })

    const res = await request(app).get('/api/users')

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data.length).toBeGreaterThan(0)
    expect(res.body.data[0]).toHaveProperty('email')
  })

  it('PUT /api/users/:id atualiza um usuário', async () => {
    const user = await prisma.user.create({ data: { name: 'Ana', email: `ana${Date.now()}@ex.com` } })
    const res = await request(app)
      .put(`/api/users/${user.id}`)
      .send({ name: 'Ana Maria' })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.name).toBe('Ana Maria')
  })

  it('DELETE /api/users/:id remove um usuário', async () => {
    const user = await prisma.user.create({ data: { name: 'Carlos', email: `carlos${Date.now()}@ex.com` } })
    const res = await request(app).delete(`/api/users/${user.id}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)

    const exists = await prisma.user.findUnique({ where: { id: user.id } })
    expect(exists).toBeNull()
  })
})
