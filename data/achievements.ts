
import { Achievement } from '../types';
import { ScanIcon, FireIcon, StarIcon, TrophyIcon, TargetIcon, AcademicCapIcon, BookmarkSquareIcon } from '../components/icons/Icons';

export const achievements: Achievement[] = [
  {
    id: 'scanner_novice',
    name: 'Novice du Scan',
    description: 'Scannez 10 repas.',
    icon: ScanIcon,
    criteria: ({ meals }) => meals.length >= 10,
  },
  {
    id: 'streak_3_days',
    name: 'En Feu !',
    description: 'Maintenez une série de 3 jours consécutifs.',
    icon: FireIcon,
    criteria: ({ streak }) => streak >= 3,
  },
  {
    id: 'streak_7_days',
    name: 'Imparable',
    description: 'Maintenez une série de 7 jours consécutifs.',
    icon: FireIcon,
    criteria: ({ streak }) => streak >= 7,
  },
  {
    id: 'high_scorer',
    name: 'Excellent Score',
    description: 'Obtenez un score glycémique de 95 ou plus pour un repas.',
    icon: StarIcon,
    criteria: ({ meals }) => meals.some(m => m.glycemicScore >= 95),
  },
  {
    id: 'top_student',
    name: 'Premier de la classe',
    description: 'Obtenez un score glycémique parfait de 100.',
    icon: AcademicCapIcon,
    criteria: ({ meals }) => meals.some(m => m.glycemicScore === 100),
  },
  {
    id: 'goal_setter',
    name: 'Ambitieux',
    description: 'Définissez votre premier objectif de santé.',
    icon: TargetIcon,
    criteria: ({ goal }) => goal !== null,
  },
  {
    id: 'perfect_week',
    name: 'Semaine Parfaite',
    description: 'Scannez au moins un repas chaque jour pendant 7 jours.',
    icon: TrophyIcon,
    criteria: ({ meals }) => {
        if (meals.length < 7) return false;
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const mealDays = new Set(
            meals
                .filter(m => new Date(m.timestamp) > sevenDaysAgo)
                .map(m => new Date(m.timestamp).toDateString())
        );
        return mealDays.size >= 7;
    }
  },
];
