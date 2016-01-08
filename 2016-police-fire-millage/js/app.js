(function() {
var lifespan                     = 12,
    homestead_discount           = 75000,
    proposed_police_millage      = 5.0,
    proposed_fire_millage        = 2.5,
    current_police_millage       = 5.26,
    current_fire_millage         = 5.21,
    current_overall_millage_east = 151.78,
    current_overall_millage_west = 152.06;

// current_overall_millage_west = 145.71;
// current_overall_millage_west = 152.06;

var formatPennies = d3.format(",.2f");  // Commas with two decimal points.
var formatDollars = d3.format(",.0f");  // Commas, rounded to nearest integer.

function assessedValue(full_value) {
  return full_value * 0.1;  // 10 percent
}
function millage(mills) {
  return mills / 1000; // "One-tenth of one percent"
}

// Current numbers
function calculateCurrentPoliceFireTax(vars) {
  return assessedValue(vars.full_amount) * millage(current_police_millage + current_fire_millage);
}
function calculateCurrentPoliceTax(vars) {
  return assessedValue(vars.full_amount) * millage(current_police_millage);
}
function calculateCurrentFireTax(vars) {
  return assessedValue(vars.full_amount) * millage(current_fire_millage);
}
function calculateCurrentTotalTax(vars) {
  var overall_millage,
      bank = vars.bank,
      full_amount = vars.full_amount,
      homestead_amount = vars.homestead_amount;

  if (bank === 'east') {
    overall_millage = current_overall_millage_east;
  } else {
    overall_millage = current_overall_millage_west;
  }

  var assessment_tax = assessedValue(full_amount - homestead_amount) * millage(overall_millage);
  if (assessment_tax < 0) { assessment_tax = 0; }

  var homestead_millage = current_police_millage + current_fire_millage;
  var homestead_tax = assessedValue(homestead_amount) * millage(homestead_millage);

  var total_tax = assessment_tax + homestead_tax;
  return total_tax;
}

// Proposed numbers
function calculateProposedPoliceFireTax(vars) {
  return assessedValue(vars.full_amount) * millage(proposed_police_millage + proposed_fire_millage);
}
function calculateProposedPoliceTax(vars) {
  return assessedValue(vars.full_amount) * millage(proposed_police_millage);
}
function calculateProposedFireTax(vars) {
  return assessedValue(vars.full_amount) * millage(proposed_fire_millage);
}
function calculateProposedTotalTax(vars) {
  var current_overall_millage,
      bank = vars.bank,
      full_amount = vars.full_amount,
      homestead_amount = vars.homestead_amount;

  if (bank === 'east') {
    current_overall_millage = current_overall_millage_east;
  } else {
    current_overall_millage = current_overall_millage_west;
  }
  var overall_millage = current_overall_millage + proposed_police_millage + proposed_fire_millage;

  var assessment_tax = assessedValue(full_amount - homestead_amount) * millage(overall_millage);
  if (assessment_tax < 0) { assessment_tax = 0; }

  var homestead_millage = current_police_millage + current_fire_millage +
    proposed_police_millage + proposed_fire_millage;
  var homestead_tax = assessedValue(homestead_amount) * millage(homestead_millage);

  var total_tax = assessment_tax + homestead_tax;
  return total_tax;
}

function getVariables() {
  var bank,
      full_amount,
      homestead_amount;

  // Amount
  full_amount = document.getElementById('property_value').value.replace(/[,$]/g, '');
  if (full_amount === '') { full_amount = 0.0; }
  full_amount = parseFloat(full_amount);

  // Geographic location
  if (document.getElementById('east_bank_radio').checked) {
    bank = document.getElementById('east_bank_radio').value;
  } else if (document.getElementById('west_bank_radio').checked) {
    bank = document.getElementById('west_bank_radio').value;
  }

  // Homestead
  if (document.getElementById('yes_radio').checked) {
    homestead_amount = homestead_discount;
    if (full_amount < homestead_discount) {homestead_amount = full_amount; }
  } else if (document.getElementById('no_radio').checked) {
    homestead_amount = 0;
  }

  return {"bank": bank,
          "full_amount": full_amount,
          "homestead_amount": homestead_amount};
}

function update() {
  vars = getVariables();

  var current_police = calculateCurrentPoliceTax(vars);
  var current_fire = calculateCurrentFireTax(vars);
  var current_total = calculateCurrentTotalTax(vars);

  var proposed_police = calculateProposedPoliceTax(vars);
  var proposed_fire = calculateProposedFireTax(vars);
  var proposed_total = calculateProposedTotalTax(vars);

  var total_diff = proposed_total - current_total;

  var lifespan_total = total_diff * lifespan;

  // First paragraph
  document.getElementById('total_diff').innerHTML = "$" + formatPennies(total_diff);
  document.getElementById('police_diff').innerHTML = "$" + formatPennies(proposed_police);
  document.getElementById('fire_diff').innerHTML = "$" + formatPennies(proposed_fire);
  document.getElementById('twelve-year-total').innerHTML = "$" + formatPennies(lifespan_total);

  // Second paragraph
  document.getElementById('current_total').innerHTML = "$" + formatDollars(current_total);
  document.getElementById('proposed_total').innerHTML = "$" + formatDollars(proposed_total);
}

function formatCurrency(number) {
  var n = number.split('').reverse().join("");
  var n2 = n.replace(/\d\d\d(?!$)/g, "$&,");
  var return_val = '$' + n2.split('').reverse().join('');
  return return_val;
}

function eventListeners() {
  listenValueInput();
  listenRadioChange();
}

function listenValueInput() {
  $('#property_value').on('input', function () {
    update();

    $(this).val(formatCurrency(this.value.replace(/[,$]/g, '')));
  }).on('keypress', function (e) {
    if (!$.isNumeric(String.fromCharCode(e.which)) && (e.which !== 8)) {
      e.preventDefault();
    }
  });
}

function listenRadioChange() {
  // Homestead
  $('#yes_radio').on('click', function() {
    update();
  });
  $('#no_radio').on('click', function() {
    update();
  });

  // Geographic location
  $('#east_bank_radio').on('click', function() {
    update();
  });
  $('#west_bank_radio').on('click', function() {
    update();
  });
}

eventListeners();
update();
})()