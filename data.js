$(document).ready(function() {
var countryTo = {}
var countryFrom = {}

$.get('https://restcountries.eu/rest/v1/all', function(countryList) {
  countryList.forEach(function(item, index) {
    $('select').append('<option value='+item.alpha2Code+'>'+ item.name + '</option>')
  })
  $('#travelFrom option[value="US"]').insertBefore('#travelFrom option[value="AF"]');

})
//Button clicked - values extracted (2 letter country codes)
$('button').click(function(event) {
  event.preventDefault()
  specific = $('select.to option:selected').val()
  specific2 = $('select.from option:selected').val()
// Empty elements once new click happens
  $('.comparison').empty()
  $('.exchange').empty()
  $('.general').empty()
  $('.pictures').empty()
  $('.safety').empty()
// Getting values for calling different API's //
$.when( $.ajax( 'https://restcountries.eu/rest/v1/alpha?codes='+specific+';'+specific2+'' ),
        $.ajax('https://knoema.com/api/1.0/meta/dataset/ICPR2011/dimension/region' ) ).done(function(data, region) {
// Get the country a2 code and currency //

  countryTo.A2 = data[0][0].alpha2Code;
  countryTo.currency = data[0][0].currencies[0];
  countryTo.country = data[0][0].name
  countryFrom.A2 = data[0][1].alpha2Code;
  countryFrom.currency = data[0][1].currencies[0];

// Get the 7-digit code based on specific countries picked //
   region[0].items.forEach(function(item, index) {
    if (item.fields.regionid === specific) {
      countryTo.id = item.key;
    }
    if (item.fields.regionid === specific2) {
      countryFrom.id = item.key;
    }
  })

// CURRENCY CALCULATOR - With if statements to prevent undefined -----
  $.get('https://api.fixer.io/latest?base='+countryFrom.currency+'&symbols='+countryTo.currency+'').done(function(currency) {

    if (countryFrom.currency === countryTo.currency) {
      $('.exchange').append('<div><img class="big-icon" src=images/exchange.svg></div>')
      $('.exchange').append('<div class="rate"></div>')
      $('.rate').append('<h3>Both countries have the same currency! No need to exchange!!!</h3>')
    } else if (currency.rates[countryTo.currency] === undefined){
      $('.exchange').append('<div><img class="big-icon" src=images/exchange.svg></div>')
      $('.exchange').append('<div class="rate"></div>')
      $('.rate').append('<h3>Sorry, no information on that exchange rate you can find the exchange rate <a href="http://www.xe.com/currencyconverter/">HERE</a></h3>')
    } else {
      $('.exchange').append('<div><img class="big-icon" src=images/exchange.svg></div>')
      $('.exchange').append('<div class="rate"></div>')
      $('.rate').append('<h3>1 '+countryFrom.currency+' will get you ' +currency.rates[countryTo.currency]+' '+countryTo.currency+'<h3>')
    }
  }).fail(function(error) {
    $('.exchange').append('<div><img class="big-icon" src=images/exchange.svg></div>')
    $('.exchange').append('<div class="rate"></div>')
    $('.rate').append('<h3>Relax, you did not brake the converter... We just do not have this data currently. You can go <a href="http://www.xe.com/currencyconverter/">HERE</a></h3> ')
})
// FINANCIAL Purchasing power parity stats -- will display as $100 is worth x amount??
  $.get('https://knoema.com/api/1.0/data/ICPR2011?Time=2011-2011&region='
  +countryFrom.id+','+countryTo.id+'&measures-components=1000270,1000260,1000360&economic-aggregates=1000190&Frequencies=A', function(financial) {
      var PPP = financial.data //Purchasing Power Parity //
      var alcohol = Math.round(100 / (1 - ((PPP[0].Value - PPP[3].Value) / PPP[0].Value)))
      var food =    Math.round(100 / (1 - ((PPP[1].Value - PPP[4].Value) / PPP[1].Value)));
      var hotels =  Math.round(100 / (1 - ((PPP[2].Value - PPP[5].Value) / PPP[2].Value)));

      if (PPP.length < 6) {
        $('.comparison').append('<div class="money"></div>')
        $('.money').append('<h3> Exchange rates are cool but based on some crazy data collecting and intense algorithms we can tell you how much 100'+countryFrom.currency+' will be worth in '+countryTo.country+'</h3>')
        $('.money').append('<p>Or not.... received insufficient data from WORLD BANK to make this happen!!!</p>')
      } else {
        $('.comparison').append('<div class="money"></div>')
        $('.comparison').append('<div class="alcohol"></div>')
        $('.comparison').append('<div class="food"></div>')
        $('.comparison').append('<div class="hotels"></div>')
        $('.money').append('<h3> Exchange rates are cool but based on some crazy data collecting and intense algorithms we can tell you how much 100'+countryFrom.currency+' will be worth in '+countryTo.country+'</h3>')
        $('.alcohol').append('<h2>100 '+countryFrom.currency+'</h2>')
        $('.alcohol').append('<img class="icon" src="images/drink.svg" alt="capital">')
        $('.alcohol').append('<h2>' +alcohol+ '</h2>')
        $('.food').append('<h2>100 '+countryFrom.currency+'</h2>')
        $('.food').append('<img class="icon" src="images/food.svg" alt="capital">')
        $('.food').append('<h2>' +food+ '</h2>')
        $('.hotels').append('<h2>100 '+countryFrom.currency+'</h2>')
        $('.hotels').append('<img class="icon" src="images/hotel.svg" alt="capital">')
        $('.hotels').append('<h2>' +hotels+ '</h2>')
      }
  })

//GENERAL country information - country name - official name - capital - subregion
  $.get('https://restcountries.eu/rest/v1/alpha/'+countryTo.A2, function(general) {

    var lastElement = general.altSpellings.length - 1;
    console.log(general)
    // $('.general').append('<img src="images/flag.svg" width="+40px+" height="40px+" alt="flag">')
    $('.general').append('<div class="gMain"></div>')
    $('.gMain').append('<img class="icon" src="images/flag.svg" alt="flag">')
    $('.gMain').append('<h1>'+general.name+'</h1>')
    $('.general').append('<div class="gOfficial"></div>')
    $('.gOfficial').append('<h2>'+general.altSpellings[lastElement]+'</h2>')
    $('.general').append('<div class="gExtra"></div>')
    $('.gExtra').append('<div><img class="icon" src="images/star.svg" alt="star"><h2>'+general.capital+'</h2></div>')
    $('.gExtra').append('<div><img class="icon" src="images/continent.svg" alt="continent"><h2>'+general.subregion+'</h2></div>')
    $('.gExtra').append('<div><img class="icon" src="images/piggy.svg" alt="currency"><h2>'+general.currencies[0]+'</h2></div>')
    })


// SAFETY INFORMATION - checking general travel advisory and regional advisory (Canadian Source)
var tuGroup = {
"url": "https://api.tugroup.com/v1/travelsafe/countries/"+countryTo.A2,
"method": "GET",
"headers": {
  "x-auth-api-key": "um59hvs6gx8z674reuqmtzna",
  }
}
$.ajax(tuGroup).done(function (safety) {
  var regional = safety.advisories.regionalAdvisories;
console.log(safety.advisoryState)
  $('.safety').append('<div><img class="big-icon" src="images/safety.svg"></div>')
  $('.safety').append('<div class="sAdvisory"></div>')
  $('.sAdvisory').append('<h3> Safety Advisory</h3>')
  $('.sAdvisory').append('<p>'+safety.advisories.description+'</p>')
// Depending on warning level makes background red or green.
  if (safety.advisoryState > 0) {
    $('.safety').css('background-color', '#D46A6A')
  } else if (safety.advisoryState === 0) {
    $('.safety').css('background-color', '#5B9632')
  }
  regional.forEach(function(item, index){
    $('.sAdvisory').append('<h4>' +item.category+ '</h4>')
    $('.sAdvisory').append('<p>' +item.description+ '</p>')
    })
  })

  //PICTURES SECTION - FlickrAPI - Requesting pictures based on keyword relevancy
$.get('https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=6046bd3b0b0209c90dcfb95e499d4248&text='+countryTo.country+'%2C+architecture%2C+landscape&sort=relevance&accuracy=3&format=json&nojsoncallback=1', function(result){
  var pics = result.photos.photo;

  $('.pictures').append('<div><img class="big-icon" src="images/camera.svg" alt="camera">')
  $('.pictures').append('<div class=pics></div>')
  $('.pics').append('<img src=https://farm'+pics[0].farm+'.staticflickr.com/'+pics[0].server+'/'+pics[0].id+'_'+pics[0].secret+'.jpg</img>')
  $('.pics').append('<img src=https://farm'+pics[1].farm+'.staticflickr.com/'+pics[1].server+'/'+pics[1].id+'_'+pics[1].secret+'.jpg</img>')
  $('.pics').append('<img src=https://farm'+pics[2].farm+'.staticflickr.com/'+pics[2].server+'/'+pics[2].id+'_'+pics[2].secret+'.jpg</img>')
})

})
})
})

//
// Key:
// 6046bd3b0b0209c90dcfb95e499d4248
//
// Secret:
// a5e4d776823b2fe3
