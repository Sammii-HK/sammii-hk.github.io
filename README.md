# Portfolio

[Live site](https://sammii.dev)

## Details

A front-end application serving as a portfolio showcasing my development projects.

### Time Frame

2 days

### Technologies

- Next
- Typescript
- CSS

### App Overview

I have always intended for my portfolio designs to be clean, crisp and minimal to act as a gallery for the work, but with an element to surprise in an understated way, which is the 'holographic shiny' effect on the 'sammii' svg at the top of the page.

#### Development Process

As this application serves as my portfolio I wanted to create an easy way to update and append the information on my projects so have written all the information as JSON.

##### Noteworthy Items

The holographic shiny effect is created with a script which creates 3 radial gradients which are created with 3 values serving as `R`, `G` & `B` values for the colour, based on user cursor/touch position within the viewport. I interchanged the 3 colours for each of the 3 radial gradients to create the effect of the colours moving around within the typography.

```JS
export const gradientCreator = (xPc: number, yPc: number) => {
  const colourCreator = (number: number) => {
    const colour = Math.floor((255 / 100) * number)
    return colour < 255 ? Math.floor((255 / 100) * number) : 255;
  };
  
  const colour1 = colourCreator(xPc);
  const colour2 = colourCreator(yPc);
  const colour3 = 255 - colourCreator(xPc);
  
  return {
    background:
      `radial-gradient(
        circle at 50% 0,
        rgb(${colour1} ${colour3} ${colour2} / 50%),
        rgb(${colour1} ${colour3} ${colour2} / 0%) 70.71%
      ),
      radial-gradient(
        circle at 6.7% 75%,
        rgb(${colour3} ${colour2} ${colour1} / 50%),
        rgb(${colour3} ${colour2} ${colour1} / 0%) 70.71%
      ),
      radial-gradient(
        circle at 93.3% 75%,
        rgb(${colour2} ${colour1} ${colour3} / 50%),
        rgb(${colour2} ${colour1} ${colour3} / 0%) 70.71%
      ) white`
  };
}
```

#### Functionality

##### UX Journeys

As my portfolio has grown, and projects have become outdated and unmaintained, I have extended my portfolio to contain my 'archived' projects - projects which I have decided to not update so are unable to be used as a live project.

I Wanted this archive to be an extension of the showcase projects but with less priority, so have smaller project items which are more of an overview of several projects at once.

### Challenges & Achievements

My main achievement is the holographic shiny affect which I created, it took quite a few iterations but I think the effect I have achieved is very effective and is exactly what I sought out to achieve.

## Future Enhancements

- Improve the colour gradient change with touch events
