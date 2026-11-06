# Mettre Socle en ligne pour l'ouvrir sur iPhone

L'app est prête pour un hébergement en ligne : image Docker, base SQLite sur un disque persistant,
accès protégé par mot de passe, et installable sur l'écran d'accueil de l'iPhone.

Hébergeur conseillé : **Railway** (déploie directement depuis GitHub, disque persistant inclus,
environ 5 $ par mois avec le plan Hobby). Fly.io ou Render fonctionnent aussi avec le même Dockerfile.

## 1. Mettre le code sur GitHub
Crée un dépôt **privé** vide sur github.com (par exemple `socle`) et le code y est poussé.

## 2. Créer le service sur Railway
1. Va sur railway.com et connecte-toi avec ton compte GitHub.
2. *New Project* → *Deploy from GitHub repo* → choisis `socle`. Railway détecte le `Dockerfile` tout seul.
3. Dans le service, onglet **Variables**, ajoute :
   - `APP_PASSWORD` : un mot de passe long (c'est lui qui protège tes données) ;
   - `AUTH_SECRET` : une longue chaîne aléatoire (par exemple générée par un gestionnaire de mots de passe).
4. Clic droit sur le service → **Attach volume**, point de montage : `/data`.
   Sans ce volume, les données seraient effacées à chaque redéploiement.
5. Onglet **Settings** → *Networking* → **Generate Domain**. Tu obtiens une adresse en `https://…up.railway.app`.

## 3. Sur l'iPhone
1. Ouvre l'adresse dans **Safari** et connecte-toi avec ton mot de passe.
2. Bouton Partager → **Sur l'écran d'accueil**. Socle s'ouvre ensuite en plein écran comme une app.
La session reste ouverte 90 jours. Changer `APP_PASSWORD` déconnecte tous les appareils.

## Mises à jour
Chaque modification poussée sur la branche `main` redéploie l'app automatiquement ; les données du volume `/data` sont conservées.

## Sauvegarde
La base tient dans un seul fichier, `/data/socle.db`. Railway propose des sauvegardes du volume
(onglet *Backups* du volume) : active-les.

## En local
Sans `APP_PASSWORD`, l'app reste ouverte sans mot de passe (`npm run dev`).
