import { describe, it, afterAll, beforeEach, expect } from 'vitest'
import request from 'supertest'
import app, { prisma as appPrisma } from '../../src/index'
import { prisma, resetDb, seedMinimal } from './testDb'

describe('Tasks API', () => {
  afterAll(async () => {
    await prisma.$disconnect()
    await appPrisma.$disconnect()
  })

  beforeEach(async () => {
    await resetDb()
  })

  it('POST /api/tasks cria uma tarefa válida', async () => {
    const { user, category } = await seedMinimal()
    const res = await request(app)
      .post('/api/tasks')
      .send({
        title: 'Comprar pão',
        description: 'Ir à padaria de manhã',
        userId: user.id,
        categoryId: category.id,
      })
    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toMatchObject({ title: 'Comprar pão', userId: user.id })
  })

  it('GET /api/tasks lista tarefas', async () => {
    const { user, category } = await seedMinimal()
    await prisma.task.create({
      data: {
        title: 'Estudar Vitest',
        description: 'Ler documentação',
        userId: user.id,
        categoryId: category.id,
      },
    })
    const res = await request(app).get('/api/tasks')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data.some((t: any) => t.title === 'Estudar Vitest')).toBe(true)
  })

  it('PUT /api/tasks/:id atualiza uma tarefa', async () => {
    const { user, category } = await seedMinimal()
    const task = await prisma.task.create({
      data: {
        title: 'Lavar o carro',
        description: 'Antes do almoço',
        userId: user.id,
        categoryId: category.id,
      },
    })

    const res = await request(app)
      .put(`/api/tasks/${task.id}`)
      .send({ title: 'Lavar o carro (tarde)' })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.title).toBe('Lavar o carro (tarde)')
  })

  it('DELETE /api/tasks/:id remove uma tarefa', async () => {
    const { user, category } = await seedMinimal()
    const task = await prisma.task.create({
      data: { title: 'Passear com o cachorro', userId: user.id, categoryId: category.id },
    })

    const res = await request(app).delete(`/api/tasks/${task.id}`)
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)

    const exists = await prisma.task.findUnique({ where: { id: task.id } })
    expect(exists).toBeNull()
  })
})
