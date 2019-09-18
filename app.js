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


  // const observer = lozad()
  // observer.observe()

  // function lozad('.lozad', {
  //   load: function(el) {
  //       el.src = el.dataset.src;
  //       el.onload = function() {
  //           el.classList.add('fade')
  //       }
  //   }
  // }).observe()

  // function lazyLoad(target) {
  //   const obs = new IntersectionObserver((entries) => {
  //     entries.forEach(entry => {
  //       if (entry.isIntersecting) {
  //         const div = entry.target
  //         // const src = img.getAttribute('data-lazy')
  //
  //         // img.setAttribute('src', src)
  //         div.classList.add('fadeIn')
  //
  //         // observer.disconnect()
  //       }
  //     })
  //   })
  //   obs.observe(target)
  // }
  //
  // lazyLoad()

})






$(function(){

  $('.project-show').hide()
  $('.project-show:first').show()
  $('.project-icon:first').hide()
  // $('.project').find('.more-info').hide()
  $('.project').find('.more-info').slideUp(.1)

  $('.project').addClass('is-4')
  $('.project:first').removeClass('is-4').addClass('is-11')

  $('.project').click(function() {
    $('.project').removeClass('is-11').addClass('is-4')
    $(this).insertBefore('.project:first').removeClass('is-4').addClass('is-11')

    $('.project.is-4').find('.more-info').hide()
    $('.project.is-4').find('.more-button').text('Find out more')

    $('.project-show').hide()
    $('.project-icon').show()

    $(this).find('.project-show').show()
    $(this).find('.project-icon').hide()
  })


  $('.more-button').click(function() {
    $('.project.is-11').find('.more-info').slideToggle()
    // $('.project.is-11').find('.more-button').innerHTML = 'See Less'

    $(this).text($(this).text() === 'Find out more' ? 'See less' : 'Find out more')
  })

  $('.project-icon').mouseenter(function() {
    $(this).find('.project-details').fadeOut()
  })

  $('.project-icon').mouseleave(function() {
    $(this).find('.project-details').fadeIn()
  })

  $('#aboutMe-button').click(function() {
    $('#aboutMe').toggleClass('aboutMe-fun')

    $(this).text($(this).text() === 'Less business-y? 🤔' ? 'More boring 😬' : 'Less business-y? 🤔')
  })




  // $('.shuffle-me').shuffleImages({
  //   trigger: 'imageMouseMove',
  //   target: '> div'
  // })

})
