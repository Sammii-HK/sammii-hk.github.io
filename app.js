console.log('JS loaded 🐛')

$(function(){
  const project1 = ['sei-1-1', 'sei-1-2', 'sei-1-3', 'sei-1-1', 'sei-1-5', 'sei-1-6', 'sei-1-7', 'sei-1-8', 'sei-1-9', 'sei-1-10', 'sei-1-11', 'sei-1-12', 'sei-1-13', 'sei-1-14', 'sei-1-15']
  const project2 = ['sei-2-1', 'sei-2-2', 'sei-2-3', 'sei-2-4', 'sei-2-5', 'sei-2-6', 'sei-2-7', 'sei-2-8', 'sei-2-9', 'sei-2-10']
  const project3 = ['sei-3-1', 'sei-3-2', 'sei-3-3', 'sei-3-4', 'sei-3-5', 'sei-3-6', 'sei-3-7', 'sei-3-8', 'sei-3-9', 'sei-3-10', 'sei-3-11', 'sei-3-12', 'sei-3-13', 'sei-3-14', 'sei-3-15', 'sei-3-16']
  const project4 = ['sei-4-1', 'sei-4-2', 'sei-4-3', 'sei-4-4', 'sei-4-5', 'sei-4-6', 'sei-4-7', 'sei-4-8', 'sei-4-9', 'sei-4-10', 'sei-4-11', 'sei-4-12', 'sei-4-13', 'sei-4-14', 'sei-4-15']
  const project5 = ['commInfo-1', 'commInfo-2', 'commInfo-3', 'commInfo-4']

  let carousel = []
  let count = 0

  $('.project-show').hide()
  $('.project-show:first').show()
  $('.project-icon:first').hide()
  $('.project').find('.more-info').slideUp(.1)
  $('.project').addClass('is-4')
  $('.project:first').removeClass('is-4').addClass('is-11')
  carousel.push(project4)
  $('#slideImage').addClass(`${carousel[0][0]}`)
  $('#slideImage').addClass('slide-image')


  // // NAVBAR TOGGLE FUNCTION
  $('#navbar-burger').click(function() {
    console.log('navbarBurger Click 🍔')
    $('#navbar-burger').toggleClass('is-active')
    $('#navbar-menu').toggleClass('is-active')
  })

  $('#navbar-menu .navbar-item').click(function() {
    console.log('navbarItem Click 🍭')
    $('#navbar-burger').toggleClass('is-active')
    $('#navbar-menu').toggleClass('is-active')
  })


  // NAVBAR SCROLL ANIMATE
  $('.navbar-item').click(function() {
    const selectedItem = $(this).attr('id')

    switch(selectedItem) {
      case 'nav-home':
        $('html, body').animate({
          scrollTop: 0
        }, 500)
        break
      case 'nav-projects':
        $('html, body').animate({
          scrollTop: $('#carousel-container').offset().top - 100
        }, 500)
        break
      case 'nav-about':
        $('html, body').animate({
          scrollTop: $('#aboutMe').offset().top - 100
        }, 500)
        break
      case 'nav-contact':
        $('html, body').animate({
          scrollTop: $('#contact').offset().top - 100
        }, 500)
        break
    }
  })

  count = 1

  // ANIMATE CAROUSEL FUNCTION
  $.animateCarousel = function(){
    console.log('forward', count)
    $('#slideImage').fadeOut().queue(function(next){
      $(this).removeClass().addClass(`${carousel[0][count]}`).addClass('slide-image').delay(150).fadeIn()
      next()
      count = count === carousel[0].length - 1 ? 0 : count + 1
    })
  }

  $.reverseCarousel = function(){
    console.log('reverse', count)
    $('#slideImage').fadeOut().queue(function(next){
      $(this).removeClass().addClass(`${carousel[0][count]}`).addClass('slide-image').delay(150).fadeIn()
      next()
      count = count === 0 ? carousel[0].length - 1 : count - 1
    })
  }

  let interval = setInterval($.animateCarousel, 5000)


  // PROJECT SELECT
  $('.project').click(function() {
    count = 0
    $('.project').removeClass('is-11').addClass('is-4')
    $(this).insertBefore('.project:first').removeClass('is-4').addClass('is-11')

    $('.project.is-4').find('.more-info').hide()
    $('.project.is-4').find('.more-button').text('Find out more')

    $('.project-show').hide()
    $('.project-icon').show()

    $(this).find('.project-show').show()
    $(this).find('.project-icon').hide()


    // POPULATE CAROUSEL
    carousel = []
    const selectedProject = $(this).attr('id')

    switch(selectedProject) {
      case 'project-1':
        carousel.push(project1)
        break
      case 'project-2':
        carousel.push(project2)
        break
      case 'project-3':
        carousel.push(project3)
        break
      case 'project-4':
        carousel.push(project4)
        break
      case 'project-5':
        carousel.push(project5)
        break
    }
  })

  // ARROW FUNCTIONS
  $('#left-arrow').click(function() {
    $.reverseCarousel()
    clearInterval(interval)
    interval = setInterval($.animateCarousel, 5000)
  })

  $('#right-arrow').click(function() {
    $.animateCarousel()
    clearInterval(interval)
    interval = setInterval($.animateCarousel, 5000)
  })

  // PROJECT ICON CLICK
  $('.project-icon').click(function() {
    const offset = $('#carousel-container').offset().top - 250

    $.animateCarousel()
    clearInterval(interval)
    interval = setInterval($.animateCarousel, 5000)

    $('html, body').animate({
      scrollTop: offset
    }, 500)
  })

  // MORE INFO PROJECT BUTTON
  $('.more-button').click(function() {
    const height = $(window).scrollTop()
    const offset = $('#projects').offset().top - 175

    if (height > offset) {
      $('html, body').animate({
        scrollTop: offset
      }, 500)
    }

    $('.project.is-11').find('.more-info').slideToggle()
    $(this).text($(this).text() === 'Find out more' ? 'See less' : 'Find out more')
  })

  // PROJECT ICON HOVER EFFECT
  $('.project-icon').mouseenter(function() {
    $(this).find('.project-details').fadeOut()
  })

  $('.project-icon').mouseleave(function() {
    $(this).find('.project-details').fadeIn()
  })

  // SKILLS LIST FUNCTION
  $('.skills-list').slideUp(1)

  $('#skills-button').click(function() {
    $('.skills-list').slideToggle()

    $(this).text($(this).text() === 'View my tech stack' ? 'See less' : 'View my tech stack')
  })

  $('.list-item').fadeOut()

  $('.skill-item').mouseenter(function() {

    $(this).find('.icon').fadeOut().queue(function(next){
      $(this).parent().find('.list-item').fadeIn().delay(1000).fadeOut().parent().find('.icon').delay(2100).fadeIn()
      next()
    })
  })

  // MORE ABOUT ME
  $('.more-aboutMe').slideUp().fadeOut( 400 )

  $('#aboutMe-button').click(function() {
    const height = $(window).scrollTop()
    const offset = $('#aboutMe').offset().top - 75

    if (height > offset) {
      $('html, body').animate({
        scrollTop: offset
      }, 500)
    }

    $('.aboutMe').slideToggle()
    $('.more-aboutMe').slideToggle()
    $(this).text($(this).text() === 'Less business-y? 🤔' ? 'Just less 🙃' : 'Less business-y? 🤔')
  })

})
