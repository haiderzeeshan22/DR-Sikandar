-- Doctors and services published on the website.
insert into doctors (slug, name, role, image)
values
  ('dr-sikandar', 'Dr. Sikandar Abbas', 'Founder & Lead Dentist', '/images/doctors/sikandar.PNG'),
  ('dr-ali-mehdi', 'Dr. Ali Mehdi', 'Bs Dental', '/images/doctors/dr%20Mehdi.jpg'),
  ('dr-hadia-baqir', 'Dr. Hadia Baqir', 'Bs Dental', '/images/doctors/drhadia.jpg'),
  ('dr-najma', 'Dr. Najma', 'Bs Dental', '/images/doctors/Dr%20Najmaa.jpg')
on conflict (slug) do update
set name = excluded.name,
    role = excluded.role,
    image = excluded.image;

insert into services (slug, name, short_description)
values
  (
    'periodontics',
    'Periodontics',
    'Care for healthy gums and the supporting structures around your teeth.'
  ),
  (
    'pediatric-dentistry',
    'Pediatric Dentistry',
    'Gentle, age-appropriate dental care for children and growing smiles.'
  ),
  (
    'implant-dentistry',
    'Implant Dentistry',
    'Assessment and treatment planning for replacing missing teeth with dental implants.'
  ),
  (
    'endodontics',
    'Endodontics',
    'Treatment focused on the inner tissues of the tooth, including root canal care.'
  ),
  (
    'prosthodontics',
    'Prosthodontics',
    'Restorative solutions to replace or repair teeth and support everyday function.'
  ),
  (
    'conscious-sedation',
    'Conscious Sedation',
    'An option to help eligible patients feel more relaxed during dental treatment.'
  )
on conflict (slug) do update
set name = excluded.name,
    short_description = excluded.short_description;
