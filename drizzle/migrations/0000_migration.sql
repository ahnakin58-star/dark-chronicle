CREATE TABLE public.adventures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  title text NOT NULL,
  hero_name text NOT NULL DEFAULT '',
  scenario jsonb NOT NULL,
  state jsonb NOT NULL,
  status text NOT NULL DEFAULT 'playing',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.adventures TO authenticated;
GRANT ALL ON public.adventures TO service_role;
ALTER TABLE public.adventures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own adventures select" ON public.adventures FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own adventures insert" ON public.adventures FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own adventures update" ON public.adventures FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own adventures delete" ON public.adventures FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX adventures_user_updated_idx ON public.adventures (user_id, updated_at DESC);
CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER adventures_touch BEFORE UPDATE ON public.adventures FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();