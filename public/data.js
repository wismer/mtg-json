$(document).ready(function() {

  // var pics = ['public/img/card1.jpg', 'public/img/card2.jpg', 'public/img/card3.jpg']
  // var svg = window.svg = d3.select(document.body).append('svg')
  // svg.attr('width', 900)
  // var x_coord = 0
  // var height = 10

  Proccer = function(func, time) {
    this.func = func
    this.setBind = function(time) {
      var bind = _.bind(this.func, this);
      _.delay(func, time)
    }
  };


  

  Proccer.prototype.activate = function(time) {
    var binder = this.setBind();
    _.delay(binder, time)
  };

  Carousel = function() {
    this.pictures = ['pic1', 'pic2', 'pic3', 'pic4', 'pic5', 'pic6']
    this.current = null
    this.height  = 180
    this.width   = 180
  }


  Carousel.prototype.showRight = function(elem) {
    if (this.current == null) {
      this.current = this.pictures[0]
    }

    return this.makeImg()
  };

  function renderData(data) {
    min_max = jobList(data);
    console.log(data)
    svg.selectAll('rect').data(data.jobs).enter().append('rect')
      .attr('x', function(d, i){
        return 0
      })
      .attr('y', function(d,i){
        svg.attr('height', x_coord)
        return x_coord += 10
      })
      .attr('height', 10)
      .attr('width', function(d,i){
        return ((d.transaction_total / min_max.max) * 100) * 25
      })
      .attr('stroke', 'black')
      .attr('stroke-width', '1px')
      .attr('fill', 'blue')
  }

  function jobList(data) {
    return { max: data.jobs[0].transaction_total, min: data.jobs[data.jobs.length - 1].transaction_total }
  }

  function totalAmt(data) {
    var n = 0
    jobs = data.jobs
    for (var i = jobs.length - 1; i >= 0; i--) {
      n += jobs[i].transaction_total
    };
    return n
  }

  function makeIllustration(data) {
    total = totalAmt(data);
    renderData(data);
  }

  function makeCarousel() {
    pics.forEach(function(pic){
      $('div.carousel').append('<button class="click-left">Left</button>' + '<button class="click-right">')
    })
  }

  var getJobData = function(job) {
    $.getJSON('/occupations/' + job, function(data, status, xhr){
      renderData(data);
    })
  }

  $('a').click(function(e){
    e.preventDefault();
    job = $(this).attr('title')
    getJobData(job);
  })

  var moveRight = function(pic) {
    img = $('div.current span').remove()
    $('div.hidden').append(img);
    nextImage = $('div.hidden span:first').remove()
    $('div.current').append(nextImage);
  }

  var moveLeft = function(pic) {
    img = $('div.current span:first')
    $('div.hidden').prepend(img)
    nextImage = $('div.hidden span:last').remove()
    $('div.current').append(nextImage)
  }
  // var carousel = new Carousel()
  // _.extend(carousel, Backbone.Events);
  // carousel.on('moveRight', function(msg){
  //   moveRight();
  // })

  var move = _.bind(moveRight, $('button.right'))

  var mextSlideAuto = function(func) { _.delay(func, 5000, '') }





  // carousel.trigger('moveRight')

  $('button.right').click(moveRight)
  $('button.left').click(moveLeft)
  // $('button.show-all').click(function(e){
    //$.getJSON('/occupations/all', function(d, s, x){
      //makeIllustration(d);
    //}) 
  // })
})