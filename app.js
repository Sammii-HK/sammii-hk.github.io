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
      // const classCheck = item.classList.contains('is-active')
      navbarBurger.classList.toggle('is-active')
      navbarMenu.classList.toggle('is-active')

      // console.log('classCheck', classCheck)
    })
  })


  // And instead of inserting the divs for each project, you can just have it take the class names from the appropriate array, that way you're sure it's only gonna be using the images for that project
  //
  // another thing to consider is for your div.carousel to be empty in the html and to use your initialised arrays of project image class names to map that number of div.slide-image elements into the div.carousel

  // const projectShow = document.querySelectorAll('.project-show')
  // const projectIcon = document.querySelectorAll('.project-icon')
  // const moreInfo = document.querySelectorAll('.more-info')
  //
  // projectShow.forEach(project => {
  //   project.classList.add('animated')
  //   project.classList.add('fadeOut')
  // })
  //
  // moreInfo.forEach(project => {
  //   project.classList.add('animated')
  //   project.classList.add('slideOutUp')
  // })
  // projectShow[0].classList.add('animated')
  // projectShow[0].classList.add('fadeIn')
  // // document.querySelectorAll('.project-show').indexOf(0).classList.add('fadeIn')
  // projectIcon[0].classList.add('fadeOut')
  //
  //

})






$(function(){

  const project1 = ['sei-1-1', 'sei-1-2', 'sei-1-3', 'sei-1-4']
  const project2 = ['sei-2-1', 'sei-2-2', 'sei-2-3']
  const project3 = ['sei-3-1', 'sei-3-2', 'sei-3-3', 'sei-3-4', 'sei-3-5', 'sei-3-6', 'sei-3-7']
  const project4 = ['sei-4-1', 'sei-4-2', 'sei-4-3', 'sei-4-4', 'sei-4-5', 'sei-4-6', 'sei-4-7']
  let carousel = []

  $('.project-show').hide()
  $('.project-show:first').show()
  $('.project-icon:first').hide()
  // $('.project').find('.more-info').hide()
  $('.project').find('.more-info').slideUp(.1)

  $('.project').addClass('is-4')
  $('.project:first').removeClass('is-4').addClass('is-11')


  // const selectedProject = $(this).attr('id')

  carousel.push(project4)

  const slide = document.createElement('div')

  $.populateCarousel = function(){
    $('#carousel').empty()
    carousel.map(image => {
      $('#carousel').append(slide)
      slide.classList.add(`${image}`)
      slide.classList.add('slide-image')
    })
  }

  // PROJECT SELECT
  $('.project').click(function() {
    $('.project').removeClass('is-11').addClass('is-4')
    $(this).insertBefore('.project:first').removeClass('is-4').addClass('is-11')

    $('.project.is-4').find('.more-info').hide()
    $('.project.is-4').find('.more-button').text('Find out more')

    $('.project-show').hide()
    $('.project-icon').show()

    $(this).find('.project-show').show()
    $(this).find('.project-icon').hide()


    // POPULATE CAROUSEL
    // clear carousel array
    carousel = []
    // get ID from current project, use to push to carousel array
    const selectedProject = $(this).attr('id')
    if (selectedProject === 'project-1') {
      carousel.push(project1)
    } else if (selectedProject === 'project-2') {
      carousel.push(project2)
    } else if (selectedProject === 'project-3') {
      carousel.push(project3)
    } else if (selectedProject === 'project-4') {
      carousel.push(project4)
    }

    console.log('carousel', carousel)

    // carousel.push(selectedProject)
    $.populateCarousel()

  })












  $('.more-button').click(function() {
    $('.project.is-11').find('.more-info').slideToggle()
    // $('.project.is-11').find('.more-button').innerHTML = 'See Less'

    $(this).text($(this).text() === 'Find out more' ? 'See less' : 'Find out more')
  })

  $('.skills-list').slideUp(1)

  $('#skills-button').click(function() {
    $('.skills-list').slideToggle()
    // $('.project.is-11').find('.more-button').innerHTML = 'See Less'

    $(this).text($(this).text() === 'View my tech stack' ? 'See less' : 'View my tech stack')
  })

  $('.list-item').fadeOut()

  $('.project-icon').mouseenter(function() {
    $(this).find('.project-details').fadeOut()
  })

  $('.project-icon').mouseleave(function() {
    $(this).find('.project-details').fadeIn()
  })

  $('.skill-item').mouseenter(function() {
    $(this).find('.icon').fadeOut()
    $(this).find('.list-item').delay(500).fadeIn()

    $('.skill-item').mouseleave(function() {
      $(this).find('.list-item').fadeOut()
      $(this).find('.icon').delay(500).fadeIn()
    })
  })


  $('.more-aboutMe').hide()

  $('#aboutMe-button').click(function() {
    $('#aboutMe').toggleClass('aboutMe-fun')

    $('.aboutMe').toggle()
    $('.more-aboutMe').toggle()

    $(this).text($(this).text() === 'Less business-y? 🤔' ? 'More boring 😬' : 'Less business-y? 🤔')
  })



  // And instead of inserting the divs for each project, you can just have it take the class names from the appropriate array, that way you're sure it's only gonna be using the images for that project

  // another thing to consider is for your div.carousel to be empty in the html and to use your initialised arrays of project image class names to map that number of div.slide-image elements into the div.carousel




  // should only work on the carousel in the column is-11
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
