const request = require('supertest');
const app = require('../src/server');
const User = require('../src/models/User');
const Game = require('../src/models/Game');
const { generateAccessToken } = require('../src/utils/jwt');

const makeAdminToken = async () => {
  const admin = new User({
    name: 'Admin',
    email: `admin_${Date.now()}@example.com`,
    password: 'password123',
    role: 'ADMIN',
  });
  await admin.save();
  return generateAccessToken(admin._id.toString());
};

describe('Game CRUD (Admin)', () => {
  let token;

  beforeEach(async () => {
    token = await makeAdminToken();
  });

  it('should create, list, update and delete a game', async () => {
    // Create
    const payload = {
      title: 'Test Game',
      description: 'A nice game',
      price: 499,
      currency: 'INR',
      platform: ['PC'],
      genre: ['Action'],
      stock: 10,
    };

    const createRes = await request(app)
      .post('/api/games')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .expect(201);

    expect(createRes.body.game).toBeDefined();
    expect(createRes.body.game.title).toBe(payload.title);
    const gameId = createRes.body.game._id;
    const slug = createRes.body.game.slug;
    expect(slug).toBeTruthy();

    // List
    const listRes = await request(app)
      .get('/api/games')
      .expect(200);
    expect(Array.isArray(listRes.body.games)).toBe(true);
    expect(listRes.body.games.find(g => g._id === gameId)).toBeTruthy();

    // Get by slug
    const getRes = await request(app)
      .get(`/api/games/${slug}`)
      .expect(200);
    expect(getRes.body._id).toBe(gameId);

    // Update
    const updateRes = await request(app)
      .put(`/api/games/${gameId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ price: 599, stock: 5 })
      .expect(200);
    expect(updateRes.body.game.price).toBe(599);
    expect(updateRes.body.game.stock).toBe(5);

    // Delete
    await request(app)
      .delete(`/api/games/${gameId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const deleted = await Game.findById(gameId);
    expect(deleted).toBeNull();
  });

  it('should enforce unique slug', async () => {
    const payload = {
      title: 'Unique Title',
      slug: 'unique-title',
      price: 100,
      platform: ['PC'],
      genre: ['Action']
    };

    await request(app)
      .post('/api/games')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .expect(201);

    const dupRes = await request(app)
      .post('/api/games')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .expect(400);

    expect(dupRes.body.error).toContain('slug');
  });
});
