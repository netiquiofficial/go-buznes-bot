const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs'); 
// 📦 Importation de la documentation depuis le fichier externe
const { DOCUMENTATION_BOT } = require('./documentation');

const FICHIER_SUIVI = './suivi_clients.json';
const NUMERO_SUPPORT = "243998159146";

// =========================================================================
// 🧠 STOCKAGE INTELLIGENT ET MÉMOIRE LOCALE
// =========================================================================
function chargerSuivi() {
    if (!fs.existsSync(FICHIER_SUIVI)) {
        fs.writeFileSync(FICHIER_SUIVI, JSON.stringify({}));
    }
    return JSON.parse(fs.readFileSync(FICHIER_SUIVI, 'utf-8'));
}

function sauvegarderSuivi(donnees) {
    fs.writeFileSync(FICHIER_SUIVI, JSON.stringify(donnees, null, 2));
}

let memoireClients = chargerSuivi();

// 🔎 FONCTION DE LECTURE DU HTML (TEXTE UNIQUEMENT)
async function extraireMetaDonnees(url) {
    try {
        const reponse = await fetch(url);
        if (!reponse.ok) return null;
        const html = await reponse.text();
        const extractionTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i) || html.match(/<title>([^<]*)<\/title>/i);
        const extractionDesc = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i) || html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
        return {
            titre: extractionTitle ? extractionTitle[1] : "Page Officielle",
            description: extractionDesc ? extractionDesc[1] : "Contenu de la page."
        };
    } catch (e) { return null; }
}

console.log("⚡ Démarrage de Christian CM (Version Production GitHub)...");

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox', 
            '--disable-dev-shm-usage', 
            '--disable-gpu'
        ],
        // 🚀 Chemin absolu exact affiché par tes logs de build Render
        executablePath: '/opt/render/.cache/puppeteer/chrome/linux-146.0.7680.31/chrome-linux64/chrome'
    }
});

client.on('qr', async (qr) => {
    try {
        // Option alternative : Génère aussi le QR Code dans les logs du serveur au cas où le code de couplage échoue
        qrcode.generate(qr, { small: true });
        
        const code = await client.requestPairingCode(NUMERO_SUPPORT);
        console.log(`\n👉 CODE DE CONNEXION WHATSAPP BUSINESS : ${code.toUpperCase()}\n`);
    } catch (err) { console.error(err); }
});

client.on('ready', () => {
    console.log('\n🛡️ CHRISTIAN CM EN LIGNE : CONCENTRÉ UNIQUEMENT SUR LES MESSAGES TEXTES !\n');
});

client.on('message', async msg => {
    const chat = await msg.getChat();
    if (chat.isGroup) return;

    // 🛑 1. REJET AUTOMATIQUE DES MÉDIAS (Le bot ignore sans répondre)
    if (msg.hasMedia) {
        console.log(`🚫 Média reçu de ${chat.name || msg.from} -> Ignoré.`);
        return; 
    }

    const idClient = msg.from;
    const texte = msg.body.toLowerCase().trim();

    // 📥 Initialisation ou chargement du profil dans le stockage intelligent
    if (!memoireClients[idClient]) {
        memoireClients[idClient] = {
            nom: chat.name || "Client Goma",
            statut: "Nouveau",
            derniereInteraction: new Date().toISOString()
        };
    }
    
    let profil = memoireClients[idClient];
    profil.derniereInteraction = new Date().toISOString();
    
    console.log(`💬 [Mémoire: ${profil.statut}] ${profil.nom} : "${msg.body}"`);

    try {
        let reponseText = "";

        // 🎯 2. FILTRAGE STRICT DES LIENS (AUTORISÉS UNIQUEMENT)
        const regexUrl = /https?:\/\/[^\s]+/i;
        const urlTrouvee = msg.body.match(regexUrl);

        if (urlTrouvee) {
            const urlString = urlTrouvee[0];
            
            const estLienGoBuznes = urlString.includes("gogamenetiqui.github.io/Go-Buznes/");
            const estLienBlog = urlString.includes("netiqui.blogspot.com");

            if (estLienGoBuznes || estLienBlog) {
                await msg.reply("🔄 *Christian CM :* _Analyse de votre lien officiel en cours..._");
                const infosPage = await extraireMetaDonnees(urlString);
                
                if (infosPage) {
                    const contexteLien = DOCUMENTATION_BOT + `\n\n[INFO LIEN RECONNU] :\nTitre : ${infosPage.titre}\nDescription : ${infosPage.description}\nProfil Client actuel : ${profil.statut}`;
                    
                    const res = await fetch("https://text.pollinations.ai/", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ 
                            messages: [
                                { role: "system", content: contexteLien },
                                { role: "user", content: msg.body }
                            ],
                            model: "openai"
                        })
                    });
                    reponseText = await res.text();
                    await msg.reply(reponseText.trim());
                    return;
                }
            } else {
                reponseText = `👋 *Christian CM :* _Je ne traite pas les liens externes non partenaires à Netiqui._\n\nConcentrons-nous sur vos activités à Goma ! Comment puis-je vous aider aujourd'hui ?\n\n🏪 *Créer votre boutique gratuite* (écrivez "vendre")\n🥇 *Badge de priorité OR* (5$/mois - Écrivez "premium")\n🥈 *Badge de priorité BLEU* (2$/mois - Écrivez "premium")`;
                await msg.reply(reponseText.trim());
                return;
            }
        }

        // Réponses immédiates par mots-clés
        if (texte.includes("bonjour") || texte.includes("salut") || texte.includes("jambo") || texte.includes("mambo")) {
            reponseText = `👋 *Jambo ! Je suis Christian CM, l'assistant commercial de la maison Netiqui.*\n\nCréé par notre DG *Christian CHIRUZA M.* pour faire exploser votre chiffre d'affaires à Goma !\n\nQue voulez-vous faire aujourd'hui ?\n🏪 *Créer une boutique gratuite* (écrivez "vendre")\n📈 *Découvrir nos badges de visibilité Premium* (écrivez "premium")\n🚀 *Découvrir nos autres services technologiques* (écrivez "services")`;
        } else if (texte.includes("vendre") || texte.includes("boutique") || texte.includes("créer")) {
            profil.statut = "Prospect_Vendeur";
            reponseText = `🏪 *Lancez votre Boutique — Christian CM*\n\nExposez vos articles gratuitement dès aujourd'hui sur Go Buznes sans aucune commission sur vos ventes :\n🔗 https://gogamenetiqui.github.io/Go-Buznes/home.html\n\n💡 Passez ensuite au *Badge Or* ou *Bleu* pour dominer vos concurrents !`;
        } else if (texte.includes("abonnement") || texte.includes("premium") || texte.includes("badge") || texte.includes("or") || texte.includes("bleu")) {
            profil.statut = "Attente_Paiement";
            reponseText = `📈 *Visibilité Premium — Christian CM*\n\nVoici comment dominer le marché sur Go Buznes à Goma :\n\n🥇 *Le Badge OR (Priorité Ultime) — 5 USD / mois :* Vous passez tout en haut, devant tout le monde. Flux maximum de clients garanti.\n🥈 *Le Badge BLEU (Deuxième Priorité) — 2 USD / mois :* Vous passez juste après les membres Or.\n\n📌 *Paiement unique :* Envoyez vos frais par Mobile Money au numéro du support : *+243998159146*.\n👉 Écrivez-moi dès que c'est fait. Notre DG *Christian CHIRUZA M.* activera votre badge de priorité après vérification.`;
        } else if (texte.includes("services") || texte.includes("logo") || texte.includes("application")) {
            profil.statut = "Interet_Services_Netiqui";
            reponseText = `🚀 *Services Technologiques Netiqui — Christian CM*\n\nL'équipe du DG Christian Chiruza M. conçoit vos projets numériques sur-mesure :\n\n📱 *Création d'applications Web & Mobiles*\n🎨 *Conception de logos professionnels*\n🎬 *Création de contenu multimédia*\n\nExpliquez-moi votre projet textuellement et je transmettrai le dossier à l'équipe !`;
        } else {
            const contexteDynamique = DOCUMENTATION_BOT + `\n\n[INFO MÉMOIRE] : Tu parles avec "${profil.nom}". Statut de la discussion : "${profil.statut}". Garde tes objectifs commerciaux au centre de tout. Si l'utilisateur parle de dons, financement ou de fonds, redirige-le UNIQUEMENT vers le numéro de support +243998159146.`;
            
            const res = await fetch("https://text.pollinations.ai/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    messages: [
                        { role: "system", content: contexteDynamique },
                        { role: "user", content: msg.body }
                    ],
                    model: "openai"
                })
            });
            reponseText = await res.text();
        }

        sauvegarderSuivi(memoireClients);
        await msg.reply(reponseText.trim());

    } catch (error) {
        console.error("Erreur :", error.message);
    }
});

client.initialize();
