-- create tables and set primary keys of the tables
CREATE TABLE IF NOT EXISTS public.probe_readings_batch (id bigserial NOT NULL, probe float8 not NULL, batch_id bigserial, created_at timestamp DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (id));
CREATE TABLE IF NOT EXISTS public.probe_readings_daily (id bigserial NOT NULL, probe float8 not NULL, created_at timestamp DEFAULT CURRENT_TIMESTAMP, expire_at timestamp DEFAULT (now() + interval '48 hours'), PRIMARY KEY (id));
CREATE TABLE IF NOT EXISTS public.batch (id bigserial NOT NULL, name character varying, probe float8 not NULL, origin character varying, PRIMARY KEY (id));
-- create relationship FK contraints and use Match Simple to allow nulls
ALTER TABLE public.probe_readings_batch ADD CONSTRAINT fk_batch FOREIGN KEY (batch_id) REFERENCES public.batch (id) MATCH SIMPLE;
-- create index to improve the performance of SELECT statements and to enforce uniqueness
CREATE INDEX IF NOT EXISTS fki_fk_batch ON public.probe_readings_batch(batch_id);
-- crerat time to live function and trigger
CREATE FUNCTION delete_expired_daily_probe_rows() 
RETURNS TRIGGER 
LANGUAGE PLPGSQL
AS $$
BEGIN
DELETE FROM public.probe_readings_daily WHERE expire_at <= now(); -- deletes all rows where the expire_at column is less than or equal to the current date and time.
RETURN NULL;
END;
$$;
CREATE TRIGGER delete_expired_daily_probe_rows_trigger
AFTER INSERT OR UPDATE ON public.probe_readings_daily
EXECUTE FUNCTION delete_expired_daily_probe_rows();