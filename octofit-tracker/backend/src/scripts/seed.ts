import mongoose from 'mongoose';
import { connectDatabase } from '../config/database';
import activity from '../models/activity';
import leaderboard from '../models/leaderboard';
import team from '../models/team';
import user from '../models/user';
import workout from '../models/workout';

async function seedDatabase() {
  try {
    await connectDatabase();

    console.log('Seed the octofit_db database with test data');

    const userRecords = [
      { username: 'alex-morgan', email: 'alex.morgan@example.com', firstName: 'Alex', lastName: 'Morgan' },
      { username: 'jamie-chen', email: 'jamie.chen@example.com', firstName: 'Jamie', lastName: 'Chen' },
      { username: 'sam-rivera', email: 'sam.rivera@example.com', firstName: 'Sam', lastName: 'Rivera' },
      { username: 'taylor-patel', email: 'taylor.patel@example.com', firstName: 'Taylor', lastName: 'Patel' },
    ];
    const users = [];
    for (const record of userRecords) {
      const existingUser = await user.findOne({ email: record.email });
      users.push(existingUser ?? await user.create(record));
    }
    const [alex, jamie, sam, taylor] = users;

    const teamRecords = [
      { name: 'Trail Blazers', motto: 'Every mile is a milestone', members: [alex._id, jamie._id] },
      { name: 'Pulse Crew', motto: 'Find your pace together', members: [sam._id, taylor._id] },
    ];
    const teams = [];
    for (const record of teamRecords) {
      const existingTeam = await team.findOne({ name: record.name });
      teams.push(existingTeam ?? await team.create(record));
    }
    for (const [index, member] of users.entries()) {
      await user.updateOne({ _id: member._id }, { $set: { team: teams[index < 2 ? 0 : 1]._id } });
    }

    const activityRecords = [
      { user: alex._id, type: 'Running', durationMinutes: 32, distanceKm: 5.2, points: 52, completedAt: new Date('2026-10-08T07:30:00Z') },
      { user: alex._id, type: 'Cycling', durationMinutes: 45, distanceKm: 14, points: 45, completedAt: new Date('2026-10-06T16:00:00Z') },
      { user: jamie._id, type: 'Yoga', durationMinutes: 40, points: 40, completedAt: new Date('2026-10-08T18:15:00Z') },
      { user: sam._id, type: 'Running', durationMinutes: 28, distanceKm: 4.1, points: 41, completedAt: new Date('2026-10-07T06:45:00Z') },
      { user: taylor._id, type: 'Strength Training', durationMinutes: 35, points: 35, completedAt: new Date('2026-10-07T17:30:00Z') },
    ];
    for (const record of activityRecords) {
      const existingActivity = await activity.findOne({
        user: record.user,
        type: record.type,
        completedAt: record.completedAt,
      });
      if (!existingActivity) {
        await activity.create(record);
      }
    }

    const leaderboardRecords = [
      { user: alex._id, points: 97, activitiesCompleted: 2 },
      { user: jamie._id, points: 40, activitiesCompleted: 1 },
      { user: sam._id, points: 41, activitiesCompleted: 1 },
      { user: taylor._id, points: 35, activitiesCompleted: 1 },
    ];
    for (const record of leaderboardRecords) {
      const existingEntry = await leaderboard.findOne({ user: record.user });
      if (existingEntry) {
        await leaderboard.updateOne({ _id: existingEntry._id }, { $set: record });
      } else {
        await leaderboard.create(record);
      }
    }

    const workoutRecords = [
      {
        name: 'Easy 5K Builder',
        description: 'A steady-paced run with a short warm-up and cool-down.',
        activityType: 'Running',
        difficulty: 'beginner',
        durationMinutes: 35,
        suggestedFor: [alex._id, sam._id],
      },
      {
        name: 'Full Body Foundations',
        description: 'A balanced strength session focused on controlled movements.',
        activityType: 'Strength Training',
        difficulty: 'intermediate',
        durationMinutes: 40,
        suggestedFor: [taylor._id],
      },
      {
        name: 'Recovery Flow',
        description: 'A gentle mobility and yoga session to support recovery.',
        activityType: 'Yoga',
        difficulty: 'beginner',
        durationMinutes: 25,
        suggestedFor: [jamie._id],
      },
    ];
    for (const record of workoutRecords) {
      const existingWorkout = await workout.findOne({ name: record.name });
      if (existingWorkout) {
        await workout.updateOne({ _id: existingWorkout._id }, { $set: record });
      } else {
        await workout.create(record);
      }
    }

    console.log('Database seeding complete');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

void seedDatabase();
