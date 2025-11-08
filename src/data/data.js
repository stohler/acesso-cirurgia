const cities = [
  { id: 1, name: 'São Paulo', state: 'SP', slug: 'sao-paulo' },
  { id: 2, name: 'Rio de Janeiro', state: 'RJ', slug: 'rio-de-janeiro' },
  { id: 3, name: 'Belo Horizonte', state: 'MG', slug: 'belo-horizonte' },
];

const specialties = [
  { id: 1, name: 'Oftalmologia', slug: 'oftalmologia' },
  { id: 2, name: 'Cirurgia Geral', slug: 'cirurgia-geral' },
  { id: 3, name: 'Ortopedia', slug: 'ortopedia' },
  { id: 4, name: 'Ginecologia', slug: 'ginecologia' },
];

const procedures = [
  { id: 101, name: 'Catarata (Facoemulsificação)', specialtyId: 1, slug: 'catarata-facoemulsificacao' },
  { id: 201, name: 'Hérnia Inguinal (Hernioplastia)', specialtyId: 2, slug: 'hernia-inguinal-hernioplastia' },
  { id: 202, name: 'Colecistectomia (Vesícula)', specialtyId: 2, slug: 'colecistectomia-vesicula' },
  { id: 301, name: 'Joelho - Meniscectomia', specialtyId: 3, slug: 'joelho-meniscectomia' },
  { id: 401, name: 'Histerectomia (Útero)', specialtyId: 4, slug: 'histerectomia-utero' },
];

const pricesByRegion = [
  {
    procedureId: 101,
    cityId: 1,
    estimatedValue: 3500,
    observations: 'Preço por olho. Inclui lente básica.',
  },
  {
    procedureId: 201,
    cityId: 1,
    estimatedValue: 4800,
    observations: 'Cirurgia com anestesia local/sedação.',
  },
  {
    procedureId: 202,
    cityId: 1,
    estimatedValue: 8500,
    observations: 'Via laparoscópica.',
  },
  {
    procedureId: 301,
    cityId: 1,
    estimatedValue: 9200,
    observations: 'Artroscopia. Sem material de implante.',
  },
  {
    procedureId: 401,
    cityId: 1,
    estimatedValue: 10500,
    observations: 'Abdominal ou vaginal (a confirmar).',
  },
];

const partners = [
  {
    id: 1,
    name: 'Clínica Visão Clara',
    whatsapp: '11999991234',
    cityId: 1,
    procedureIds: [101],
  },
  {
    id: 2,
    name: 'Dr. Cirurgia Rápida',
    whatsapp: '11988884321',
    cityId: 1,
    procedureIds: [201, 202],
  },
  {
    id: 3,
    name: 'Orto Solução',
    whatsapp: '11977775678',
    cityId: 1,
    procedureIds: [301],
  },
];

module.exports = {
  cities,
  specialties,
  procedures,
  pricesByRegion,
  partners,
};

