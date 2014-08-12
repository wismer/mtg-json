$(document).ready(function(){
  var svg = window.svg = d3.select(document.getElementById("visualizer")).append('svg')
  svg.attr("height", 900).attr("width", 1100)
  var decks = [];
  var mtgJSON = function(json, deck) {
    $.getJSON("http://mtgjson.com/json/" + json, function(){}).done(function(data){
      if (json == "SetList.json") {
        _.each(data, function(set) {
          deck = new Deck(set);
          decks.push(deck)
          deck.createOption();
        })
      } else {
        cards = _.map(data.cards, function(card) {
          return new Card(card);
        })

        deck.set("cards", cards)
      }
    })
  }

  var view = mtgJSON("SetList.json")

  var parseYear = function(date) {
    date = new Date(date)
    return date.getFullYear().toString();
  }

  var Deck = Backbone.Model.extend({
    initialize: function(deck) {
      name: deck.name
      year: parseYear(deck)
      code: deck.code
    },

    loadCards: function() {
      mtgJSON(this.get("code") + ".json", this);
    },

    createOption: function() {
      option = "<option value='" + this.get("code") + "'>" + this.get("name") + "</option>"
      $("form select").append(option)

      var deck = this;
    },

    setGraph: function() {
      // if (true) {};
      var deck = this
      var cards = this.get("cards")
      // data = {Black: 0, Red: 0, Blue: 0, Green: 0, White: 0, Artifact: 0, Multi: 0};
      spellTypes = {}


      _.each(cards, function(card){
        spell = card.attributes.types.join()
        if (spellTypes[spell]) {
          spellTypes[spell] += 1
        } else {
          spellTypes[spell] = 1
        }

        // if (card.colors.length > 1) {
        //   data.Multi += 1
        // } else if (data.hasOwnProperty(card.colors.join())) {
        //   color = card.colors.join();
        //   data.color += 1
        // } else {
        //   color.Artifact += 1
        // }
      })

      var pie = d3.layout.pie()
      var keys = _.keys(spellTypes)
      var boxColor;
      pie(_.values(spellTypes))
      var arc = d3.svg.arc().innerRadius(150).outerRadius(300)
      var color = d3.scale.category10();
      var arcs = svg.selectAll("g.arc")
        .data(pie(_.values(spellTypes)))
        .enter().append("g")
        .attr("class", "arc")
        .attr("transform", "translate(300, 300)")

      arcs.append("path")
        .attr("fill", function(d, i){
          boxColor = color(i)
          keys = _.keys(spellTypes)
          // _.each(keys, function(key){
          // svg.selectAll('rect').data(keys).enter().append('rect')
          //   .attr("x", 650)
          //   .attr("y", function(d,i){
          //     return (i * 30) + 100;
          //   })
          //   .attr("height", 30)
          //   .attr("width", 30)
          //   .attr("stroke", function(d,i){
          //     return color(i);
          //   })
          //   .attr("fill", function(d,i){
          //     return color(i);
          //   })
          //   .append("svg:a")
          //   .attr("xlink:href", function(d){
          //     return "/" + d;
          //   })
          //   .append("svg:rect")
          //   .attr("y", function(d,i){
          //     return (i * 30) + 100;
          //   })
          //   .attr("height", 30)
          //   .attr("width", 30)
          //   .style("fill", "black")

            // .append("text")
            // .attr("transform", function(d,i){
            //   x = 700
            //   y = (i * 30) + 100;
            //   return "translate(" + x + "," + y + ")";
            // })
            // .text(function(d,i){
            //   return d;
            // })
            // $("#visualizer").append("<span>" + )
          // })
          return color(i);
        })
        .attr("d", arc)


      // var links = svg.selectAll("svg:a").data(keys).enter().append("svg:a")
      //   .attr("xlink:href", function(d,i){
      //     return "/" + deck + "/" + d;
      //   })

      // var rects = links.append("rect")

      var legend = svg.append("g")
        .attr("class", "legend")

      // var rects = svg.selectAll("g.legend").data(keys).enter().append("g")
        // .attr("class", "legend")
      legend.selectAll("rect").data(keys).enter()
        .append("rect")
        .attr("x", 650)
        .attr("y", function(d,i){
          return (i * 30) + 100;
        })
        .attr("height", 30)
        .attr("class", function(d,i){
          return d;
        })
        .attr("width", function(d,i){
          return spellTypes[d];
        })
        .attr("stroke", function(d,i){
          return color(i);
        })
        .attr("fill", function(d,i){
          return color(i);
        })

      legend.selectAll("text").data(keys).enter().append("text")
        .attr("x", 700)
        .attr("y", function(d, i){
          return (i * 30) + 120;
        })
        .text(function(d){return d + ": " + spellTypes[d];})
        .attr("class", function(d){return d})
        .attr("font-family", "sans-serif")
        .attr("font-size", "20px")
        .attr("fill", "white")
        .style({opacity: "0.6"})
        .on("mouseover", function(){
          d3.select(this).style({opacity: "1.0"})
        })
        .on("mouseout", function(){
          d3.select(this).style({opacity: "0.6"})
        })
        .on("click", function(){
          svg.selectAll("text").attr("id", "").on("mouseout", function(){
            d3.select(this).style({opacity: "0.5"})
          })
          d3.select(this).attr("id", "current").on("mouseout", function(){
            d3.select("#current").style({opacity: "1.0"})
          })
          svg.selectAll("g.arc").transition().attr("transform", "translate(0, 300)").style({opacity: "0.5"})
          svg.select("g.legend").selectAll("rect").transition()
            .attr("x", 350).style({opacity: "0.5"})
            .delay(300)
          svg.selectAll("text").transition().attr("x", 400).style({opacity: "0.5"})
          type = $("#current").attr("class")
          deck.showSelection(type);
        })
    },

    getCardsByType: function(type, attribute) {
      deck = this
      cards = deck.get("cards")
      data = {}

      _.each(cards, function(card){
        if (card.isOfType(type)) {
          attr = card.get(attribute)
          if (data[attr]) {
            data[attr].cardData.push(card)
            data[attr].count += 1
          } else {
            data[attr] = { cardData: [card], count: 1 }
          }
        }
      })

      return data;
    }

    showSelection: function(type, attribute) {
      var deck = this

      cards = deck.get("cards")
      var data = deck.getCardsByType(type, attribute)





      dataKeys = _.keys(data)
      var byCost = svg.append("g")
        .attr("class", "card-types")

      byCost.selectAll("rect")
        .data(dataKeys)
        .enter()
        .append("rect")
        .attr("x", function(d, i){
          return (i * 35) + 600;
        })
        .attr("y", 100)
        .attr("width", 30)
        .attr("height", function(d,i){
          return data[d].count * 10;
        })
        .attr("fill", function(d,i){
          color = d3.scale.category10();
          return color(i)
        })
        .transition()
        .delay(300)

      byCost.selectAll("rect")
        .on("click", function(d,i){
          $("div.card-placeholder img").remove()
          cards = data[d].cardData

          _.each(cards, function(card){
            card.appendImg();
          })
        })

      var manaSymbols = byCost.selectAll("image").data(dataKeys).enter().append("image")
        .attr("xlink:href", function(d,i){
          return "http://mtgimage.com/symbol/mana/" + d + "/64.gif"
        })
        .attr("x", function(d,i){
          return (i * 35) + 605;
        })
        .attr("y", 65)
        .attr("height", 20)
        .attr("width", 20)


    }
  })

  var Card = Backbone.Model.extend({
    initialize: function(cardData) {
      color: cardData.colors
      name: cardData.name
      multiId: cardData.multiverseid
      manaCost: cardData.manaCost
      cmc: cardData.cmc
      types: cardData.types
    },

    getAttributes: function() {
      return this.attributes
    },

    isOfType: function(type) {
      return _.contains(this.get("types"), type)
    },

    appendImg: function() {
      imgUrl = "http://mtgimage.com/multiverseid/" + this.get("multiverseid") + ".jpg"
      $("div.card-placeholder").append("<img src='" + imgUrl + "' height='240' width='180'>")
    }
  })

  var currentDeck;

  $("form").on("submit", function(e){
    e.preventDefault();
    deck = _.find(decks, function(val){
      return val.get("code") == $("option:selected").val();
    })
    deck.loadCards()
    if (deck.get("cards")) {

      deck.setGraph()

    }


  })

  // var viewer;

  // $.getJSON("http://mtgjson.com/json/SetList.json", function(sets, status, xhr){
  //   sets = _.map(sets, function(set){ return new Deck(set); })
  //   window.viewer = new DeckViewer({decks: sets});
  // })

  var DeckViewer = Backbone.Model.extend({
    initialize: function(decks) {
      decks: decks;
    }
  })

  // window.viewer = new DeckViewer({decks: getDecks()});
  var delayedTimer = 0;

  // Card = function(card) {
  //   this.imgTag = "http://mtgimage.com/multiverseid/" + card.multiverseid + ".jpg"
  //   this.name   = card.name
  //   this.multiverseid = card.multiverseid

  //   if (typeof card.manaCost == "undefined") {
  //     this.cost = '0'
  //   } else {
  //     this.cost = card.manaCost
  //   }

  //   this.cmc = card.cmc

  //   this.tapped = false
  //   this.defaultHeight = 240
  //   this.defaultWidth  = 180
  //   if (typeof card.colors == "undefined") {
  //     this.color = "None"
  //   } else {
  //     this.color = card.colors.join(' ')
  //   }
  //   this.type = card.types.join(' ')
  // }

  // Card.prototype.tapCard = function(card) {
  //   if (this.tapped == false) {
  //     card.css('transform', 'rotate(90deg)');
  //     this.tapped = false;
  //   } else {
  //     card.css('transform', 'rotate(90deg)');
  //     this.tapped = true;
  //   }
  // }

  // Card.prototype.appendImg = function(selector) {
  //   html = "<img src='" + this.imgTag + "' card='" + this.multiverseid + "' name='" + this.name + "' height='" + this.defaultHeight + "' width='" + this.defaultWidth + "'>"
  //   $(selector).append(html)
  //   this.htmlTag = $(selector + ' img:last')
  // };

  // Card.prototype.tap = function() {
  //   if (this.tapped) {
  //     this.htmlTag.css('transform', 'rotate(0deg)')
  //     this.tapped = false
  //   } else {
  //     this.htmlTag.css('transform', 'rotate(90deg)')
  //     this.tapped = true
  //   }
  // };


  // Card.prototype.tapAllTheCards = function(time, card) {
  //   delayedTimer += time
  //   _.delay(this.tapCard, delayedTimer, card)
  // };

  // var Experiment = Backbone.Model.extend({
  //   initialize: function() {
  //     console.log(this);
  //   }
  // })

  // $.getJSON("http://mtgjson.com/json/SetList.json", function(sets, status, xhr){
  //   _.each(sets, function(set){
  //     date = new Date(set.releaseDate);
  //     date = date.getFullYear().toString();

  //     if (setsByYear.hasOwnProperty(date)) {
  //       setsByYear[date].push(set)
  //     } else {
  //       setsByYear[date] = [set]
  //     }
  //   })

  //   _.each(setsByYear, function(value, key){
  //     count = value.length
  //     $("div.card-sets ul").append("<li><button name='" + key + "'>" + key + ": " + count + "</button></li>")
  //   })

  //   $("button").on("click", showSet)
  // })


  function showSet() {
    year = $(this).attr("name");
    sets = setsByYear[year]

    createForm(sets);
    $("select").on("click", showDeck)
  }

  function createForm(sets) {
    mappedSets = _.map(sets, function(value){
      return "<option value='" + value.code + "'>" + value.name + "</option>";
    }).join()

    list = "<form name='show-set'>" + "<select name='set'>" + mappedSets + "</select>";
    submit = "<button name='submit'>Submit</button></form>"
    $("div.card-portal").append(list + submit);

    $("form button").on("click", showDeck(e))
  }


  function getCardCategories() {
    categories = {}

    _.each(cardObjects, function(card){
      if (categories.hasOwnProperty(card.type)) {
        categories[card.type] += 1
      } else {
        $("div.button-stuff").append("<li><button class='" + card.type + "' cat='" + card.type + "'>Show " + card.type + "</button></li>")
        categories[card.type] = 1
      }
    })

    return categories;
  }

  function showCards (type) {
    _.each(cards, function(card){
      card = new Card(card);
      card.appendImg('div.pictures')
      card.htmlTag.attr('class', card.type)
    })
  }


  // $('button').on("click", function(){
  //   // var category = $(this).attr('cat')
  //   // $('div.pictures img').remove()
  //   // _.each(cardObjects, function(card){
  //   //   if (card.type == category) {
  //   //     card.appendImg('div.pictures');
  //   //   }
  //   // })

  //   $('img').click(function(){
  //     cardId = $(this).attr('card')
  //     card = _.find(cardObjects, function(card){
  //       return card.multiverseid == cardId;
  //     })

  //     card.tap();
  //   })
  // })

  // $('button.hide-cards').click(function(){
  //   $('img').remove();
  // })

  // $('button.show-cards').on("click", function(){
  //   _.each(cardObjects, function(card){
  //     card.appendImg('div.pictures')
  //   })
  // })
})
