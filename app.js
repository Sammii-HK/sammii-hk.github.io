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

  // ANIMATE CAROUSEL FUNCTION
  $.animateCarousel = function(){
    console.log('count', count)
    $('#slideImage').fadeOut().queue(function(next){
      $(this).removeClass().addClass(`${carousel[0][count]}`).addClass('slide-image').delay(150).fadeIn()
      next()
      count = count === carousel[0].length - 1 ? 0 : count + 1
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
    // console.log('left', count)
    // window.clearInterval()
    // count = count --
    // window.setInterval($.animateCarousel, 3000)
    // interval = window.setInterval($.animateCarousel, 3000)

  })

  $('#right-arrow').click(function() {
    console.log('right click')
    // console.log('right', count)
    // window.clearInterval()
    // count = count ++
    // window.setInterval($.animateCarousel, 3000)
    // interval = window.setInterval($.animateCarousel, 3000)
  })


  // PROJECT ICON CLICK
  $('.project-icon').click(function() {
    const offset = $('#carousel-container').offset().top - 75
    const height = $(window).scrollTop()
    // const browser = $(document).height()
    clearInterval(interval)

    interval = setInterval($.animateCarousel, 5000)

    console.log('height', height)
    console.log('**offset', offset)
    // console.log('**browser', browser)

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





  // let interval = window.setInterval(rotateSlides, 3000)
  //
  // function rotateSlides() {
  //
  //   const $firstSlide = $('.column.is-11').find('.carousel').find('div:first')
  //   const width = $firstSlide.width()
  //
  //
  //   $firstSlide.animate({marginLeft: -width}, 1000, function(){
  //     var $lastSlide = $('.column.is-11').find('.carousel').find('div:last')
  //     $lastSlide.insertBefore($firstSlide)
  //     $firstSlide.css({marginLeft: 0})
  //   })
  //
  //   $('#left-arrow').click(previousSlide)
  //   $('#right-arrow').click(nextSlide)
  //   $('.slide-image').click(nextSlide)
  //
  //
  //   function nextSlide(){
  //     window.clearInterval(interval)
  //     var $currentSlide = $('.column.is-11').find('.carousel').find('div:first')
  //     var width = $currentSlide.width()
  //     $currentSlide.animate({marginLeft: -width}, 1000, function(){
  //       var $lastSlide = $('.column.is-11').find('.carousel').find('div:last')
  //       $lastSlide.insertBefore($currentSlide)
  //       $currentSlide.css({marginLeft: 0})
  //       interval = window.setInterval(rotateSlides, 3000)
  //     })
  //   }
  //
  //   function previousSlide(){
  //     window.clearInterval(interval)
  //     var $currentSlide = $('.column.is-11').find('.carousel').find('div:first')
  //     var width = $currentSlide.width()
  //     var $previousSlide = $('.column.is-11').find('.carousel').find('div:last')
  //     $previousSlide.css({marginLeft: -width})
  //     $currentSlide.insertBefore($previousSlide)
  //     $previousSlide.animate({marginLeft: 0}, 1000, function(){
  //       interval = window.setInterval(rotateSlides, 3000)
  //     })
  //   }

  // }

})
