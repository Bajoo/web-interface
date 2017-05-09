

export default {

    _lang: 'Français', // special lang name


    // view_models/passphrase_input.js
    'The user refused to enter the passphrase': "L'utilisateur a refusé d'entrer sa phrase de passe",

    // view_helpers/relative_date.js
    '{0} second ago': 'il y a {0} secondes',
    'a minute ago': 'il y a une minute',
    '{0} minutes ago': 'il y a {0} minutes',
    'a hour ago': 'il y a une heure',
    '{0} hours ago': 'il y a {0} heures',
    'a day ago': 'il y a un jour',
    '{0} days ago': 'il y a {0} jours',

    // pages/activation.js
    'This account is not activated': "Ce compte n'est pas activé",
    'For continuing,  your must activate your account.': 'Pour continuer, vous devez activer votre compte.',
    "You should receive in the next minutes, a confirmation email with an activation link.": "Vous allez recevoir dans les prochaines minutes un email de confirmation contenant le lien d'activation.",
    "You must follow that link to continue.": 'Vous devez ouvrir ce lien pour continuer.',
    'Return to the login page': 'retourner sur la page de connexion',
    "I've activated my account": "J'ai activé mon compte",
    'Send again the activation email': "Renvoyer le mail d'activation",

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
    'New Share': 'Nouveau partage',
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
    'Eg: \"Pictures Holidays 2017\"': 'Ex: Photo vacances 2017',
    'Description': 'Description',
    'Encrypt this share ?': 'Chiffrer ce partage ?',

    // pages/register.js
    'Account creation': 'Création de compte',
    'Email': 'Email',
    'Password': 'Mot de passe',
    'Password confirmation': 'Confirmation de mot de passe',
    'Language': 'Language',
    "I've already an account": "J'ai déjà un compte",
    'The password must have at least 8 characters': 'Le mot de passe doit comporter au moins 8 caractères.',
    "The password and its confirmation doesn't match": 'Le mot de passe et sa confirmation ne correspondent pas',

    // models/download.js
    'Download': 'Téléchargement',

    // models/task_manager.js
    'Fetch user key ...': 'Récupération de la clé utilisateur ...',
    'Wait for passphrase ...': 'En attente de la phrase secrète ...',
    'Read file content ...': 'Lecture du fichier ...',
    'Encrypt file ...': 'Chiffrement du fichier ...',

    'Decrypt file ...': 'Déchiffrement du fichier ...',
    'Fetch storage key ...': 'Récupération de la clé du partage',
    'Download file from server ...': 'Téléchargement du fichier à partir du serveur ...',
    'Upload file to server...': 'Upload du fichier ...',
    'Finalize file ...': 'Préparation du fichier ...',
    'Done!': 'Fait !',
    'Some of your operations (upload or download) are not done yet.\nLeaving this page will interrupt them. Are you sure to leave ?': 'Certaines opérations (téléchargement ou upload) sont toujours en cours.\nQuitter va les interrompre. Êtes-vous sûr de quitter la page ?',
    'Download: file not found': 'Téléchargement: fichier non trouvé',
    '{0} failed: {1}': '{0} échoué: {1}',

    // models/upload
    'Upload': 'Upload',

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
    'All shares': 'Tout les partages',
    'Loading error': 'Erreur de chargement',

    // components/tasks_view.js
    'Ongoing Tasks: {0}': 'Tâches en cours: {0}',

    // pages/activation.js, pages/login.js
    'Unknown error': 'Erreur inconnue',

    // pages/storage.js
    "You don't have the permission to see this share.": "Vous n'avez pas les permissions pour accèder à ce partage.",
    'This share does not exist.': "Ce partage n'existe pas",


    // pages/login.hjs, pages/new_storage.js, pages/register.js
    'Submit': 'Envoyer',

    // pages/index.js, pages/storage.js, components/file_list.js
    'Loading ...': 'Chargement ...',

    // pages/new_storage.js components/file_list.js
    'Name': 'Nom',

    // pages/gen_key.js, components/passphrase_input_modal.js
    "We're unable to decrypt the key. Bad passphrase ?": 'Impossible de déchiffrer la clé. Phrase secrète invalide ?',
};
