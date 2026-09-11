# Compte Russie — démo séparée

Version neutre.

- `/` : espace public uniquement
- `/admin/` : espace administrateur séparé
- API + SQLite dans `server.js`

Installation locale :
1. Installer Node.js LTS
2. `npm install`
3. définir `ADMIN_KEY` comme variable d'environnement
4. `npm start`
5. ouvrir `http://localhost:3000/`

Pour l'administration : `http://localhost:3000/admin/`

Hébergement Node.js :
- Build Command : `npm install`
- Start Command : `npm start`
- Environment Variable : `ADMIN_KEY` = clé secrète

Ne jamais publier la clé administrateur dans GitHub.
