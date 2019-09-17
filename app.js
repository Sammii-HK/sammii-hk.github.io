console.log('JS loaded 🐛')


document.addEventListener('DOMContentLoaded', () => {
  const navbarBurger = document.getElementById('navbar-burger')
  const navbarMenu = document.getElementById('navbar-menu')
  const navbarItem = document.querySelectorAll('.navbar-item')
  // const iconsToType = document.getElementById('icons-to-type')
  // const list = document.querySelectorAll('.list-item')
  // const icon = document.querySelectorAll('.icon')
  // const projectSlide = document.querySelectorAll('.carousel-cell')
  // const titles = document.querySelectorAll('.title-container')

  // NAVBAR TOGGLE FUNCTION
  navbarBurger.addEventListener('click', () => {
    console.log('navbarBurger Click 🍔')
    navbarBurger.classList.toggle('is-active')
    navbarMenu.classList.toggle('is-active')
  })

  navbarItem.forEach(item => {
    item.addEventListener('click', () => {
      console.log('navbarItem Click 🍭')
      const classCheck = item.classList.contains('is-active')

      console.log('classCheck', classCheck)
    })
  })




})






$(function(){

  $('.project').addClass('is-4')
  $('.project:first').removeClass('is-4').addClass('is-11')


  $('.project').hover(function() {
    console.log('hovered')
  })

  $('.project').click(function() {
    $('.project').removeClass('is-11').addClass('is-4')
    $(this).insertBefore('.project:first').addClass('is-11')


    console.log('clicked')
  })

})
