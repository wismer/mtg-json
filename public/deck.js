$(document).ready(function(){
  var spellTypes = ["Creature", "Instant", "Enchantment", "Sorcery", "Land", "Tribal"]
  var cardColors = {White: "W", Black: "B", Red: "Red", Blue: "U", Green: "G"}
  var getSets = function(sets) {
    $.getJSON("http://mtgjson.com/json/SetList.json", function(data){
      sets(data);
    })
  }

  var cardStats = {
    bySpeed: function(cards, color) {
      // Collect all cards that are only the color provided
      var cards = _.filter(cards, function(card) {
        return (card.isMonoColor() && card.containsColor(color));
      })
      window.blackCards = cards
      data = {}
      // To determine the relative "speediness" of the spell,
      // weight the colorless cost as 1 unit, colored cost as 1.25
      _.each(spellTypes, function(type){
        if (!data.hasOwnProperty(type)) { data[type] = {} }
        for (i = 0; i < 12; i++) {
          if (!data[type].hasOwnProperty(i)) { data[type][i] = 0 }
          _.each(cards, function(card){
            if (card.get("cmc") == i && card.isOfType(type)) {
              data[type][i] += card.calculateCost(color);
            }
          })
        }
      })
      // some function that reduces the cards by type? Like show "speed" of spell types?
      return data;
    }
  }
  window.cardStats = cardStats
  var CardSet = Backbone.Model.extend({
    initialize: function (code) {
      code: code
    },

    costLayout: function() {
      var cards = this.get("cards")
      colors = _.map(colors, function(color){
        return _.filter(cards, function(card){
          return card.get("colors") == color;
        })
      })

      var cost = 0

      _.each(cards, function(card){
        if (card.has("cmc")) {
          if (cost <= card.get("cmc")) {
            cost = card.get("cmc")
          }
        }
      })
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

    randomizeBooster: function(n) {
      cards = this.get("cards")
      booster = this.get("booster")
      var deck = [];
      for (step = 0; step < n; step++) {
        set = _.map(booster, function(slot){
          while (typeof slot == "string") {
            i = Math.floor(Math.random() * (cards.length - 1));
            if (cards[i].hasFrequency(slot)) {
              return cards[i];
            }
          }
        })
        deck.push(set)
      }
      return _.flatten(deck);
    },

    cardsByColor: function(color) {
      return _.filter(this.get("cards"), function(card) { return card.containsColor(color) })
    },

    getDataSets: function() {

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
    },

    containsColor: function(color) {
      colors = this.get("colors")
      return _.some(colors, function(c){
        return c == color;
      });
    },

    isMonoColor: function() {
      if (this.has("colors")) {
        return this.get("colors").length == 1;
      } else {
        return false;
      }
    },

    isOfType: function(type) {
      return _.some(this.get("types"), function(cardType) { return cardType == type })
    },

    isLand: function() {
      return this.get("type") == "Land"
    },

    isArtifactCreature: function() {
      return this.get("types") == ["Artifact", "Creature"]
    },

    isSpell: function(spell) {
      return _.some(this.get("types"), function(type){
        return type == spell;
      })
    },

    calculateCost: function(color) {
      manaSymbols = this.get("manaCost").split(/[^\w]/)
      manaCost = 0
      _.each(manaSymbols, function(c){
        if (c != "" && c != "X") {
          c == cardColors[color] ? manaCost += 1.25 : manaCost += parseInt(c)
        }
      })

      return manaCost;
    }
  })

  // Browser Actions Take Place Here on Forward
  //


  getSets(function(sets){
    $("#expansion-list span:first").remove()

    _.each(sets, function(set){
      $("#expansion-list").append("<a href='#" + set.code +  "'><div set='" + set.code + "'>" + set.name + "</div></a>")
    })

    $("#expansion-list a div").on("click", function(){
      var cardSet = new CardSet({ code: $(this).attr("set") })
      selector = $(this)

      cardSet.requestCards(function(e){
        // selector.css("margin-left", "-400px").css("margin-right", "200px").css("height", "1300px")
      })

      // card.getDataSets()
      // create the graph categories
      // create the graphs upon highlighting
    })
  });
  // $("#expansion-list").on("click", function(e){
  //   console.log("WHASDASD")
  //   // console.log($(this).text())
  // })
})