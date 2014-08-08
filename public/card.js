// Things to review
// Recursion practice
//   1.) Binary Search
//   2.) QuickSort
//   3.) MergeSort
//   4.) Hashing Functions
//   5.) Graph Traversal
$(document).ready(function(){

  var delayedTimer = 0;

  Card = function(card) {
    this.imgTag = "http://mtgimage.com/multiverseid/" + card.multiverseid + ".jpg"
    this.name   = card.name
    this.multiverseid = card.multiverseid

    if (typeof card.manaCost == "undefined") {
      this.cost = '0'
    } else {
      this.cost = card.manaCost
    }

    this.cmc = card.cmc

    this.tapped = false
    this.defaultHeight = 240
    this.defaultWidth  = 180
    if (typeof card.colors == "undefined") {
      this.color = "None"
    } else {
      this.color = card.colors.join(' ')
    }
    this.type = card.types.join(' ')
  }

  Card.prototype.tapCard = function(card) {
    if (this.tapped == false) {
      card.css('transform', 'rotate(90deg)');
      this.tapped = false;
    } else {
      card.css('transform', 'rotate(90deg)');
      this.tapped = true;
    }
  }

  Card.prototype.appendImg = function(selector) {
    html = "<img src='" + this.imgTag + "' card='" + this.multiverseid + "' name='" + this.name + "' height='" + this.defaultHeight + "' width='" + this.defaultWidth + "'>"
    $(selector).append(html)
    this.htmlTag = $(selector + ' img:last')
  };

  Card.prototype.tap = function() {
    if (this.tapped) {
      this.htmlTag.css('transform', 'rotate(0deg)')
      this.tapped = false
    } else {
      this.htmlTag.css('transform', 'rotate(90deg)')
      this.tapped = true
    }
  };


  Card.prototype.tapAllTheCards = function(time, card) {
    delayedTimer += time
    _.delay(this.tapCard, delayedTimer, card)
  };

  var deck = JSON.parse($('div.cards').text());
  var cards = deck.cards
  var cardObjects = _.map(cards, function(card){
    return new Card(card);
  })

  var categories = getCardCategories();


  function getCardCategories() {
    categories = {}

    _.each(cardObjects, function(card){
      if (categories.hasOwnProperty(card.type)) {
        categories[card.type] += 1
      } else {
        $("div.button-stuff").append("<button class='" + card.type + "' cat='" + card.type + "'>Show " + card.type + "</button>")
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

  $('button').on("click", function(){
    var category = $(this).attr('cat')
    $('div.pictures img').remove()
    _.each(cardObjects, function(card){
      if (card.type == category) {
        card.appendImg('div.pictures');
      }
    })

    $('img').click(function(){
      cardId = $(this).attr('card')
      card = _.find(cardObjects, function(card){
        return card.multiverseid == cardId;
      })

      card.tap();
    })
  })

  $('button.hide-cards').click(function(){
    $('img').remove();
  })

  $('button.show-cards').on("click", function(){
    _.each(cardObjects, function(card){
      card.appendImg('div.pictures')
    })
  })
})
