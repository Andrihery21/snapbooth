/*
  # Correction de la sécurité des événements et du stockage

  1. Modifications
    - Modification du champ created_by dans events pour utiliser l'ID utilisateur
    - Ajout de politiques RLS pour les événements
    - Mise à jour des politiques de stockage pour limiter l'accès aux photos

  2. Sécurité
    - Les utilisateurs ne peuvent voir que leurs propres événements
    - Les photos sont accessibles uniquement aux créateurs des événements
*/

-- Modification de la table events
ALTER TABLE events 
  ALTER COLUMN created_by TYPE uuid USING created_by::uuid,
  ALTER COLUMN created_by SET DEFAULT auth.uid(),
  ADD CONSTRAINT events_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);

-- Activation de RLS sur events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Politiques pour les événements
CREATE POLICY "Users can view own events"
  ON events FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Users can create own events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own events"
  ON events FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

-- Mise à jour des politiques de stockage
DROP POLICY IF EXISTS "Authenticated users can view photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update photos" ON storage.objects;

-- Nouvelles politiques de stockage basées sur l'appartenance des événements
CREATE POLICY "Users can view photos of their events"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = (storage.foldername(name))[1]::uuid
      AND events.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can upload photos to their events"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = (storage.foldername(name))[1]::uuid
      AND events.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete photos from their events"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = (storage.foldername(name))[1]::uuid
      AND events.created_by = auth.uid()
    )
  );