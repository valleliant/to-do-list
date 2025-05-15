/**
 * Retourne un message de bienvenue personnalisé en fonction de l'heure
 * @param userName Nom de l'utilisateur
 * @returns Message de bienvenue personnalisé
 */
export const getGreeting = (userName: string = ''): string => {
  const hour = new Date().getHours();
  let greeting: string;

  if (hour >= 5 && hour < 12) {
    greeting = 'Bonjour';
  } else if (hour >= 12 && hour < 18) {
    greeting = 'Bon après-midi';
  } else if (hour >= 18 && hour < 22) {
    greeting = 'Bonsoir';
  } else {
    greeting = 'Bonne nuit';
  }

  // Ajouter le nom si disponible
  if (userName.trim()) {
    return `${greeting}, ${userName}`;
  }

  return greeting;
};

/**
 * Retourne un message spécial pour le matin quand on se réveille
 * @param userName Nom de l'utilisateur
 * @returns Message personnalisé du matin
 */
export const getMorningGreeting = (userName: string = ''): string => {
  const hour = new Date().getHours();
  
  // Uniquement entre 5h et 10h du matin
  if (hour >= 5 && hour < 10) {
    if (userName.trim()) {
      return `Bien dormi, ${userName} ?`;
    }
    return 'Bien dormi ?';
  }
  
  // Sinon, retourner le message de bienvenue normal
  return getGreeting(userName);
};

/**
 * Retourne un message de productivité basé sur l'heure et le jour
 * @param userName Nom de l'utilisateur
 * @returns Message de motivation
 */
export const getProductivityMessage = (userName: string = ''): string => {
  const date = new Date();
  const hour = date.getHours();
  const day = date.getDay(); // 0 = dimanche, 1 = lundi, etc.
  
  // Weekend
  if (day === 0 || day === 6) {
    return "C'est le weekend, profitez-en !";
  }
  
  // Début de semaine (lundi, mardi)
  if (day === 1 || day === 2) {
    return "Belle semaine qui commence !";
  }
  
  // Milieu de semaine (mercredi, jeudi)
  if (day === 3 || day === 4) {
    return "On maintient le cap !";
  }
  
  // Vendredi
  if (day === 5) {
    return "C'est bientôt le weekend !";
  }
  
  // Messages selon l'heure
  if (hour < 12) {
    return "Prêt pour une journée productive ?";
  } else if (hour < 15) {
    return "Encore quelques tâches à accomplir !";
  } else {
    return "Dernière ligne droite !";
  }
}; 