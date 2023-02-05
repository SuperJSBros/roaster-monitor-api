-- create tables and set primary keys of the tables
CREATE TABLE IF NOT EXISTS public.probe_readings_batch (id bigserial NOT NULL, probe float8 not NULL, batch_id bigserial, created_at timestamp, PRIMARY KEY (id));
CREATE TABLE IF NOT EXISTS public.probe_readings_daily (id bigserial NOT NULL, probe float8 not NULL, created_at timestamp, PRIMARY KEY (id));
CREATE TABLE IF NOT EXISTS public.batch (id bigserial NOT NULL, name character varying, probe float8 not NULL, origin character varying, PRIMARY KEY (id));
-- create relationship FK contraints and use Match Simple to allow nulls
ALTER TABLE public.probe_readings_batch ADD CONSTRAINT fk_batch FOREIGN KEY (batch_id) REFERENCES public.batch (id) MATCH SIMPLE;
-- create index to improve the performance of SELECT statements and to enforce uniqueness
CREATE INDEX IF NOT EXISTS fki_fk_batch ON public.probe_readings_batch(batch_id);