# Gooday

Journal intime pour iOS : une note par jour, et une note de la journée sur 5 étoiles.

Application [Expo](https://expo.dev) (SDK 57), testée avec **Expo Go** sur iPhone.

## Lancer le projet (Windows)

Prérequis : [Node.js LTS](https://nodejs.org) et l'app **Expo Go** sur l'iPhone.

```bash
npm install
npx expo start
```

Scanne le QR code avec l'appareil photo de l'iPhone. Le PC et l'iPhone doivent être sur le même Wi-Fi ; sinon : `npx expo start --tunnel`.

## Fonctionnalités

- **Aujourd'hui** : 5 étoiles + zone de texte, enregistrement automatique.
- **Historique** : liste des jours par mois, nombre de jours écrits et note moyenne.
- **Détail d'un jour** : relire, modifier ou supprimer une journée passée.

## Structure

```
src/
  app/                 Écrans (Expo Router : un fichier = un écran)
    _layout.tsx        Base de données + navigation
    (tabs)/index.tsx   Onglet « Aujourd'hui »
    (tabs)/history.tsx Onglet « Historique »
    day/[date].tsx     Détail d'un jour passé
  components/          Éditeur du jour, étoiles, textes thémés
  db/entries.ts        Base SQLite (table `entries`, une ligne par jour)
  hooks/               Chargement + enregistrement auto, date du jour
  utils/dates.ts       Clés de date 'AAAA-MM-JJ' et formatage en français
```

## Commandes utiles

```bash
npx expo install <paquet>   # ajouter une dépendance compatible avec le SDK
npx tsc --noEmit            # vérifier les types
npx expo lint               # linter
```

> Les notes écrites dans Expo Go restent dans Expo Go : ce sont des données de test.
