import { Hono } from 'hono';

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get('/api/articles', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM Articles').all();
  return c.json({ success: true, data: results });
});

app.post('/api/submissions', async (c) => {
  const body = await c.req.json();
  const info = await c.env.DB.prepare(
    'INSERT INTO Submissions (author_id, proposed_title, proposed_content) VALUES (?,?,?)'
  ).bind(body.author_id, body.proposed_title, body.proposed_content).run();
  return c.json({ success: true, message: 'Submission queued for moderation.' }, 201);
});

export default app;