import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Star, Target, TrendingUp, Users, Award } from 'lucide-react';
import api from '@/lib/api';

const GamificationDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [leaderboards, setLeaderboards] = useState([]);
  const [badges, setBadges] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGamificationData();
  }, []);

  const fetchGamificationData = async () => {
    try {
      const [profileRes, leaderboardsRes, badgesRes, achievementsRes] = await Promise.all([
        api.get('/gamification/profiles/my-stats/'),
        api.get('/gamification/leaderboards/current/'),
        api.get('/gamification/badges/my-badges/'),
        api.get('/gamification/achievements/my-achievements/')
      ]);

      setProfile(profileRes.data.profile);
      setLeaderboards(leaderboardsRes.data);
      setBadges(badgesRes.data);
      setAchievements(achievementsRes.data);
    } catch (error) {
      console.error('Error fetching gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Trophy className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Total Points</p>
                <p className="text-2xl font-bold">{profile?.total_points || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Star className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Level</p>
                <p className="text-2xl font-bold">{profile?.level_name || 'Beginner'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Award className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Badges</p>
                <p className="text-2xl font-bold">{profile?.badges_count || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Streak</p>
                <p className="text-2xl font-bold">{profile?.streak_days || 0} days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Level Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Level {profile?.current_level || 1} - {profile?.level_name || 'Beginner'}</span>
              <span>{profile?.level_progress || 0}%</span>
            </div>
            <Progress value={profile?.level_progress || 0} className="h-2" />
            <p className="text-xs text-gray-600">
              {profile?.next_level_points ? `${profile?.total_points || 0} / ${profile.next_level_points} points to next level` : 'Maximum level reached!'}
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="leaderboards" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="leaderboards">Leaderboards</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Leaderboards */}
        <TabsContent value="leaderboards" className="space-y-4">
          {leaderboards.map((item) => (
            <Card key={item.leaderboard.id}>
              <CardHeader>
                <CardTitle className="text-lg">{item.leaderboard.metric_display} - {item.leaderboard.period_display}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {item.top_entries.map((entry, index) => (
                    <div key={entry.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                          index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-gray-600'
                        }`}>
                          {entry.rank}
                        </div>
                        <div>
                          <p className="font-medium">{entry.user_name}</p>
                          <p className="text-sm text-gray-600">{entry.user_role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{entry.score}</p>
                        <p className="text-sm text-gray-600">points</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Badges */}
        <TabsContent value="badges" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map((badge) => (
              <Card key={badge.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="text-center space-y-3">
                    <div className="text-4xl">{badge.badge_icon}</div>
                    <div>
                      <h3 className="font-bold">{badge.badge_name}</h3>
                      <Badge variant="secondary" className="mt-1">{badge.badge_type_display}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{badge.badge.description}</p>
                    <p className="text-xs text-gray-500">Earned: {new Date(badge.earned_at).toLocaleDateString()}</p>
                    <p className="text-sm font-medium text-green-600">+{badge.points_earned} points</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Achievements */}
        <TabsContent value="achievements" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => (
              <Card key={achievement.id}>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold">{achievement.achievement_name}</h3>
                      <Badge variant="outline">{achievement.points_earned_display}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{achievement.achievement.description}</p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Users className="h-4 w-4" />
                      <span>Unlocked: {new Date(achievement.unlocked_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Activity */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {profile?.recent_transactions?.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        transaction.transaction_type === 'earned' ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-gray-600">{transaction.transaction_type_display}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${transaction.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.points_display}
                      </p>
                      <p className="text-xs text-gray-500">{new Date(transaction.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GamificationDashboard;
