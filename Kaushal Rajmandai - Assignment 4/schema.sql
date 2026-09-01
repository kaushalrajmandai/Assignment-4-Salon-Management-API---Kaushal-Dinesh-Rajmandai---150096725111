create extension if not exists "uuid-ossp";

create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  username varchar(50) not null unique,
  email varchar(255) not null unique,
  password text not null,
  created_at timestamptz not null default now()
);

create table if not exists salons (
  id uuid primary key default uuid_generate_v4(),
  name varchar(100) not null,
  city varchar(100) not null,
  address varchar(255) not null,
  rating numeric(2,1) check (rating >= 0 and rating <= 5),
  created_at timestamptz not null default now()
);

create table if not exists services (
  id uuid primary key default uuid_generate_v4(),
  salon_id uuid not null references salons(id) on delete cascade,
  service_name varchar(100) not null,
  price numeric(10,2) not null check (price >= 0),
  duration varchar(50) not null,
  is_available boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_salons_rating on salons(rating);
create index if not exists idx_salons_city on salons(city);
create index if not exists idx_services_salon_id on services(salon_id);
create index if not exists idx_services_is_available on services(is_available);