-- Tiendas de demostración (sin dueño: asignalas a un usuario desde store_members).

insert into stores (id, name, slug, status, primary_color, hero_eyebrow, hero_title, hero_subtitle,
                    shipping_note, tagline, whatsapp, email, address, city)
values
  ('00000000-0000-0000-0000-0000000000a1', 'Tienda Demo Hogar', 'demo-hogar', 'verified', '#1f2937',
   'Nueva colección', 'Todo para tu hogar', 'Productos seleccionados con atención personalizada.',
   'Envíos a todo el país', 'Todo para tu hogar, en un solo lugar.',
   '595981000001', 'hola@demo-hogar.example', 'Av. Principal 123', 'Asunción'),
  ('00000000-0000-0000-0000-0000000000a2', 'Tienda Demo Moda', 'demo-moda', 'active_unverified', '#be185d',
   'Temporada', 'Ropa que te define', 'Prendas para cada ocasión.',
   'Envíos disponibles', 'Moda para todos los días.',
   '595981000002', 'hola@demo-moda.example', 'Calle Sur 45', 'Luque');

insert into categories (id, store_id, name, slug, sort_order) values
  ('00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000000a1', 'Living', 'living', 1),
  ('00000000-0000-0000-0000-0000000000b2', '00000000-0000-0000-0000-0000000000a2', 'Remeras', 'remeras', 1);

insert into products (store_id, category_id, name, slug, short_description, description, price, featured) values
  ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000b1',
   'Sillón de ejemplo', 'sillon-ejemplo', 'Sillón de tres cuerpos.', 'Producto de demostración.', 1500000, true),
  ('00000000-0000-0000-0000-0000000000a2', '00000000-0000-0000-0000-0000000000b2',
   'Remera de ejemplo', 'remera-ejemplo', 'Remera de algodón.', 'Producto de demostración.', 85000, true);
