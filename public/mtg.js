$(document).ready(function(){
  var selectedSet;

  var loadList = function(list) {
    var cardData;
    $.getJSON("http://mtgjson.com/json/" + list + ".json", function(data){
      if (list == "SetList") {
        _.each(data, function(set){
          $("select").append("<option value='" + set.code + "'>" + set.name + "</option>")
        })

        $("option:first").remove()
        $("select").prepend("<option selected>Pick a Set</option")
      } else {
        
      }
    })
  }

  var createCardSet = function(data) {
    selectedSet = new CardSet(data)
  }

  loadList("SetList");

  var CardSet = Backbone.Model.extend({
    initialize: function (code) {
      code: code
    },

    requestCards: function(data) {
      var cardSet = this
      $.getJSON("http://mtgjson.com/json/" + cardSet.get("code") + ".json", function(d){
        cards = _.map(d.cards, function(card){ return new Card(card); })
        cardSet.set({cards: cards, booster: d.booster})
        data(cardSet)
      })
    },

    showDraft: function() {
      console.log(this.get("booster"))
    },

    randomizeBooster: function() {

      // return this.get("cards")[0].hasFrequency("rare")
      cards = this.get("cards")
      booster = this.get("booster")

      return _.map(booster, function(slot){
        while (typeof slot == "string") {
          i = Math.floor(Math.random() * (cards.length - 1));
          if (cards[i].hasFrequency(slot)) {
            return cards[i];
          }
        }
      })
    }
  })

  var Card = Backbone.Model.extend({
    initialize: function(card) {
      card: card
    },

    hasFrequency: function(freq) {
      return (this.get("rarity").toLowerCase()) == freq;
    },

    imgTag: function() {
      site = "'http://mtgimage.com/multiverseid/" + this.get("multiverseid") + ".jpg'"
      size = " width='180' height='240'"
      return "<img src=" + site + size + ">"
    }
  })

  $("form").on("submit", function(e){
    e.preventDefault();
    code = $("option:selected").val();
    var collection = new CardSet({code: code})
    collection.requestCards(function(data){
      $("div.card-portal").append("<button class='draft'>Draft Me!</button>")
      $("button.draft").on("click", function(){
        if (collection.has("booster")) {
          cards = [];

          for (i = 5; i < 6; i++) {
            booster = collection.randomizeBooster();
            cards.concat(booster)
          }

          _.each(cards, function(card){
            $("div.card-placeholder").append(card.imgTag())
          })
        }
      })
    })
    // if (collection.has("cards")) {
    //   $("div.card-portal").append("<button>Draft Me!</button>")
    //     .on("click", function(){
    //       collection.showDraft();
    //     })
    // }
  })
})