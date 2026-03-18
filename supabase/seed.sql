-- ============================================================
-- Social Parents - Seed Data (Mock data from page.tsx)
-- ============================================================

-- ========================
-- CATEGORIES
-- ========================
INSERT INTO categories (id, label, color_class) VALUES
  ('11111111-0000-0000-0000-000000000001', 'Médico',       'bg-cat-medical/20 text-[#2B774E]'),
  ('11111111-0000-0000-0000-000000000002', 'Psicológico',  'bg-cat-psycho/20 text-[#6B3482]'),
  ('11111111-0000-0000-0000-000000000003', 'Direitos',     'bg-cat-rights/30 text-[#A67D3A]'),
  ('11111111-0000-0000-0000-000000000004', 'Desabafo',     'bg-cat-vent/30 text-[#2B6082]')
ON CONFLICT (label) DO NOTHING;

-- ========================
-- SUBCATEGORIES (Médico)
-- ========================
INSERT INTO subcategories (category_id, label) VALUES
  ('11111111-0000-0000-0000-000000000001', 'Medicamentos'),
  ('11111111-0000-0000-0000-000000000001', 'Indicações profissionais'),
  ('11111111-0000-0000-0000-000000000001', 'Terapias alternativas')
ON CONFLICT DO NOTHING;

-- ========================
-- POSTS (Mock data from page.tsx)
-- ========================
INSERT INTO posts (
  id,
  author_id,
  author_name,
  author_role,
  category_id,
  category_name,
  color_class,
  content,
  tags,
  is_sensitive,
  comment_count,
  save_count,
  support_count,
  created_at
) VALUES
  (
    'aaaaaaaa-0000-0000-0000-000000000001',
    NULL,
    'Mariana Silva',
    'Mãe do Léo',
    '11111111-0000-0000-0000-000000000001',
    'Médico',
    'bg-cat-medical/20 text-[#2B774E]',
    'Alguém em SP conhece um neuropediatra que aceite o convênio X? Estamos precisando de uma segunda opinião urgente.',
    ARRAY['Autismo', 'Saúde', 'Indicação'],
    false,
    12,
    8,
    34,
    NOW() - INTERVAL '1 hour'
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000002',
    NULL,
    'Carlos Souza',
    'Pai da Sofia',
    '11111111-0000-0000-0000-000000000003',
    'Direitos',
    'bg-cat-rights/30 text-[#A67D3A]',
    'Pessoal, a liminar contra o convênio para garantir a terapia ABA finalmente saiu. Quem precisar do modelo da petição, me avise no particular.',
    ARRAY['Jurídico', 'Vitória'],
    false,
    45,
    22,
    89,
    NOW() - INTERVAL '2 hours'
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000003',
    NULL,
    'Anônimo (Mãe Exausta)',
    'Mãe Típica',
    '11111111-0000-0000-0000-000000000004',
    'Desabafo',
    'bg-cat-vent/30 text-[#2B6082]',
    'Estou há 3 noites sem dormir lidando com crises severas. Apenas precisava escrever isso em algum lugar onde não serei julgada por estar no meu limite.',
    ARRAY['Exaustão', 'Solidão'],
    true,
    28,
    15,
    112,
    NOW() - INTERVAL '30 minutes'
  )
ON CONFLICT DO NOTHING;
