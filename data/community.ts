
import { CommunityPost, LeaderboardUser } from '../types';

export const communityPostsData: CommunityPost[] = [
  {
    id: 'post-1',
    author: {
      name: 'Claire L.',
      nickname: 'FitClaire',
      avatarUrl: 'https://picsum.photos/seed/claire/200',
    },
    content: 'Mon astuce pour un petit-déjeuner rapide et sain : un yaourt grec avec des baies fraîches, une cuillère de graines de chia et quelques amandes. Stable toute la matinée !',
    category: 'Astuce',
    timestamp: new Date(Date.now() - 3600 * 1000 * 2).toISOString(), // 2 hours ago
    reactions: { like: 12, love: 5, idea: 8 },
  },
  {
    id: 'post-2',
    author: {
      name: 'Marc Dupond',
      avatarUrl: 'https://picsum.photos/seed/marc/200',
    },
    content: 'Je cherche une bonne recette de curry de légumes à faible indice glycémique, des suggestions ? Merci d\'avance !',
    category: 'Question',
    timestamp: new Date(Date.now() - 3600 * 1000 * 5).toISOString(), // 5 hours ago
    reactions: { like: 7, love: 1, idea: 3 },
  },
  {
    id: 'post-3',
    author: {
      name: 'Sophie Martin',
      nickname: 'SophieCooks',
      avatarUrl: 'https://picsum.photos/seed/sophie/200',
    },
    content: 'Ma recette fétiche de saumon en papillote : un filet de saumon, des rondelles de courgettes et de tomates, un filet de jus de citron, des herbes de Provence. 20 minutes au four à 180°C. Un délice !',
    category: 'Recette',
    timestamp: new Date(Date.now() - 3600 * 1000 * 24).toISOString(), // 1 day ago
    reactions: { like: 25, love: 18, idea: 4 },
  },
  {
    id: 'post-4',
    author: {
      name: 'Julien Petit',
      avatarUrl: 'https://picsum.photos/seed/julien/200',
    },
    content: 'Ne lâchez rien ! Chaque repas est une nouvelle occasion de faire un choix sain pour votre corps. Vous êtes plus forts que vous ne le pensez.',
    category: 'Motivation',
    timestamp: new Date(Date.now() - 3600 * 1000 * 48).toISOString(), // 2 days ago
    reactions: { like: 32, love: 22, idea: 2 },
  },
];

export const leaderboardData: LeaderboardUser[] = [
  { rank: 1, name: 'Hélène G.', nickname: 'HeleneFit', avatarUrl: 'https://picsum.photos/seed/helene/200', score: 2450, rankChange: 'up' },
  { rank: 2, name: 'Thomas R.', avatarUrl: 'https://picsum.photos/seed/thomas/200', score: 2310, rankChange: 'down' },
  { rank: 3, name: 'Alex Doe', nickname: 'Lex', avatarUrl: `https://picsum.photos/seed/alex/200`, score: 2280, isCurrentUser: true, rankChange: 'stable' },
  { rank: 4, name: 'Laura B.', avatarUrl: 'https://picsum.photos/seed/laura/200', score: 2150, rankChange: 'up' },
  { rank: 5, name: 'David M.', nickname: 'DaveRunner', avatarUrl: 'https://picsum.photos/seed/david/200', score: 2090, rankChange: 'stable' },
];
