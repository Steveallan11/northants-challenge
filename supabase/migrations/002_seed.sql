insert into public.admins (id, email, role)
values ('4da06ef3-3d49-4ae2-9be7-eb3bbf331111', 'steveallan2018@gmail.com', 'admin')
on conflict (email) do nothing;

insert into public.quizzes (id, slug, title, description, is_published, is_active, starts_at, ends_at, time_limit_seconds)
values (
  'b16b9fc0-9e12-46ea-a1a4-9c4c1f7ab101',
  'northants-challenge-week-1',
  'How Well Do You Know Northamptonshire?',
  'A fast, local knowledge quiz to see how well you really know Northamptonshire.',
  true,
  true,
  '2026-04-14T00:00:00+00:00',
  null,
  15
)
on conflict (id) do update
set
  slug = excluded.slug,
  title = excluded.title,
  description = excluded.description,
  is_published = excluded.is_published,
  is_active = excluded.is_active,
  time_limit_seconds = excluded.time_limit_seconds;

delete from public.questions where quiz_id = 'b16b9fc0-9e12-46ea-a1a4-9c4c1f7ab101';

insert into public.questions (id, quiz_id, sort_order, type, prompt, extra_text, image_url, options, correct_index, explanation, category, difficulty)
values
('c2c2eabf-9f59-4d33-91a1-f93d3ec30101','b16b9fc0-9e12-46ea-a1a4-9c4c1f7ab101',1,'emoji_clue','Guess the Northamptonshire place from the emojis:','🏁 🏎️ 🇬🇧',null,'["Silverstone","Rushden Lakes","Stanwick Lakes","Althorp"]',0,'Silverstone is associated with British motor racing.','landmarks','easy'),
('c2c2eabf-9f59-4d33-91a1-f93d3ec30102','b16b9fc0-9e12-46ea-a1a4-9c4c1f7ab101',2,'local_knowledge','Stanwick Lakes is best described as:',null,null,'["A 750-acre nature reserve and countryside attraction","A shopping centre","A castle and gardens","A motorsport venue"]',0,'Stanwick Lakes is a 750-acre nature reserve and countryside attraction.','nature','easy'),
('c2c2eabf-9f59-4d33-91a1-f93d3ec30103','b16b9fc0-9e12-46ea-a1a4-9c4c1f7ab101',3,'days_out_round','Wicksteed Park is in which Northamptonshire town?',null,null,'["Kettering","Towcester","Rushden","Daventry"]',0,'Wicksteed Park is in Kettering.','family_days_out','easy'),
('c2c2eabf-9f59-4d33-91a1-f93d3ec30104','b16b9fc0-9e12-46ea-a1a4-9c4c1f7ab101',4,'true_statement','Which statement is true?',null,null,'["Northampton Museum and Art Gallery is famous for one of the largest shoe collections in the world","Rushden Lakes is a Norman castle","Silverstone is a wetland reserve","Althorp is a shopping centre"]',0,'Northampton Museum and Art Gallery is famous for its shoe collection.','culture','medium'),
('c2c2eabf-9f59-4d33-91a1-f93d3ec30105','b16b9fc0-9e12-46ea-a1a4-9c4c1f7ab101',5,'clue_round','Which place fits these clues?','Built after 1066 • linked to William the Conqueror • historic castle',null,'["Rockingham Castle","Rushden Lakes","Stanwick Lakes","Northampton Museum"]',0,'Rockingham Castle dates back to the Norman period and is linked to William the Conqueror.','heritage','medium'),
('c2c2eabf-9f59-4d33-91a1-f93d3ec30106','b16b9fc0-9e12-46ea-a1a4-9c4c1f7ab101',6,'local_knowledge','West Northamptonshire Council serves which areas?',null,null,'["Daventry, Northampton and South Northamptonshire","Corby, Rushden and Oundle","Kettering, Wellingborough and Rushden Lakes","Silverstone, Towcester and Rockingham Castle"]',0,'West Northamptonshire Council serves Daventry, Northampton and South Northamptonshire.','local_government','medium'),
('c2c2eabf-9f59-4d33-91a1-f93d3ec30107','b16b9fc0-9e12-46ea-a1a4-9c4c1f7ab101',7,'heritage_round','Which Northamptonshire town is described as the oldest town in the county?',null,null,'["Towcester","Rushden","Corby","Brackley"]',0,'Towcester is described as the oldest town in Northamptonshire.','towns','medium'),
('c2c2eabf-9f59-4d33-91a1-f93d3ec30108','b16b9fc0-9e12-46ea-a1a4-9c4c1f7ab101',8,'days_out_round','Which place is known for shopping, dining and leisure, and as a gateway to the Nene Wetlands?',null,null,'["Rushden Lakes","Silverstone","Northampton Museum","Rockingham Castle"]',0,'Rushden Lakes combines shopping, dining and leisure with access to the Nene Wetlands.','days_out','easy');
