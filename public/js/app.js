requirejs.config({
  baseUrl: "js/lib",
  paths: {
    app: "../app",
    jquery: "//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min",
    d3: "http://d3js.org/d3.v3.min",
    underscore: "../lib/underscore-min",
    backbone: "../lib/backbone-min",
    handlebars: "../lib/handlebars-v2.0.0"
  }
})

requirejs(['jquery', 'd3', 'underscore', 'backbone', 'handlebars'], function($, d3, _, backbone, Handlebars){

  var collector = function (set, category) {
    var items = {}
    var cards = set.get("cards")

    var setKey = function(subcat) {
      if (!items[subcat]) { items[subcat] = {} }
    }

    var sorter = function(subset, cid) {
      var card = subset[0]
      var key = card.subCategory(category) // .bind(card)
      setKey(key)
      items[key][cid] = subset
    }

    _.each(cards, sorter)
    return items;
  }

  var Card = Backbone.Model.extend({
    initialize: function(card) {
      card: card
    },

    getType: function() {
      var types = this.get("types")
      return types.length > 1 ? types.join(" ") : types[0]
    },

    getColor: function() {
      var colors = this.get("colors")
      if (colors) {
        return colors.length > 1 ? "Multi" : colors[0]
      } else if (this.isArtifact()) {
        return "Artifact"
      } else {
        return "Land"
      }
    },

    getCost: function() {
      var cost = this.get("cmc")

      if (cost) {
        return cost
      } else {
        return "Land"
      }
    },

    subCategory: function(category) {
      if (category === "types") {
        return this.getType()
      } else if (category === "cmc") {
        return this.getCost()
      } else {
        return this.getColor()
      }
    },

    removeLink: function(section) {
      $("#" + section + " a[multiverse=" + this.get("multiverseid") +"]").remove()
    },

    tag: function(n, section) {
      link = this.get("link").attr("class", section)
      return $("<li><span>" + n + "</span>x </li>").append(this.get("link"))
    },

    hasFrequency: function(freq) {
      return this.get("rarity").toLowerCase() === freq;
    },

    isArtifact: function() {
      return this.has("cmc") && (!this.has("colors"))
    }
  })

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



  var Expansion = Backbone.Model.extend({
    initialize: function(set) {
      set: set
    }
  })

  var CardList = Backbone.Collection.extend({
    model: Card
  })

  var SetList = Backbone.Model.extend({
    initialize: function(list) {
      list: list
    }
  })

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

  $("#profile button").on("click", function(e){
    var profileName = $("#profile input").val()
    var profile = new Profile({name: profileName})
    profile.insertToDB(function(key){
      var setlist = new SetList();
      var SetView = Backbone.View.extend({
        el: $("#deckSelection"),

        initialize: function() {
          this.listenTo(setlist, "change", this.render);
        },

        render: function () {
          var expansions = setlist.get("expansions")
          var options = _.map(expansions, function(expansion){
            return "<option code='" + expansion.code + "'>" + expansion.name + "</option>"
          }).join("\n")
          this.$el.html(options)
          return this;
        }
      })

      var request = function(mtg) {
        $.getJSON("http://mtgjson.com/json/" + mtg.name + ".json").done(function(data){
          setlist.set({expansions: data})
        })
      };


      setTimeout(request({name: "SetList", list: setlist}), 500)
      var setview = new SetView({model: setlist});
      $("#deckSelection").on("change", function(e){
        e.preventDefault();
        var set = $("#deckSelection option:selected").attr("name");
        var list = new List();
      })
    })
  })
})
