import { Router } from 'express';
import Activity from '../models/activity';
import Leaderboard from '../models/leaderboard';
import Team from '../models/team';
import User from '../models/user';
import Workout from '../models/workout';

const router = Router();

router.get('/api/users/', async (_request, response) => {
  const users = await User.find().populate('team', 'name motto').sort({ username: 1 }).lean();
  response.json(users);
});

router.get('/api/teams/', async (_request, response) => {
  const teams = await Team.find().populate('members', 'username firstName lastName').sort({ name: 1 }).lean();
  response.json(teams);
});

router.get('/api/activities/', async (_request, response) => {
  const activities = await Activity.find()
    .populate('user', 'username firstName lastName')
    .sort({ completedAt: -1 })
    .lean();
  response.json(activities);
});

router.get('/api/leaderboard/', async (_request, response) => {
  const entries = await Leaderboard.find()
    .populate('user', 'username firstName lastName')
    .sort({ points: -1, activitiesCompleted: -1 })
    .lean();
  response.json(entries.map((entry, index) => ({ ...entry, rank: index + 1 })));
});

router.get('/api/workouts/', async (_request, response) => {
  const workouts = await Workout.find()
    .populate('suggestedFor', 'username firstName lastName')
    .sort({ name: 1 })
    .lean();
  response.json(workouts);
});

export default router;
