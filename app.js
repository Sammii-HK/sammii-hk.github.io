console.log('JS loaded 🐛')


const $carousel = $('.carousel').flickity({
  imagesLoaded: true,
  percentPosition: false
})

const $imgs = $carousel.find('.carousel-cell img')
// get transform property
const docStyle = document.documentElement.style
const transformProp = typeof docStyle.transform === 'string' ?
  'transform' : 'WebkitTransform'
// get Flickity instance
const flkty = $carousel.data('flickity')

$carousel.on( 'scroll.flickity', function() {
  flkty.slides.forEach( function( slide, i ) {
    const img = $imgs[i]
    const x = ( slide.target + flkty.x ) * -1/3
    img.style[ transformProp ] = 'translateX(' + x  + 'px)'
  })
})


document.addEventListener('DOMContentLoaded', () => {

  const navbarBurger = document.getElementById('navbar-burger')
  const navbarMenu = document.getElementById('navbar-menu')

  navbarBurger.addEventListener('click', () => {
    navbarBurger.classList.toggle('is-active')
    navbarMenu.classList.toggle('is-active')
  })
})



//
//
// document.addEventListener('DOMContentLoaded', () => {
//
//   // Get all "navbar-burger" elements
//   const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0)
//
//   // Check if there are any navbar burgers
//   if ($navbarBurgers.length > 0) {
//
//     // Add a click event on each of them
//     $navbarBurgers.forEach( el => {
//       el.addEventListener('click', () => {
//
//         // Get the target from the "data-target" attribute
//         const target = el.dataset.target
//         const $target = document.getElementById(target)
//
//         // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
//         el.classList.toggle('is-active')
//         $target.classList.toggle('is-active')
//
//       })
//     })
//   }


//
// const elem = document.querySelector('.main-carousel')
//
// const flkty = new Flickity( elem, {
//   // options
//   cellAlign: 'left',
//   contain: true
// })


// // element argument can be a selector string
// //   for an individual element
// flkty = new Flickity( '.main-carousel', {
//   // options
// })




// let scroll = 0
//
// window.addEventListener('scroll', () => {
//   // const scrolled = window.scrollY
//   const scrolledY = window.pageYOffset
//   scroll += 10
//   // console.log('scrolled', scrolled)
//   console.log('scroll', scroll)
//   console.log('scrolledY', scrolledY)
// })
//
// // window.onscroll = function (e) {
// //   console.log('scrolled', scrolled) // Value of scroll Y in px
// // }
//
//
// document.addEventListener('DOMContentLoaded', () => {
//
//   const sammii = document.getElementById('landing-title-sammii')
//   // sammii.style.opacity = 0
//   // sammii.style.left = '1000px'
//   sammii.style.transform = 'translateX(1750px)'
//
//
// //   var sdegree = 0;
// //
// // $(window).scroll(function() {
// //
// //     sdegree ++ ;
// //     sdegree = sdegree + 2 ;
// //     var srotate = "rotate(" + sdegree + "deg)";
// //     $("img").css({"-moz-transform" : srotate, "-webkit-transform" : srotate});
// // });
//
//   let transform = 1700
//   let xtranslate
//
//   window.addEventListener('scroll', () => {
//     const scrolled = window.scrollY
//     console.log('transform', transform)
//
//     if (scrolled >= 0 && scrolled <= 400 && transform >= 200) {
//       // transform --
//       transform -= 50
//       xtranslate = `translateX(${transform}px)`
//       sammii.style.transform = xtranslate
//     }
//     if (scrolled >= 400 && transform <= 199) {
//       transform ++
//       transform = transform + 50
//       xtranslate = `translateX(${transform}px)`
//       sammii.style.transform = xtranslate
//     }
//
//   // if (scrolled <= 500 || transform <= 150 && transform >= 0) {
//
//     // if (scrolled >= 25) {
//     //   sammii.style.transform = 'translateX(125px)'
//     // }
//     // if (scrolled >= 50) {
//     //   // sammii.style.opacity = 0.25
//     //   // sammii.style.left = '750px'
//     //   sammii.style.transform = 'translateX(750px)'
//     // }
//     // if (scrolled >= 75) {
//     //   // sammii.style.opacity = 0.5
//     //   // sammii.style.left = '500px'
//     //   sammii.style.transform = 'translateX(500px)'
//     // }
//     // if (scrolled >= 100) {
//     //   // sammii.style.opacity = 0.75
//     //   // sammii.style.left = '250px'
//     //   sammii.style.transform = 'translateX(250px)'
//     // }
//     // if (scrolled >= 125) {
//     //   // sammii.style.opacity = 1
//     //   // sammii.style.left = '0px'
//     //   sammii.style.transform = 'translateX(0px)'
//     // }
//   })
// })


// For bulma navbar
// if vw < 450px apply 'is-active' class on navbar
