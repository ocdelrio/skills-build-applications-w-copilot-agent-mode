import { Types } from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

type Input = Record<string, unknown>;

function badRequest(message: string): Error & { status: number } {
  return Object.assign(new Error(message), { status: 400 });
}

function notFound(message: string): Error & { status: number } {
  return Object.assign(new Error(message), { status: 404 });
}

function asInput(input: unknown): Input {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw badRequest('Request body must be an object');
  return input as Input;
}

function objectId(value: unknown, field: string): string {
  if (typeof value !== 'string' || !Types.ObjectId.isValid(value)) throw badRequest(`${field} must be a valid id`);
  return value;
}

function positiveMinutes(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) throw badRequest('minutes must be a positive number');
  return value;
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  const body = asInput(input);
  const userId = objectId(body.userId, 'userId');
  const teamId = objectId(body.teamId, 'teamId');
  const type = typeof body.type === 'string' && body.type.trim() ? body.type.trim() : null;
  if (!type) throw badRequest('type is required');
  const minutes = positiveMinutes(body.minutes);
  const [user, team] = await Promise.all([User.findById(userId).select('_id'), Team.findById(teamId).select('_id')]);
  if (!user) throw notFound('User not found');
  if (!team) throw notFound('Team not found');
  return Activity.create({ user: userId, team: teamId, type, minutes, points: minutes, occurredAt: new Date() });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  const body = asInput(input);
  const name = typeof body.name === 'string' && body.name.trim() ? body.name.trim() : null;
  if (!name) throw badRequest('name is required');
  const mascot = typeof body.mascot === 'string' ? body.mascot.trim() : '';
  if (!mascot) throw badRequest('mascot is required');
  const members = body.members ?? [];
  if (!Array.isArray(members)) throw badRequest('members must be an array');
  const memberIds = members.map((member) => objectId(member, 'member'));
  return Team.create({ name, mascot, members: memberIds });
}

export async function getLeaderboard() {
  const rows = await Activity.aggregate<{ _id: Types.ObjectId; totalPoints: number; teamName: string }>([
    { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    { $lookup: { from: 'teams', localField: '_id', foreignField: '_id', as: 'team' } },
    { $unwind: '$team' },
    { $project: { _id: 1, totalPoints: 1, teamName: '$team.name' } },
    { $sort: { totalPoints: -1, teamName: 1 } },
  ]);
  return rows.map((row, index) => ({ teamName: row.teamName, totalPoints: row.totalPoints, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail }).lean();
  if (!user) throw notFound('User not found');
  const recentActivity = await Activity.findOne({ user: user._id }).sort({ occurredAt: -1 }).lean();
  const activityFocus: Record<string, string> = { run: 'endurance', cycle: 'endurance', strength: 'strength', walk: 'mobility', yoga: 'mobility' };
  const focus = user.fitnessGoal || (recentActivity ? activityFocus[recentActivity.type] : undefined) || 'general';
  const matching = await Workout.find({ focus }).lean();
  const workouts = matching.length ? matching : await Workout.find().lean();
  return workouts.map((workout) => ({
    ...workout,
    reason: `Matches ${focus} goal${recentActivity ? ` and recent ${recentActivity.type} activity` : ''}.`,
  }));
}

export { User };
