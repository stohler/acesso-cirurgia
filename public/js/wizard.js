(function () {
  const form = document.getElementById('wizard-form');
  if (!form) return;

  const citySelect = document.getElementById('cidade');
  const specialtySelect = document.getElementById('especialidade');
  const procedureSelect = document.getElementById('procedimento');
  const submitButton = form.querySelector('button[type="submit"]');
  const steps = Array.from(document.querySelectorAll('.wizard-step'));
  const procedureFeedback = document.getElementById('procedures-feedback');

  const changeStepState = (stepNumber, state) => {
    const step = steps.find((item) => item.dataset.step === String(stepNumber));
    if (!step) return;

    step.classList.remove('is-active', 'is-complete', 'is-disabled');
    switch (state) {
      case 'active':
        step.classList.add('is-active');
        break;
      case 'complete':
        step.classList.add('is-complete');
        break;
      default:
        step.classList.add('is-disabled');
    }
  };

  const resetSpecialty = () => {
    specialtySelect.value = '';
    specialtySelect.setAttribute('disabled', 'disabled');
    changeStepState(2, 'disabled');
    resetProcedure();
  };

  const resetProcedure = () => {
    procedureSelect.innerHTML = '<option value="">Selecione</option>';
    procedureSelect.setAttribute('disabled', 'disabled');
    changeStepState(3, 'disabled');
    submitButton.setAttribute('disabled', 'disabled');
    if (procedureFeedback) {
      procedureFeedback.textContent = '';
    }
  };

  const enableSpecialty = () => {
    specialtySelect.removeAttribute('disabled');
    changeStepState(2, 'active');
  };

  const enableProcedure = () => {
    procedureSelect.removeAttribute('disabled');
    changeStepState(3, 'active');
  };

  const populateProcedures = (items) => {
    procedureSelect.innerHTML = '<option value="">Selecione</option>';
    items.forEach((procedure) => {
      const option = document.createElement('option');
      option.value = procedure.id;
      option.dataset.slug = procedure.slug;
      option.textContent = procedure.name;
      procedureSelect.appendChild(option);
    });

    if (items.length === 0) {
      procedureSelect.setAttribute('disabled', 'disabled');
      changeStepState(3, 'disabled');
      if (procedureFeedback) {
        procedureFeedback.textContent =
          'No momento não há cirurgias cadastradas para esta especialidade.';
      }
      return;
    }

    if (procedureFeedback) {
      procedureFeedback.textContent = '';
    }

    enableProcedure();
  };

  const fetchProcedures = async (specialtyId) => {
    try {
      procedureSelect.innerHTML = '<option value="">Carregando...</option>';
      procedureSelect.setAttribute('disabled', 'disabled');
      if (procedureFeedback) {
        procedureFeedback.textContent = '';
      }
      const response = await fetch(`/api/procedimentos?especialidadeId=${specialtyId}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar procedimentos');
      }
      const data = await response.json();
      populateProcedures(data);
    } catch (error) {
      console.error(error);
      procedureSelect.innerHTML = '<option value="">Selecione</option>';
      if (procedureFeedback) {
        procedureFeedback.textContent =
          'Não foi possível carregar os procedimentos. Tente novamente em instantes.';
      }
    }
  };

  const restoreInitialState = () => {
    changeStepState(1, 'active');
    changeStepState(2, 'disabled');
    changeStepState(3, 'disabled');
    submitButton.setAttribute('disabled', 'disabled');
  };

  const getSelectedSlug = (select) => {
    const option = select.options[select.selectedIndex];
    return option ? option.dataset.slug : '';
  };

  restoreInitialState();

  citySelect.addEventListener('change', () => {
    if (!citySelect.value) {
      resetSpecialty();
      restoreInitialState();
      return;
    }

    changeStepState(1, 'complete');
    enableSpecialty();
  });

  specialtySelect.addEventListener('change', () => {
    resetProcedure();
    if (!specialtySelect.value) {
      changeStepState(2, 'active');
      return;
    }
    changeStepState(2, 'complete');
    fetchProcedures(specialtySelect.value);
  });

  procedureSelect.addEventListener('change', () => {
    if (!procedureSelect.value) {
      submitButton.setAttribute('disabled', 'disabled');
      changeStepState(3, 'active');
      return;
    }
    changeStepState(3, 'complete');
    submitButton.removeAttribute('disabled');
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!citySelect.value || !specialtySelect.value || !procedureSelect.value) {
      return;
    }

    const citySlug = getSelectedSlug(citySelect);
    const specialtySlug = getSelectedSlug(specialtySelect);
    const procedureSlug = getSelectedSlug(procedureSelect);

    if (!citySlug || !specialtySlug || !procedureSlug) {
      if (procedureFeedback) {
        procedureFeedback.textContent = 'Não foi possível gerar o resultado. Tente novamente.';
      }
      return;
    }

    window.location.href = `/${citySlug}/${specialtySlug}/${procedureSlug}`;
  });
})();
