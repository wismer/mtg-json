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

  var categories = {
    spells: function(obj) {
      _.each(spellTypes, function(spell){ obj[spell] = {} })
      return obj;
    },

    colors: function(obj) {
      _.each(_.keys(cardColors), function(color){ obj[color] = {} })
      return obj;
    },

    cmc: function(obj) {
      for (i = 0; i < 13; i++) { obj[i] = {} }
      return obj
    }
  }

  var Card = Backbone.Model.extend({
    initialize: function(card) {
      card: card
    },

    category: function(category) {
      value = this.get(category)

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
    }
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
    },

    display: function(category) {
      cards = this.get("cards")
      if (category === "cmc") {
        cards = _.filter(cards, function(card){ return card.has("cmc") })
        result = categories.cmc({})
      } else if (category === "types") {
        result = categories.spells({})
      } else {
        cards = _.filter(cards, function(card){ return card.has("colors") || card.isArtifact()})
        result = categories.colors({})
      }

      _.each(cards, function(card){
        key = card.category(category)
        if (key) {
          if (result[key][card.cid]) {
            result[key][card.cid].push(card)
          } else {
            result[key][card.cid] = [card]
          }
        }
      })

      return result;
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

    return _.flatten(cards);
  }

  var setView = function(draft, filter, section) {
    $("#" + section).empty()
    values = draft.display(filter)
    window.values = values
    _.each(_.keys(values), function(cat){
      if (!_.isEmpty(values[cat])) {
        $("#" + section).append("<h3>" + cat + "</h3>")
        _.each(values[cat], function(v,k){
          len = "<span>" + v.length + "</span>x "
          name = len + v[0].get("name")
          multiverseid = v[0].get("multiverseid")
          $("#" + section).append("<li>" + "<a href='#' card_id='" + multiverseid + "'>" + name + "</a></li>")
        })
      }
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
        // cardSet = new CardSet({code: set})

        var request = function() {
          return $.getJSON("http://mtgjson.com/json/" + set + ".json")
        }

        window.list = new List()

        request().done(function(data){
          _.each(data.cards, function(card){
            card = new Card(card)
            list.add(card)
          })

          var filter = function() { return $("#types option:selected").val().toLowerCase() }
          set = randomizeBooster(data.booster, 6, list)

          draft = new Draft({cards: set})
          setView(draft, filter(), "sideboard")

          $("a").on("mouseenter", function(e){
            card = deck.findCard($(this).attr("name"))
            img = card.imgTag()
            $("div.img img").remove()
            $("div.img").show()
            $("div.img").append(img)
          })

          $("#types").on("change", function(e){
            e.preventDefault();
            setView(draft, filter(), "sideboard")
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
