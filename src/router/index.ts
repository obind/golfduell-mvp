import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CreateMatchView from '../views/CreateMatchView.vue'
import JoinMatchView from '../views/JoinMatchView.vue'
import MyMatchesView from '../views/MyMatchesView.vue'
import FriendsView from '../views/FriendsView.vue'
import LeaderboardView from '../views/LeaderboardView.vue'
import MatchDetailView from '../views/MatchDetailView.vue'
import ScoreEntryView from '../views/ScoreEntryView.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/create-match',
    name: 'create-match',
    component: CreateMatchView,
  },
  {
    path: '/join-match',
    name: 'join-match',
    component: JoinMatchView,
  },
  {
    path: '/join/:code',
    name: 'join-with-code',
    component: JoinMatchView,
  },
  {
    path: '/my-matches',
    name: 'my-matches',
    component: MyMatchesView,
  },
  {
    path: '/friends',
    name: 'friends',
    component: FriendsView,
  },
  {
    path: '/leaderboard',
    name: 'leaderboard',
    component: LeaderboardView,
  },
  {
    path: '/match/:id',
    name: 'match-detail',
    component: MatchDetailView,
  },
  {
    path: '/match/:id/score',
    name: 'score-entry',
    component: ScoreEntryView,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
