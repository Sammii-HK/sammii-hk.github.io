console.log('JS loaded 🐛')


document.addEventListener('DOMContentLoaded', () => {
  const navbarBurger = document.getElementById('navbar-burger')
  const navbarMenu = document.getElementById('navbar-menu')
  const navbarItem = document.querySelectorAll('.navbar-item')

  // NAVBAR TOGGLE FUNCTION
  navbarBurger.addEventListener('click', () => {
    console.log('navbarBurger Click 🍔')
    navbarBurger.classList.toggle('is-active')
    navbarMenu.classList.toggle('is-active')
  })

  navbarItem.forEach(item => {
    item.addEventListener('click', () => {
      console.log('navbarItem Click 🍭')
      navbarBurger.classList.toggle('is-active')
      navbarMenu.classList.toggle('is-active')

    })
  })

})






$(function(){
  const project1 = ['sei-1-1', 'sei-1-2', 'sei-1-3', 'sei-1-4']
  const project2 = ['sei-2-1', 'sei-2-2', 'sei-2-3']
  const project3 = ['sei-3-1', 'sei-3-2', 'sei-3-3', 'sei-3-4', 'sei-3-5', 'sei-3-6', 'sei-3-7']
  const project4 = ['sei-4-1', 'sei-4-2', 'sei-4-3', 'sei-4-4', 'sei-4-5', 'sei-4-6', 'sei-4-7']

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

    if (selectedItem === 'nav-home') {
      $('#navbar-burger').addClass('is-active')
      $('navbar-menu').removeClass('is-active')
    }

  })

  count = 1

  // ANIMATE CAROUSEL FUNCTION
  $.animateCarousel = function(){
    console.log(count)
    $('#slideImage').fadeOut().queue(function(next){
      $(this).removeClass().addClass(`${carousel[0][count]}`).addClass('slide-image').delay(150).fadeIn()
      next()
      count = count === carousel[0].length - 1 ? 0 : count + 1
    })
  }

  $.reverseCarousel = function(){
    console.log(count)
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
    }
  })



  $('#left-arrow').click(function() {
    console.log('left click')
    // count = count --
    $.reverseCarousel()
    clearInterval(interval)
    interval = setInterval($.animateCarousel, 5000)
  })

  $('#right-arrow').click(function() {
    console.log('right click')
    count = count ++

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
    $(this).find('.icon').fadeOut()
    $(this).find('.list-item').delay(500).fadeIn()

    $('.skill-item').mouseleave(function() {
      $(this).find('.list-item').fadeOut()
      $(this).find('.icon').delay(500).fadeIn()
    })
  })

  // MORE ABOUT ME
  $('.more-aboutMe').slideUp().fadeOut( 400 )

  $('#aboutMe-button').click(function() {
    const height = $(window).scrollTop()
    const offset = $('#aboutMe').offset().top - 75

    // console.log('height', height)
    // console.log('offset', offset)

    if (height > offset) {
      $('html, body').animate({
        scrollTop: offset
      }, 500)
    }

    $('.aboutMe').slideToggle()
    $('.more-aboutMe').slideToggle()
    $(this).text($(this).text() === 'Less business-y? 🤔' ? 'More boring 😬' : 'Less business-y? 🤔')
  })

})
