-- BEN : les règles d'accès passent de « tout le monde » (public) à « utilisateurs connectés » (authenticated).
-- À lancer dans Supabase > SQL Editor, APRÈS le déploiement du correctif de l'API generer-rapport.

alter policy "Lecture libre" on public.clients       to authenticated;
alter policy "Lecture libre" on public.medias        to authenticated;
alter policy "Insert libre"  on public.medias        to authenticated;
alter policy "Lecture libre" on public.missions      to authenticated;
alter policy "Insert libre"  on public.missions      to authenticated;
alter policy "Lecture libre" on public.rapports      to authenticated;
alter policy "Insert libre"  on public.rapports      to authenticated;
alter policy "Update libre"  on public.rapports      to authenticated;
alter policy "Lecture libre" on public.user_profiles to authenticated;

-- Retour en arrière (si l'app ne fonctionne plus) : remplacer « to authenticated » par « to public » dans chaque ligne ci-dessus.
