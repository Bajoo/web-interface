

export default {

    _lang: 'Français', // special lang name


    // view_models/passphrase_input.js
    'The user refused to enter the passphrase': "L'utilisateur a refusé d'entrer sa phrase de passe",

    // view_helpers/relative_date.js
    'just now': "à l'instant",
    '{0} second(s) ago': ['il y a {0} seconde(s)', 'il y a une seconde', 'il y a {0} secondes'],
    '{0} minute(s) ago': ['il y a {0} minute(s)', 'il y a une minute', 'il y a {0} minutes'],
    '{0} hour(s) ago': ['il y a {0} heures', 'il y a une heure', 'il y a {0} heures'],
    '{0} day(s) ago': ['il y a {0} jours', 'il y a un jour', 'il y a {0} jours'],

    // pages/activation.js
    'This account is not activated': "Ce compte n'est pas activé",
    'For continuing,  your must activate your account.': 'Pour continuer, vous devez activer votre compte.',
    "You should receive in the next minutes, a confirmation email with an activation link.": "Vous allez recevoir dans les prochaines minutes un email de confirmation contenant le lien d'activation.",
    "You must follow that link to continue.": 'Vous devez ouvrir ce lien pour continuer.',
    'Return to the login page': 'retourner sur la page de connexion',
    "I've activated my account": "J'ai activé mon compte",
    'Send again the activation email': "Renvoyer le mail d'activation",

    // pages/details_storage.js
    'Details of {0}': 'Détails de {0}',
    'Share details': 'Détails du partage',
    'This share is encrypted' : 'Ce partage est chiffré',
    'This share is not encrypted': "Ce partage n'est pas chiffré.",
    'Update storage data failed: {0}': 'La mise à jour du partage a échoué: {0}',
    'The share has been updated.': 'Le partage a été mis à jour.',

    // pages/gen_key.js
    'Creation of your encryption key': 'Création de votre clé de chiffrement',
    "Before starting, we must create your encryption key. In order to do that, you need to define a passphrase.": 'Avant de commencer, nous devons créer votre clé de chiffrement. Pour cela, vous devez choisir une phrase secrète.',
    "Your passphrase is known only by yourself. It's used to encrypt your data.": 'Votre phrase secrète est connue seulement de vous. Elle sert à chiffer vos données.',
    "It should contains at least 8 characters.": 'Ell doit comporter au moins 8 caractères.',
    "You can use a real phrase to memorize it more easily (ex: MyBajooAccount).": 'Vous pouvez utiliser une phrase réelle pour la mémoriser plus facilement (ex: "Mon compte Bajoo").',
    "I don't want to use a passphrase": "Je ne veux pas utiliser de phrase secrète",
    'Generate the key': 'Générer la clé',
    'The passphrase must have at least 8 characters': 'La phrase secrète doit comporter au moins 8 caractères',
    "The passphrase and its confirmation doesn't match": 'La phrase secrète et sa confirmation ne correspondent pas',
    'Key generation failed: {0}': 'La génération de clé a échoué: {0}',

    // pages/index.js
    'Create a new share': 'Créer un nouveau partage',
    'encrypted': 'chiffré',
    'not encrypted': 'non chiffré',
    'Unable to fetch the list of share: {0}': 'Impossible de récupérer la liste des partages: {0}',
    'Welcome {0}!': 'Bienvenue {0}!',
    'My shares': 'Mes partages',

    // pages/login.js
    'Connection': 'Connexion',
    'Stay connected': 'Rester connecté',
    'Create a new account': 'Créer un nouveau compte',
    'Forgotten password ?': 'Mot de passe oublié ?',
    'Invalid username and/or password': 'login et/ou mot de passe invalide.',

    // pages/new_storage.js
    'Encrypt this share ?': 'Chiffrer ce partage ?',

    // pages/new_storage.js, pages/details_storage.js
    'Eg: \"Pictures Holidays 2017\"': 'Ex: Photo vacances 2017',
    'Description': 'Description',
    'Member list': 'Liste des membres',
    'Delete this share': 'Supprimer ce partage',
    'Are you sure you want to delete this share ?': 'Êtes-vous sûr de vouloir supprimer ce partage ?',
    'The share deletion has failed: {0}': 'La suppression du partage a échoué: {0}',
    'Leave this share': 'Quitter ce partage',
    'Are you sure you want to leave this share ?': 'Êtes-vous sûr de vouloir quitter ce partage ?',
    'Leaving this share has failed: {0}': 'Quitter ce partage a échoué: {0}',

    // pages/register.js
    'Account creation': 'Création de compte',
    'Password': 'Mot de passe',
    'Password confirmation': 'Confirmation de mot de passe',
    'Language': 'Language',
    "I've already an account": "J'ai déjà un compte",
    'The password must have at least 8 characters': 'Le mot de passe doit comporter au moins 8 caractères.',
    "The password and its confirmation doesn't match": 'Le mot de passe et sa confirmation ne correspondent pas',

    // models/download.js
    'Download of "{0}"': 'Téléchargement de "{0}"',

    // models/storage_member_task.js
    'Update permissions and members of "{0}"': 'Mise à jour des membres et permissions de "{0}"',

    // models/task_errors.js

    'Operation canceled': 'Opération annulé',
    'The passphrase request was rejected': 'La demande de passphrase a été refusée',
    'File not found (404)': 'Fichier introuvable (404)',
    "User \"{0}\" doesn't exist or has no PGP key": "L'utilisateur \"{0}\" n'existe pas ou n'a pas de clé PGP",
    'Update of "{0}" permissions for storage "{1}" failed': 'La mise à jour des permissions de "{0}" pour le partage "{1}" a échoué',
    'The deletion of the file "{0}" has failed': 'La suppression du fichier {0} a échoué',
    'Listing the files of folder "{0}" has failed': 'Lister les fichiers du dossier "{0}" a échoué',

    // models/task_manager.js
    'Some of your operations (upload or download) are not done yet.\nLeaving this page will interrupt them. Are you sure to leave ?': 'Certaines opérations (téléchargement ou upload) sont toujours en cours.\nQuitter va les interrompre. Êtes-vous sûr de quitter la page ?',

    // models/upload.js
    'Upload of "{0}"': 'Upload de "{0}"',

    // components/disconnect_button.js
    'Log out': 'Déconnexion',

    // components/file_list.js
    'Fetching file list failed: {0}': 'La récupération de la liste des fichiers a échouée: {0}',
    'Size': 'Taille',
    'Last modification': 'Dernière modification',
    'This folder is empty': 'Ce dossier est vide',

    // components/layout.js
    'Connection ...': 'Connexion ...',

    // components/passphrase_input_modal.js
    'Your passphrase is required': 'Votre phrase secrète est requise.',
    'Please, enter your passphrase to encrypt or decrypt your files.': 'Veuillez entrer votre phrase secrète pour chiffrer/déchiffrer vos fichiers.',
    'Passphrase': 'phrase secrète',
    'Cancel': 'Annuler',
    'Apply': 'Appliquer',

    // components/side_menu.js
    'All shares': 'Tous les partages',
    'Loading error': 'Erreur de chargement',

    // components/storage_member_list.js
    'Permission level': 'Niveau de permission',
    'Read': 'Lecture',
    'Write': 'Écriture',
    'Admin': 'Admin',
    'Note: it must always remains at least one admin member.': 'Note: il doit toujours rester au moins un membre administrateur.',

    // components/task_list_modal.js
    'Fetch user key ...': 'Récupération de la clé utilisateur ...',
    'Wait for passphrase ...': 'En attente de la phrase secrète ...',
    'Listing directory ...': 'Lecture du dossier ...',
    'Execution of sub-tasks ...': 'Exécution des sous-tâches ...',
    'Read file content ...': 'Lecture du fichier ...',
    'Encrypt file ...': 'Chiffrement du fichier ...',
    'Decrypt file ...': 'Déchiffrement du fichier ...',
    'Fetch storage key ...': 'Récupération de la clé du partage',
    'Download file from server ...': 'Téléchargement du fichier à partir du serveur ...',
    'Upload file to server...': 'Upload du fichier ...',
    'Ongoing ...': 'En cours ...',
    'Finalize file ...': 'Préparation du fichier ...',
    'Done!': 'Fait !',
    'Task list': 'Liste des tâches',
    'There is no task': "Il n'y a aucune tâche",
    'Cancelled!': 'Annulé!',
    'Error: {0}': 'Erreur: {0}',
    '{0} errors:': '{0} erreurs:',


    // components/task_manager_status.js
    '{0} task(s) done' : ['{0} tâche(s) terminée(s)', '{0} tâche terminée', '{0} tâches terminées'],
    'Task(s): {0} / {1}': ['Tâche(s): {0} / {1}', 'Tâche: {0} / {1}', 'Tâches: {0} / {1}'],

    // tasks/grouped_tasks.js
    'Group of ${0} tasks': 'Groupe de {0} tâches',

    // pages/register.js, components/storage_member_list.js
    'Email': 'Email',

    // pages/activation.js, pages/login.js
    'Unknown error': 'Erreur inconnue',

    // pages/storage.js, pages/details_storage.js
    "You don't have the permission to see this share.": "Vous n'avez pas les permissions pour accèder à ce partage.",
    'This share does not exist.': "Ce partage n'existe pas",

    // pages/index.js, pages/new_storage.js
    'New share': 'Nouveau partage',

    // pages/login.hjs, pages/new_storage.js, pages/register.js, pages/details_storage.js
    'Submit': 'Envoyer',

    // pages/index.js, pages/storage.js, components/file_list.js, pages/details_storage.js
    'Loading ...': 'Chargement ...',

    // pages/new_storage.js components/file_list.js, pages/details_storage.js
    'Name': 'Nom',

    // pages/gen_key.js, components/passphrase_input_modal.js
    "We're unable to decrypt the key. Bad passphrase ?": 'Impossible de déchiffrer la clé. Phrase secrète invalide ?',
};
