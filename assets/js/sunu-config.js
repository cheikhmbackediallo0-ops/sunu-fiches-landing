// Réglages de SUÑU FICHES.
//
// Comptes avec confirmation par e-mail (Supabase) :
// 1. Créer un projet gratuit sur https://supabase.com
// 2. Project Settings → API : copier « Project URL » et la clé « anon public » ci-dessous.
// 3. Authentication → URL Configuration : mettre l'adresse du site dans « Site URL »
//    (ex. https://sunu-fiches.netlify.app) et ajouter https://…/index.html dans « Redirect URLs ».
// 4. Authentication → Providers → Email : laisser « Confirm email » activé.
//
// Tant que ces deux valeurs sont vides, les comptes sont enregistrés seulement sur
// l'appareil (sans e-mail de confirmation).
window.SUNU_CONFIG = {
  // Projet Supabase « sunu fiche ». La clé « anon » est publique par nature :
  // les règles de sécurité (RLS) de supabase/schema.sql protègent les données.
  supabaseUrl: 'https://rylntljmltxkxrnvdvtn.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5bG50bGptbHR4a3hybnZkdnRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzODcwNzksImV4cCI6MjEwODk2MzA3OX0.Xjol3UWrtNw3hJTTMbeLgmf4P9lM7zLDE20mUEC2Qzk',

  // Accès direct (phase de test) : « Se connecter » fait entrer sans compte ni mot de passe.
  // Mettre false pour obliger tout le monde à s'inscrire et à se connecter.
  accesDirect: true
};
