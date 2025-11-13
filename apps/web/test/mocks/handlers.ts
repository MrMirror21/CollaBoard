import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/boards/:id', ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      title: 'Test Board',
      lists: [],
    });
  }),
];
