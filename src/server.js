const express = require('express');
const path = require('path');

const {
  cities,
  specialties,
  procedures,
  pricesByRegion,
  partners,
} = require('./data/data');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

app.use(express.static(path.join(__dirname, '..', 'public')));

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value);

const getProceduresBySpecialty = (specialtyId) =>
  procedures.filter((procedure) => procedure.specialtyId === Number(specialtyId));

const getPriceForCityAndProcedure = (cityId, procedureId) =>
  pricesByRegion.find(
    (price) => price.cityId === Number(cityId) && price.procedureId === Number(procedureId)
  );

const getPartnersForCityAndProcedure = (cityId, procedureId) =>
  partners.filter(
    (partner) =>
      partner.cityId === Number(cityId) && partner.procedureIds.includes(Number(procedureId))
  );

const getCityBySlug = (slug) => cities.find((city) => city.slug === slug);
const getSpecialtyBySlug = (slug) => specialties.find((specialty) => specialty.slug === slug);
const getProcedureBySlug = (slug) => procedures.find((procedure) => procedure.slug === slug);

app.get('/api/cidades', (req, res) => {
  res.json(cities);
});

app.get('/api/especialidades', (req, res) => {
  res.json(specialties);
});

app.get('/api/procedimentos', (req, res) => {
  const { especialidadeId } = req.query;

  if (!especialidadeId) {
    return res.status(400).json({ message: 'O parâmetro especialidadeId é obrigatório.' });
  }

  const list = getProceduresBySpecialty(especialidadeId);
  return res.json(list);
});

app.get('/api/cotacao', (req, res) => {
  const { cidadeId, procedimentoId } = req.query;

  if (!cidadeId || !procedimentoId) {
    return res
      .status(400)
      .json({ message: 'Os parâmetros cidadeId e procedimentoId são obrigatórios.' });
  }

  const price = getPriceForCityAndProcedure(cidadeId, procedimentoId);
  const partnersList = getPartnersForCityAndProcedure(cidadeId, procedimentoId);

  if (!price) {
    return res.status(404).json({ message: 'Não encontramos um preço para esta combinação.' });
  }

  const procedure = procedures.find((item) => item.id === Number(procedimentoId));
  const city = cities.find((item) => item.id === Number(cidadeId));

  return res.json({
    city,
    procedure,
    specialty: specialties.find((item) => item.id === procedure.specialtyId),
    price: {
      estimatedValue: price.estimatedValue,
      estimatedValueLabel: formatCurrency(price.estimatedValue),
      observations: price.observations,
    },
    partners: partnersList,
    primaryPartner: partnersList[0] || null,
  });
});

app.get('/', (req, res) => {
  res.render('index', {
    cities,
    specialties,
  });
});

app.get('/:citySlug/:specialtySlug/:procedureSlug', (req, res, next) => {
  const { citySlug, specialtySlug, procedureSlug } = req.params;

  const city = getCityBySlug(citySlug);
  const specialty = getSpecialtyBySlug(specialtySlug);
  const procedure = getProcedureBySlug(procedureSlug);

  if (!city || !specialty || !procedure) {
    return next();
  }

  if (procedure.specialtyId !== specialty.id) {
    return next();
  }

  const price = getPriceForCityAndProcedure(city.id, procedure.id);
  const partnerList = getPartnersForCityAndProcedure(city.id, procedure.id);
  const primaryPartner = partnerList[0] || null;

  if (!price) {
    return next();
  }

  res.render('result', {
    city,
    specialty,
    procedure,
    price: {
      ...price,
      estimatedValueLabel: formatCurrency(price.estimatedValue),
    },
    partners: partnerList,
    primaryPartner,
  });
});

app.use((req, res) => {
  res.status(404).render('404');
});

app.listen(PORT, () => {
  /* eslint-disable no-console */
  console.log(`Servidor em execução na porta ${PORT}`);
});

