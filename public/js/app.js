requirejs.config({
  baseUrl: "js/lib",
  paths: {
    app: "../app",
    jquery: "//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min",
    d3: "http://d3js.org/d3.v3.min",
    underscore: "../lib/underscore-min",
    backbone: "../lib/backbone-min"
  }
})

requirejs(['jquery', 'd3', 'underscore', 'backbone'], function($, d3, _, backbone){


  var spellTypes = ["Creature", "Instant", "Enchantment", "Sorcery", "Land", "Artifact", "Tribal"]
  var cardColors = {White: "W", Black: "B", Red: "R", Blue: "U", Green: "G", Artifact: null, Multi: null }
  var cardSymbols = { W: "White", B: "Black", R: "Red", U: "Blue", G: "Green" }

  var categories = function (category) {
    var obj = {}
    if (category === "types") {
      _.each(spellTypes, function(spell){ obj[spell] = {} })
    } else if (category === "colors") {
      _.each(_.keys(cardColors), function(color){ obj[color] = {} })
    } else {
      for (i = 0; i < 13; i++) { obj[i] = {} }
    }

    return obj;
  }

  var Card = Backbone.Model.extend({
    initialize: function(card) {
      card: card
    },

    categoryProperty: function(category) {
      var value = this.get(category)

      if (category === "types") {
        return value[0]
      } else if (category === "colors" && this.isArtifact()) {
        return "Artifact"
      } else if (category === "colors") {
        return value.length > 1 ? "Multi" : value[0]
      } else {
        return value
      }
    },

    hasFrequency: function(freq) {
      return this.get("rarity").toLowerCase() === freq;
    },

    isArtifact: function() {
      return this.has("cmc") && (!this.has("colors"))
    },

    hasCategory: function(category) {

    }

    // When sorting...
    // the object will look like this:
    // obj = {
    //   blue: {cid: [cards], cid1: [cards]}
    //   black: {cid: [cards], cid1: [cards]}
    //   etc...
    // }
  })


  var cmcSymbol = function(n) {
    return "<img src='http://mtgimage.com/symbol/mana/" + n + ".svg' height=50 width=50>"
  }

  var Profile = Backbone.Model.extend({
    initialize: function() {
      name: name
    },

    insertToDB: function(profile) {
      var model = this;
      if (!model.has("foreignKey")) {
        $.ajax({
          url: "/profile",
          type: "POST",
          data: {name: model.get("name")},
          success: function(data, xhr, error) {
            model.set("foreignKey", parseInt(data))
            profile(data);
          }
        })
      }
    }
  })

  var Draft = Backbone.Model.extend({
    initialize: function(draft) {
      cards: draft.cards
      type: draft.type
    },

    display: function(cat) {
      var cards = this.get("cards")
      var category = categories(cat)
      _.each(cards, function(subset){
        card = subset[0]
        property = card.categoryProperty(cat);
        if (property) { category[property][card.cid] = subset }
      })

      return category;
    },

    addCard: function(card) {
      cards.push(card)
    },

    removeCard: function(cid) {
      var card;
      i = _.indexOf(cards, cid)
      cards = _.filter(cards, function(c){ return c.cid !== cid })
      return cards
    }
  })

  var List = Backbone.Collection.extend({
    model: Card
  })

  var categorize = function(cards, category) {
    cards = _.map(cards, function(card){
      return card.category(category) // returns an obj
    })

    return cards
  }

  var getList = function (name, setList) {
    $.getJSON("http://mtgjson.com/json/" + name, function(data){
    }).done(function(data){
      setList(data);
    })
  }

  var loadList = function() {
    getList("SetList.json", function(list){
      $("#deckSelection option:selected").remove()
      _.each(list, function(set){
        $("#deckSelection").append("<option name='" + set["code"] + "'>" + set["name"] + "</option>")
      })
    })
  }

  var randomizeBooster = function(booster, n, list) {
    cards = []
    i = 0
    for (i = 0; i < n; i++) {
      random = _.map(booster, function(b){
        while (typeof b === "string") {
          card = list.sample()
          if (card.hasFrequency(b)) {
            return card;
          }
        }
      })

      cards.push(random)
    }


    cards = _.flatten(cards)
    return sortCards(cards);
  }

  var sortCards = function(cards) {
    var obj = {}

    _.each(cards, function(card){
      if (obj[card.cid]) {
        obj[card.cid].push(card)
      } else {
        obj[card.cid] = [card]
      }
    })

    return obj;
  }


  var setView = function(draft, filter) {
    window.draft = draft
    var section = draft.get("type")
    $("#" + section).empty()
    var values = draft.display(filter)
    _.each(_.keys(values), function(cat){
      if (!_.isEmpty(values[cat])) {
        $("#" + section).append("<h3>" + cat + "</h3>")
        _.each(values[cat], function(v,k){
          var len = "<span>" + v.length + "</span>x "
          var name = len + v[0].get("name")
          var multiverseid = v[0].get("multiverseid")
          $("#" + section).append("<li>" + "<a href='#' cid='" + k + "' card_id='" + multiverseid + "'>" + name + "</a></li>")
        })
      }
    })

    $("a").on("mouseenter", function(e){
      var tag = "<img src='http://mtgimage.com/multiverseid/" + $(this).attr("card_id") + ".jpg"
      tag += "' height='320' width='240'>"
      $("div.img").empty()
      $("div.img").append(tag)
    })
  }

  $("#profile button").on("click", function(e){
    profileName = $("#profile input").val()
    var profile = new Profile({name: profileName})
    loadList();


    profile.insertToDB(function(key){
      var cardSet;
      $("#deckSelection").on("change", function(e){
        e.preventDefault();
        set = $("#deckSelection option:selected").attr("name");

        var request = function() {
          return $.getJSON("http://mtgjson.com/json/" + set + ".json")
        }

        var list = new List();

        request().done(function(data){
          _.each(data.cards, function(card){
            card = new Card(card)
            list.add(card)
          })

          var filter = function() { return $("#types option:selected").val().toLowerCase() }

          var set = randomizeBooster(data.booster, 6, list)
          var sideboard = new Draft({cards: set, type: 'sideboard'})
          var player = new Draft({cards: [], type: 'player'})

          setView(sideboard, filter())

          $("#types").on("change", function(e){
            e.preventDefault();
            setView(sideboard, filter())
          })

          $("a").on("click", function(e){
            var klass = $(this).attr('class')
            var card;
            if (klass === 'sideboard') {
              card = sideboard.removeCard($(this).attr('cid'))
              player.addCard(card)
            } else if (klass === 'player') {
              card = player.removeCard($(this).attr('cid'))
              sideboard.addCard(card)
            }
          })
        })
      })
    })
  })
})

// obj = {
//   category: [
//     { cardID: [cards], cardID2: [cards] }
//   ]
// }
