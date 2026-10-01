-- ==========================================
-- MCD PostgreSQL - PROJET ONYX (Version 2.0)
-- Description: Centralisation des Abonnements, Portefeuille Wave et Coffre-fort Chiffré.
-- ==========================================

-- Activation des extensions requises
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- Permet le chiffrement symétrique et asymétrique directement en SQL

-- 1. Table des Utilisateurs
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL, -- Identifiant principal (ex: numéro Wave)
    password_hash VARCHAR(255) NOT NULL,
    is_premium BOOLEAN DEFAULT FALSE NOT NULL,
    trust_score INT DEFAULT 100 NOT NULL CHECK (trust_score >= 0 AND trust_score <= 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Index pour accélérer la recherche par téléphone
CREATE INDEX idx_users_phone ON users(phone);

-- 2. Table des Portefeuilles (Liaison One-to-One avec User)
CREATE TABLE wallets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    balance DECIMAL(15, 2) DEFAULT 0.00 NOT NULL CHECK (balance >= 0.00), -- Solde disponible en FCFA
    budget_limit DECIMAL(15, 2) DEFAULT 25000.00 NOT NULL CHECK (budget_limit >= 0.00), -- Curseur budgétaire
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. Table de l'Historique des Transactions du Portefeuille
CREATE TABLE wallet_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    amount DECIMAL(15, 2) NOT NULL, -- Montant de la transaction (positif pour recharge, négatif pour débit)
    fee DECIMAL(15, 2) DEFAULT 0.00 NOT NULL, -- Frais Wave (1% pour Gratuit, 0% pour Premium)
    type VARCHAR(50) NOT NULL CHECK (type IN ('recharge', 'payment', 'refund', 'fee')),
    status VARCHAR(50) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
    reference_id VARCHAR(100) UNIQUE, -- Référence de transaction Wave
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Index pour accélérer la récupération de l'historique d'un portefeuille
CREATE INDEX idx_transactions_wallet ON wallet_transactions(wallet_id);
CREATE INDEX idx_transactions_reference ON wallet_transactions(reference_id);

-- 4. Table des Abonnements Actifs (Subs)
CREATE TABLE subs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- Ex: 'Netflix', 'Spotify', 'Canal+'
    price DECIMAL(15, 2) NOT NULL CHECK (price >= 0.00),
    currency VARCHAR(10) DEFAULT 'FCFA' NOT NULL,
    next_billing_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    mode_vacances BOOLEAN DEFAULT FALSE NOT NULL,
    smart_swapping BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_subs_user ON subs(user_id);

-- 5. Table de la Bourse d'Échange de Profils (Exchanges)
CREATE TABLE exchanges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    offering_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    offered_sub_id UUID NOT NULL REFERENCES subs(id) ON DELETE CASCADE,
    wanted_sub_name VARCHAR(100) NOT NULL, -- Ex: 'Spotify'
    status VARCHAR(50) DEFAULT 'available' NOT NULL CHECK (status IN ('available', 'completed', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_exchanges_status ON exchanges(status);

-- 6. Table du Coffre-fort Chiffré (AES-256)
-- Les identifiants peuvent être chiffrés côté applicatif (NestJS) ou côté base de données (pgcrypto).
-- Les colonnes stockent le contenu sous forme de chaînes chiffrées + vecteur d'initialisation (IV)
CREATE TABLE coffre_fort (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sub_id UUID REFERENCES subs(id) ON DELETE SET NULL, -- Optionnel si lié à un abonnement spécifique
    service_name VARCHAR(100) NOT NULL, -- Nom du service (ex: 'Netflix')
    encrypted_username TEXT NOT NULL, -- Identifiant chiffré en AES-256
    encrypted_password TEXT NOT NULL, -- Mot de passe chiffré en AES-256
    iv VARCHAR(64) NOT NULL, -- Vecteur d'initialisation pour décoder l'AES applicatif
    tag VARCHAR(64), -- Tag d'authentification requis pour le chiffrement AES-256-GCM
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_coffre_fort_user ON coffre_fort(user_id);

-- ==========================================================
-- EXEMPLE DE CHIFFREMENT/DÉCHIFFREMENT EN DB (PGCRYPTO)
-- ==========================================================
-- Si chiffrement au niveau base de données avec clé secrète partagée :
--
-- Insertion chiffrée avec clé 'ma_cle_secrete_globale' :
-- INSERT INTO coffre_fort(user_id, service_name, encrypted_username, encrypted_password, iv)
-- VALUES (
--     'uuid-user', 
--     'Netflix', 
--     pgp_sym_encrypt('user@email.com', 'ma_cle_secrete_globale'), 
--     pgp_sym_encrypt('password123', 'ma_cle_secrete_globale'),
--     'db_internal'
-- );
--
-- Sélection déchiffrée :
-- SELECT service_name, 
--        pgp_sym_decrypt(encrypted_username::bytea, 'ma_cle_secrete_globale') AS username,
--        pgp_sym_decrypt(encrypted_password::bytea, 'ma_cle_secrete_globale') AS password
-- FROM coffre_fort;
-- ==========================================================
