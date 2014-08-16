requirejs.config({
  baseUrl: "js/lib",
  paths: {
    app: "../app",
    jquery: "//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min",
    d3: "http://d3js.org/d3.v3.min",
    underscore: "../lib/underscore-min",
    backbone: "../lib/backbone-min",
    graph: "../lib/graph",
    deck: "../lib/deck"
  }
})

requirejs(['jquery', 'd3', 'underscore', 'backbone', 'graph', 'deck'], function($, d3, _, backbone, graph, deck){
  var CardSet = Backbone.Model.extend({
    initialize: function (set) {
      code: set.code
      year: set.year
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

    initializeCards: function() {
      cards = this.get("cards")

      cards = _.map(cards, function(card){
        return new Card(card)
      })

      this.set("cards", cards)
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
      return _.filter(this.get("cards"), function(card) {
        return card.containsColor(color) && card.isMonoColor()
      })
    },

    getScoreAverage: function() {
      cards = _.filter(this.get('cards'), function(card){
        return card.isMonoColor();
      })

      scores = _.map(cards, function(card){
        return card.cardScore();
      })

      return _.reduce(scores, function(l,r) { return l + r; }) / scores.length;
    },

    getScoresByColor: function(color) {
      cards = this.cardsByColor(color)
      scores = _.map(cards, function(card) { return card.cardScore(); })
      // average score for each color for each spell type
      // against average score for ALL cards, which show which color/spell was
      // above or below average?

      setAverage = _.reduce(scores, function(l, r){ return l + r; }) / scores.length

      return setAverage;
    },

    setAverages: function() {
      var cardColors = {}
      var cardSet = this
      _.each(["Blue", "Red", "Green", "Black", "White"], function(color){
        if (!cardColors.hasOwnProperty(color)) { cardColors[color] = 0 }
        averageScoreByColor = cardSet.getScoresByColor(color)
        averageScore = cardSet.getScoreAverage();
        differential = averageScoreByColor - averageScore
        cardSet.set("averageScore", averageScore)
        cardSet.set(color, averageScoreByColor)
        cardSet.set("differential" + color, differential)
      })

      return cardSet;
    }
  })

  var Card = Backbone.Model.extend({
    initialize: function(card) {
      card: card
    },

    cardScore: function() {
      if (this.has("cmc")) {
        solid = this.getSolidCost()
        return (this.get("cmc") + (solid * 1.15)) * this.spellModifier()
      }

      return 0;
    },

    spellModifier: function() {
      types = this.get("types")
      var card = this
      score = 0
      _.each(types, function(type){
        switch(type) {
          case "Creature":
            score += card.creatureScore()
            break;
          case "Instant":
            score += 0.85
            break;
          case "Sorcery":
            score += 1.15
            break;
          case "Enchantment":
            score += card.enchantmentScore()
            break;
          default:
            score += 1.0
        }
      })

      return score;
    },

    creatureScore: function() {
      power = parseInt(this.get("power"))
      tough = parseInt(this.get("toughness"))

      if (isNaN(power) || isNaN(tough)) {
        return 1;
      } else {
        return (power * 0.15) + (tough * 0.075)
      }
    },

    enchantmentScore: function() {
      enchant = this.get("type")

      if (enchant == "Enchantment - Aura") {
        return 0.85;
      } else {
        return 1.15;
      }
    },

    getSolidCost: function() {
      manaCost = this.get("manaCost").split(/[^\w]/)
      cost = 0

      _.each(manaCost, function(mana){
        if (cardSymbols[mana]) {
          cost++;
        }
      })

      return cost;
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
          if (c == cardColors[color]) {
            manaCost += 1.5
          } else {
            manaCost += parseInt(c)
          }
        } else {

        }
      })

      return manaCost;
    }
  })

  var getList = function (name, setList) {
    $.getJSON("http://mtgjson.com/json/" + name, function(data){
      setList(data);
    })
  }

  var getAllCards = function (setList, complete) {
    var collection = [];

    for (i = 0; i < setList.length; i++) {
      getList(setList[i].code + ".json", function(cardSet){
        collection.push(cardSet)
        if (collection.length == setList.length) {
          complete(collection);
        }
      })
    }
  }

  getList("SetList.json", function(setList){
    getAllCards(setList, function(cardSets){
      cardSets = _.map(cardSets, function(cardSet){
        date = d3.time.format("%Y-%m-%d").parse(cardSet.releaseDate)
        cardSet = new CardSet(cardSet);
        cardSet.set("releaseDate", date)
        cardSet.initializeCards();
        return cardSet;
      })

      cardSets = _.filter(cardSets, function(cardSet){
        return cardSet.has("booster") && cardSet.get("name") != "Alara Reborn"
      })

      _.each(cardSets, function(cardSet){
        cardSet.setAverages();
      })

      showMeTheData = _.map(cardSets, function(cardSet){
        return cardSet.attributes
      })

      visualizeMe(showMeTheData)
    })
  })

  var visualizeMe = function (data) {
    data = _.sortBy(data, function(d){ return d.releaseDate })

    var margin = {top: 20, right: 20, bottom: 30, left: 50},
        width = 1800 - margin.left - margin.right,
        height = 1000 - margin.top - margin.bottom;

    var x = d3.time.scale()
      .range([0, width]);

    var y = d3.scale.linear()
      .range([height, 0]);

    var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

    var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left");

    var line = d3.svg.line()
      .interpolate("basis")
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(+d.diff); });

    var svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var colors = _.map(["White", "Red", "Blue", "Green", "Black"], function(color){
      diffs = _.map(data, function(set){
        return { diff: set["differential" + color], date: set.releaseDate }
      })

      return { color: color, diffs: diffs }
    })

    var dates = _.map(data, function(d) { return d.releaseDate })

    x.domain(d3.extent(dates, function(d) { return d; }));
    y.domain([-2, 2])

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Cost Differential")
      .attr("stroke", "black")




    var set = svg.selectAll(".sets")
      .data(colors)
      .enter()
      .append("g")
      .attr("class", "sets")

    set.append("path")
      .attr("class", "line")
      .attr("d", function(d){
        return line(d.diffs)
      })
      .style("stroke", function(d){
        if (d.color == "White") {
          color = d3.scale.category10();
          return color(d);
        } else {
          return d.color;
        }
      })
  }
})
