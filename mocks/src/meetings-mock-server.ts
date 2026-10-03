import {
  createMeetingInputSchema,
  listMeetingsQuerySchema,
  meetingSchema,
  rsvpInputSchema,
} from '@meet/schemas';

import { json, readJson } from './http';
import { createSeedMeetings } from './seed';

import type { ZodError } from 'zod';
import type { Meeting, RsvpInput } from '@meet/schemas';

type MatchedRoute =
  | { kind: 'list' }
  | { kind: 'create' }
  | { kind: 'get'; id: string }
  | { kind: 'rsvp'; id: string }
  | { kind: 'join'; id: string };

function laravelErrors(error: ZodError): Record<string, string[]> {
  const errors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const key = issue.path[0];
    const field = typeof key === 'string' ? key : 'form';
    const current = errors[field] ?? [];
    current.push(issue.message);
    errors[field] = current;
  }

  return errors;
}

function validationResponse(error: ZodError): Response {
  return json(
    {
      message: 'The given data was invalid.',
      errors: laravelErrors(error),
    },
    422,
  );
}

function notFound(): Response {
  return json({ message: 'Meeting not found.' }, 404);
}

function matchRoute(
  method: string,
  pathname: string,
): MatchedRoute | undefined {
  const [root, resource, id, action] = pathname.split('/').filter(Boolean);
  if (root !== 'api' || resource !== 'meetings') {
    return undefined;
  }

  if (!id && method === 'GET') {
    return { kind: 'list' };
  }

  if (!id && method === 'POST') {
    return { kind: 'create' };
  }

  if (id && !action && method === 'GET') {
    return { kind: 'get', id };
  }

  if (id && action === 'rsvp' && method === 'POST') {
    return { kind: 'rsvp', id };
  }

  if (id && action === 'join' && method === 'GET') {
    return { kind: 'join', id };
  }

  return undefined;
}

export class MeetingsMockServer {
  private meetings: Meeting[];

  constructor(seed: Meeting[] = createSeedMeetings()) {
    this.meetings = seed;
  }

  reset(seed: Meeting[] = createSeedMeetings()): void {
    this.meetings = seed;
  }

  async handle(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const route = matchRoute(request.method, url.pathname);
    if (!route) {
      return json({ message: 'Not found.' }, 404);
    }

    switch (route.kind) {
      case 'list':
        return this.list(url);
      case 'create':
        return this.create(request);
      case 'get':
        return this.get(route.id);
      case 'rsvp':
        return this.rsvp(route.id, request);
      case 'join':
        return this.join(route.id);
    }
  }

  private list(url: URL): Response {
    const status = url.searchParams.get('status');
    const parsed = listMeetingsQuerySchema.safeParse({
      page: url.searchParams.get('page'),
      per_page: url.searchParams.get('per_page'),
      ...(status ? { status } : {}),
    });
    if (!parsed.success) {
      return validationResponse(parsed.error);
    }

    const filtered = this.meetings
      .filter((meeting) =>
        parsed.data.status ? meeting.status === parsed.data.status : true,
      )
      .sort((left, right) => left.starts_at.localeCompare(right.starts_at));
    const start = (parsed.data.page - 1) * parsed.data.per_page;

    return json({
      data: filtered.slice(start, start + parsed.data.per_page),
      meta: {
        page: parsed.data.page,
        per_page: parsed.data.per_page,
        total: filtered.length,
      },
    });
  }

  private get(id: string): Response {
    const meeting = this.meetings.find((item) => item.id === id);
    return meeting ? json(meeting) : notFound();
  }

  private async create(request: Request): Promise<Response> {
    const parsed = createMeetingInputSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      return validationResponse(parsed.error);
    }

    const meeting = meetingSchema.parse({
      id: `meet-${crypto.randomUUID()}`,
      title: parsed.data.title,
      starts_at: parsed.data.starts_at,
      duration_min: parsed.data.duration_min,
      status: 'scheduled',
      my_rsvp: 'pending',
      participants_count: 1,
    });
    this.meetings = [...this.meetings, meeting];
    return json(meeting, 201);
  }

  private async rsvp(id: string, request: Request): Promise<Response> {
    const parsed = rsvpInputSchema.safeParse(await readJson(request));
    if (!parsed.success) {
      return validationResponse(parsed.error);
    }

    const current = this.meetings.find((item) => item.id === id);
    if (!current) {
      return notFound();
    }

    const next = meetingSchema.parse({
      ...current,
      my_rsvp: parsed.data.status,
      participants_count: nextParticipants(current, parsed.data.status),
    });
    this.meetings = this.meetings.map((item) => (item.id === id ? next : item));
    return json(next);
  }

  private join(id: string): Response {
    const meeting = this.meetings.find((item) => item.id === id);
    if (!meeting) {
      return notFound();
    }

    const meetingNumber = `${100000 + this.meetings.indexOf(meeting)}`;
    return json({
      join_url: `https://zoom.us/j/${meetingNumber}`,
      zoom: {
        meeting_number: meetingNumber,
        signature: `mock-signature-${meeting.id}`,
      },
    });
  }
}

function nextParticipants(
  meeting: Meeting,
  status: RsvpInput['status'],
): number {
  const wasAccepted = meeting.my_rsvp === 'accepted';
  const willAccept = status === 'accepted';
  if (!wasAccepted && willAccept) {
    return meeting.participants_count + 1;
  }

  if (wasAccepted && !willAccept) {
    return Math.max(0, meeting.participants_count - 1);
  }

  return meeting.participants_count;
}
