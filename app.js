console.log('JS loaded 🐛')


document.addEventListener('DOMContentLoaded', () => {
  const navbarBurger = document.getElementById('navbar-burger')
  const navbarMenu = document.getElementById('navbar-menu')
  const navbarItem = document.querySelectorAll('.navbar-item')
  const iconsToType = document.getElementById('icons-to-type')
  const list = document.querySelectorAll('.list-item')
  const icon = document.querySelectorAll('.icon')

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
      // if (item.classList.contains('is-active')) {
      //   navbarBurger.classList.toggle('is-active')
      //   navbarMenu.classList.toggle('is-active')
      // }
    })
  })

  // icons ? iconsToType.classList.toggle('is-active') : icons.innerHTML = 'Type'

  let icons = true
  // list.style.display = 'none'

  list.forEach(listItem => {
    listItem.classList.toggle('icon-to-list-is-active')
  })

  function toggleIcons() {
    if (icons) {
      iconsToType.innerHTML = 'Icons'
      icons = false
      // iconsToType.classList.toggle('is-active')
      icon.forEach(iconItem => {
        iconItem.classList.toggle('icon-to-list-is-active')
      })
      list.forEach(listItem => {
        listItem.classList.toggle('icon-to-list-is-active')
      })
    } else {
      iconsToType.innerHTML = 'List'
      icons = true
      // iconsToType.classList.toggle('is-active')
      list.forEach(listItem => {
        listItem.classList.toggle('icon-to-list-is-active')
      })
      icon.forEach(iconItem => {
        iconItem.classList.toggle('icon-to-list-is-active')
      })
    }
  }

  iconsToType.addEventListener('click', () => {
    console.log('iconsToType Click 🍕')
    toggleIcons()
    console.log('icons', icons)
  })

})




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
