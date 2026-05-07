-- Collection cover image URL (existing projects)

alter table collections add column if not exists image_url text;
